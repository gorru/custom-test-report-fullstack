var os = require('os');
var path = require('path');
var fs = require('fs');
var builder = require('xmlbuilder');
let outputFile;
let testElement;
let testStatus = "PASS"

var debug = require('debug')('mocha-jira-reporter');


var MochaJiraReporterUtilities = require('./jiraReporter')
// var g = typeof(window) === 'undefined' ? global : window;

global.mochaJiraReporterUtilities = new MochaJiraReporterUtilities("reporter");

// var Base = require("mocha").reporters.Base;

var constants =
    {
        /**
         * Emitted when {@link Hook} execution begins
         */
        EVENT_HOOK_BEGIN: 'hook',
        /**
         * Emitted when {@link Hook} execution ends
         */
        EVENT_HOOK_END: 'hook end',
        /**
         * Emitted when Root {@link Suite} execution begins (all files have been parsed and hooks/tests are ready for execution)
         */
        EVENT_RUN_BEGIN: 'start',
        /**
         * Emitted when Root {@link Suite} execution has been delayed via `delay` option
         */
        EVENT_DELAY_BEGIN: 'waiting',
        /**
         * Emitted when delayed Root {@link Suite} execution is triggered by user via `global.run()`
         */
        EVENT_DELAY_END: 'ready',
        /**
         * Emitted when Root {@link Suite} execution ends
         */
        EVENT_RUN_END: 'end',
        /**
         * Emitted when {@link Suite} execution begins
         */
        EVENT_SUITE_BEGIN: 'suite',
        /**
         * Emitted when {@link Suite} execution ends
         */
        EVENT_SUITE_END: 'suite end',
        /**
         * Emitted when {@link Test} execution begins
         */
        EVENT_TEST_BEGIN: 'test',
        /**
         * Emitted when {@link Test} execution ends
         */
        EVENT_TEST_END: 'test end',
        /**
         * Emitted when {@link Test} execution fails
         */
        EVENT_TEST_FAIL: 'fail',
        /**
         * Emitted when {@link Test} execution succeeds
         */
        EVENT_TEST_PASS: 'pass',
        /**
         * Emitted when {@link Test} becomes pending
         */
        EVENT_TEST_PENDING: 'pending',
        /**
         * Emitted when {@link Test} execution has failed, but will retry
         */
        EVENT_TEST_RETRY: 'retry',
        /**
         * Initial state of Runner
         */
        STATE_IDLE: 'idle',
        /**
         * State set to this value when the Runner has started running
         */
        STATE_RUNNING: 'running',
        /**
         * State set to this value when the Runner has stopped
         */
        STATE_STOPPED: 'stopped'
    }

var EVENT_TEST_PASS = constants.EVENT_TEST_PASS;
var EVENT_TEST_FAIL = constants.EVENT_TEST_FAIL;
var EVENT_RUN_END = constants.EVENT_RUN_END;
var EVENT_TEST_PENDING = constants.EVENT_TEST_PENDING;
var EVENT_TEST_BEGIN = constants.EVENT_TEST_BEGIN;
var EVENT_TEST_END = constants.EVENT_TEST_END;
var STATE_PASSED = 'passed';

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

/**
 * Initialize a new test reporter.
 *
 * @param {Runner} runner
 * @param {Object} opts mocha options
 * @api public
 */
