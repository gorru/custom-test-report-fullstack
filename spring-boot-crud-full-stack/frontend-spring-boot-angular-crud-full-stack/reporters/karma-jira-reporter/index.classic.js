var os = require('os');
var path = require('path');
var fs = require('fs');
var builder = require('xmlbuilder');
let outputFile;

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
        var pkgName = reporterConfig.suite || '';

        outputFile = helper.normalizeWinPath(path.resolve(config.basePath, reporterConfig.outputFile ||
            'test-results' + (new Date().toISOString().replace(/:|\./g, '_')) + '.xml'));

        let metadataFile = helper.normalizeWinPath(path.resolve(config.basePath, reporterConfig.metadataFile ||
            'metadata.json'));

        var xml;
        var suiteElement;
        var testElement;
        var pendingFileWritings = 0;
        var fileWritingFinished = function () {
        };
        var allMessages = [];

        var timestamp;

        baseReporterDecorator(this);

        this.adapters = [function (msg) {
            allMessages.push(msg);
        }];

        var initliazeXmlForBrowser = function (browser) {
            var timestamp = (new Date()).toISOString().substr(0, 19);
            suiteElement[browser.id] = xml.ele('suite', {
                id: 0, name: os.hostname()
            });
        };

        this.onRunStart = function (browsers) {
            // Create metadata file and write it on the disk
            const TEAMCITY_BUILDCONF_NAME = 'TEAMCITY_BUILDCONF_NAME';
            let envFields = ['BUILD_VCS_NUMBER', 'JAVA_HOME', 'JRE_HOME', 'LANG', 'LOGNAME', 'NODE_PATH', 'NVM_BIN', 'NVM_PATH',
                'SHELL', 'TEAMCITY_BUILD_PROPERTIES_FILE', 'TEAMCITY_GIT_PATH', 'TEAMCITY_PROCESS_FLOW_ID',
                'TEAMCITY_PROJECT_NAME', 'TEAMCITY_VERSION', 'XDG_SESSION_ID'];
            let jiraProjectKey = '',
                envProperties;
            if (process.env.jiraProjectKey) {
                jiraProjectKey = process.env.jiraProjectKey
            } else if (reporterConfig.jiraProjectKey) {
                jiraProjectKey = reporterConfig.jiraProjectKey;
            }
            log.debug('reporterConfig: ' + JSON.stringify(reporterConfig));

            let buildConfName = process.env[TEAMCITY_BUILDCONF_NAME],
                buildNumber = process.env.BUILD_NUMBER;

            if (buildNumber) {
                buildNumber = buildNumber.trim();
            }
            if (!buildConfName) {
                buildConfName = 'Local Run by ' + process.env.USER;
            }

            buildConfName += `- branch: ${process.env.branchName}`;

            if (buildNumber === 'TBD') {
                buildConfName += ` - buildCounter: ${process.env.buildVersion}`;
                buildNumber = 'TC Build Number: ' + buildNumber;
            }

            envProperties = {
                BRANCH_NAME: process.env.branchName,
                BUILD_NUMBER: buildNumber,
                TEAMCITY_BUILDCONF_NAME: buildConfName,
                buildCounter: process.env.buildVersion,
                npm_config_globalconfig: process.env.npm_config_globalconfig,
                npm_config_node_version: process.env.npm_config_node_version,
                npm_package_name: process.env.npm_package_name,
                npm_package_dependencies_karma_webpack: process.env.npm_package_dependencies_karma_webpack,
                npm_package_devDependencies_karma_junit_xray_reporter: process.env.npm_package_devDependencies_karma_junit_xray_reporter
            }

            for (let key in process.env) {
                if (envFields.includes(key)) {
                    envProperties[key] = process.env[key];
                }
            }

            log.debug('envProperties: \n' + JSON.stringify(envProperties));

            let metadata = {
                jiraProjectKey: jiraProjectKey,
                envProperties: envProperties
            }
            log.debug('creating dir if they dont exist for metadata file path: ' + metadataFile);
            helper.mkdirIfNotExists(path.dirname(metadataFile), function () {
                fs.writeFile(metadataFile, JSON.stringify(metadata), (err) => {
                    if (err) {
                        log.error('Unable to write metadataFile: ' + metadataFile + ' with data: ' + metadata);
                        throw err;
                    }
                    log.info('Written metadataFile: "%s"', metadataFile);
                });
            });
            // Creating testsuites for output junit xml file
            suiteElement = Object.create(null);
            xml = builder.create('robot');

            timestamp = (new Date());
            xml.att('generated', timestamp.yyyyMMdd());
            xml.att('generator', 'karma-jira-reporter on ' + os.platform());
        };


        this.onBrowserStart = function (browser) {
            initliazeXmlForBrowser(browser);
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

            testElement = suite[browser.id].ele('test', {
                id: xrayId,
                name: testName
            });
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
            let isXray = false,
                matadata = result.description && result.description.split(' - '),
                xrayId = '',
                tags = [],
                name = '';

            if (matadata && (matadata.length > 1)) {
                const xrayIdTag = matadata[1].trim();
                isXray = true;
                xrayId = matadata[0].split(':')[1].trim();
                tags = matadata[1].split(':')[1].split(',');
                tags = tags ? tags : [];
                name = matadata[2].split(':')[1].trim();
            } else {
                name = result.description
            }

            // Component tests are being identified by xrayId tag (e.g XRAY-123) present in the desc
            // If the tag is not found then no processing needed
            if (!isXray) {
                if (reporterConfig.xrayIdOnly === true) return;
                const NOT_DEFINED = 'Not defined';
                xrayId = NOT_DEFINED;
                name = result.description;
            }

            log.debug('isXray: ' + isXray + '| XRAY id tag: ' + xrayId);
            const describeValue = result.suite.join(' ').replace(/\./g, '_');
            var testElement = suiteElement[browser.id].ele('kw', {
                id: xrayId,
                name: name
            });

            let tagsElement = testElement.ele('tags');
            tags.forEach(tag => {
                tagsElement.ele('tag', tag);
            })

            let endTime = new Date(timestamp + (result.time || 0));

            let status = result.success?'PASS':'FAIL';

            let statusElement = testElement.ele(
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
                    statusElement.txt(formatError(err));
                });
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
