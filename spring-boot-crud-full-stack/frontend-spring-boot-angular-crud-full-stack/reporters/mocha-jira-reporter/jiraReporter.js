var debug = require('debug')('mocha-jira-reporter');

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

MochaJiraReporterUtilities = function (text) {
    this.testSuiteDescription = text;
    this.tests = [];

    this.getTestSuiteDescription = function () {
        return this.testSuiteDescription;
    }

    this.addTest = function (test) {
        this.tests.push(test);
    }

    this.addTestSuiteDescription = function (text) {
        this.testSuiteDescription = text;
    }
}

module.exports = MochaJiraReporterUtilities;