const MochaJiraReporter = function (runner, opts) {

        var options = {};
        // Base.call(this, runner, options);
        var reporterConfig = {}; //config.karmaJiraReporter || {};

        // outputFile = helper.normalizeWinPath(path.resolve(config.basePath, reporterConfig.outputFile ||
        //     'test-results' + (new Date().toISOString().replace(/:|\./g, '_')) + '.xml'))

        var tests = [];
        var self = this;

        // the name of the test suite, as it will appear in the resulting XML file
        var suiteName;

        var xml;
        var suiteElement;
        var pendingFileWritings = 0;
        var fileWritingFinished = function () {
        };

        var timestamp;

        // var initializeXmlForBrowser = function (browser) {
        //     var timestamp = (new Date()).toISOString().substr(0, 19);
        //     suiteElement[browser.id] = xml.ele('suite', {
        //         id: 0, name: os.hostname()
        //     });
        // };

        // runner.on('end', function () {
        //
        // }.bind(this));
        //
        // runner.on("start", function () {
        // });

        runner.on("suite", function (suite) {
            // suite maps to report TEST item

            // g.mochaJiraReporterUtilities = new MochaJiraReporterUtilities();

            timestamp = (new Date());

            // var outputFile = 'myMochaReport_' + timestamp.yyyyMMdd() + '.xml';
            // outputFile = 'myMochaReport.xml';
            debug('creating report file', outputFile);

            // Creating testsuites for output junit xml file

            xml = builder.create('robot');

            timestamp = (new Date());
            xml.att('generated', timestamp.yyyyMMdd());
            xml.att('generator', 'karma-jira-reporter on ' + os.platform());

            let metadata, issueId, tags, testName;

            metadata = suite.title.split(' - ');
            issueId = '';
            tags = [];

            testName = suite.title;
            if (metadata && (metadata.length > 1)) {
                testName = metadata[0].split(':')[1].trim();
                issueId = metadata[1].split(':')[1].trim();
                tags = metadata[2].split(':')[1].split(',');
                tags = tags ? tags : [];
            }

            suiteElement = xml.ele('suite', {
                id: 0, name: os.hostname()
            });

            testElement = suiteElement.ele('test', {
                id: issueId,
                name: testName
            });

            let tagsElement = testElement.ele('tags');
            tags.forEach(tag => {
                tagsElement.ele('tag', tag.trim());
            })

            outputFile = `results/reports/${testName}_${timestamp.yyyyMMdd()}.xml`.replaceAll(':', "_" + "");

            // }

        }.bind(this));

        // runner.on("suite end", function () {
        //
        //     var suite = suiteElement;
        //
        //     if (!suite) {
        //         // This browser did not signal `onBrowserStart`. That happens
        //         // if the browser timed out during the start phase.
        //         return;
        //     }
        //
        // }.bind(this));

        runner.on(EVENT_TEST_BEGIN, function (test) {
            test.startTime = new Date();
            tests.push(test);
        }.bind(this));

        runner.on(EVENT_TEST_END, function (test) {

            let kwMetadata, kwIssueId, kwTags, kwName;

            kwMetadata = test.title.split(' - ');
            kwIssueId = undefined;
            // kwTags = [];
            kwName = test.title;

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

            let status = test.state !== STATE_PASSED ? 'FAIL' : 'PASS';

            let kwStatusElement = kwElement.ele(
                'status',
                {
                    'status': status,
                    'starttime': test.startTime.yyyyMMdd(),
                    'endtime': test.endTime? test.endTime.yyyyMMdd(): 0
                })
            ;

            if (test.state !== STATE_PASSED) {
                kwStatusElement.txt(test.err.message + '\n' + test.err.stack);

                testElement.ele('status', {'status': status})
            }
        }.bind(this));

        // runner.on(EVENT_TEST_PENDING, function (test) {
        //     tests.push(test);
        // }.bind(this));

        runner.on(EVENT_TEST_PASS, function (test) {
            test.endTime = new Date(test.startTime + (test.duration || 0));
            // tests.push(test);
        }.bind(this));

        runner.on(EVENT_TEST_FAIL, function (test) {
            test.endTime = new Date(test.startTime + (test.duration || 0));
            // tests.push(test);
        }.bind(this));

        runner.once(EVENT_RUN_END, function () {
            var xmlToOutput = xml;
            fs.writeFile(outputFile, xmlToOutput.end({pretty: true}), function (err) {
                if (err) {
                    debug('Cannot write JUnit xml\n\t' + err.message);
                } else {
                    debug('JUnit results written to "%s"', outputFile);
                }
                if (!--pendingFileWritings) {
                    fileWritingFinished();
                }
            });

            suiteElement = xml = null;
        }.bind(this));

        tests.forEach(function (t) {
            self.test(t);
        });

        /**
         * Output tag for the given `test.`
         *
         * @param {Test} test
         */
        test = function (test) {

        };
    }
;

// PUBLISH MODULE
module.exports = MochaJiraReporter;
