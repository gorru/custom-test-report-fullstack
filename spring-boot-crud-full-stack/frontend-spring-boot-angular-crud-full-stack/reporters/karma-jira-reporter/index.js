var os = require('os');
var path = require('path');
var fs = require('fs');
var builder = require('xmlbuilder');
let outputFile;
let testElement;
let testStatus = "PASS"

Date.prototype.yyyyMMdd = function () {
    var yyyy = this.getFullYear().toString();
    var MM = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();

    var HH = this.getHours().toString();
    var mm = this.getMinutes().toString();
    var ss = this.getSeconds();
    var SS = this.getMilliseconds();

    return yyyy + (MM[1] ? MM : "0" + MM[0]) + (dd[1] ? dd : "0" + dd[0]) + "-" + HH + ":" + mm + ":" + ss + "." + SS;
}

var karmaJiraReporter = function (baseReporterDecorator, config, logger, helper, formatError) {
        var log = logger.create('reporter.karma-jira-reporter');
        var reporterConfig = config.karmaJiraReporter || {};

        // outputFile = helper.normalizeWinPath(path.resolve(config.basePath, reporterConfig.outputFile ||
        //     'test-results' + (new Date().toISOString().replace(/:|\./g, '_')) + '.xml'));

        var xml;
        var suiteElement;
        var pendingFileWritings = 0;
        var fileWritingFinished = function () {
        };
        var allMessages = [];

        var timestamp;

        baseReporterDecorator(this);

        this.adapters = [function (msg) {
            allMessages.push(msg);
        }];

        var initializeXmlForBrowser = function (browser) {
            var timestamp = (new Date()).toISOString().substr(0, 19);
            suiteElement[browser.id] = xml.ele('suite', {
                hostname: os.hostname()
            });
        };

        this.onRunStart = function (browsers) {
            xml = builder.create('robot');
            suiteElement = Object.create(null);

            timestamp = (new Date());
            xml.att('generated', timestamp.yyyyMMdd());
            xml.att('generator', 'karma-jira-reporter on ' + os.platform());
        };


        this.onBrowserStart = function (browser) {
            initializeXmlForBrowser(browser);
        };

        this.onBrowserComplete = function (browser) {
            var suite = suiteElement[browser.id];

            if (!suite) {
                // This browser did not signal `onBrowserStart`. That happens
                // if the browser timed out duging the start phase.
                return;
            }

            var result = browser.lastResult;

            suite.att('tests', result.total);
            suite.att('errors', result.disconnected || result.error ? 1 : 0);
            suite.att('failures', result.failed);
            suite.att('time', (result.netTime || 0) / 1000);
        };

        this.onRunComplete = function () {
            var xmlToOutput = xml;

            pendingFileWritings++;
            helper.mkdirIfNotExists(path.dirname(outputFile), function () {
                fs.writeFile(outputFile, xmlToOutput.end({pretty: true}), function (err) {
                    if (err) {
                        log.warn('Cannot write JUnit xml\n\t' + err.message);
                    } else {
                        log.debug('JUnit results written to "%s"', outputFile);
                    }
                    if (!--pendingFileWritings) {
                        fileWritingFinished();
                    }
                });
            });

            suiteElement = xml = null;
            allMessages.length = 0;
        };

        this.specSuccess = this.specFailure = function (browser, result) {

            // suite maps to TEST report item
            if (suiteElement[browser.id].children.length == 0) {

                let testMetadata, testIssueId, testTags;
                let testName = result.description.replace(result.fullName, "")

                testMetadata = result.fullName.replace(result.description, "").split(' - ');
                testIssueId = '';
                testTags = [];

                if (testMetadata && (testMetadata.length > 1)) {
                    testName = testMetadata[0].split(':')[1].trim();
                    testIssueId = testMetadata[1].split(':')[1].trim();
                    testTags = testMetadata[2].split(':')[1].split(',');
                    testTags = testTags ? testTags : [];
                }

                testElement = suiteElement[browser.id].ele('test', {
                    id: testIssueId,
                    name: testName
                });

                let tagsElement = testElement.ele('tags');
                testTags.forEach(tag => {
                    tagsElement.ele('tag', tag.trim());
                })
                let outputDir = path.resolve(config.basePath, reporterConfig.outputDir);
                outputFile = helper.normalizeWinPath(path.resolve(outputDir,
                    testName + '_' + (new Date().toISOString().replace(/:|\./g, '_')) + '.xml'));
            }

            //tests maps to KW report items

            let kwMetadata, kwIssueId, kwTags, kwName;

            kwMetadata = result.description.split(' - ');
            kwIssueId = '';
            kwTags = [];
            kwName = result.description;

            if (kwMetadata && (kwMetadata.length > 1)) {
                kwName = kwMetadata[0].split(':')[1].trim();
                kwIssueId = kwMetadata[1].split(':')[1].trim();
                // kwTags = kwMetadata[2].split(':')[1].split(',');
                // kwTags = kwTags ? kwTags : [];
            }

            let kwElement = testElement.ele('kw', {
                issueID: kwIssueId,
                name: kwName
            });

            let endTime = new Date(timestamp + (result.time || 0));

            let status = result.success ? 'PASS' : 'FAIL';

            let kwStatusElement = kwElement.ele(
                'status',
                {
                    'status': status,
                    'starttime': timestamp.yyyyMMdd(),
                    'endtime': endTime.yyyyMMdd()
                })
            ;

            if (!result.success) {
                result.log.forEach(function (err) {
                    // testElement.ele('failure', {type: ''}, formatError(err));
                    kwStatusElement.txt(formatError(err));
                });
            }

            if (!result.success) {
                testElement.ele('status', {'status': status})
            }

        };

// wait for writing all the xml files, before exiting
        this.onExit = function (done) {
            if (pendingFileWritings) {
                fileWritingFinished = done;
            } else {
                done();
            }
        };
    }
;

karmaJiraReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'helper', 'formatError'];

// PUBLISH MODULE
module.exports = {
    'reporter:karmaJiraReporter': ['type', karmaJiraReporter]
};
