// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-junit-xray-reporter '),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../coverage/frontend-angular-basic-auth-login-logout'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml', 'junitxray'],
    junitXrayReporter: {
      metadataFile: 'unit-tests/meta-data.json', // optional path and name of metadataFile
      outputFile: 'unit-tests/result-output.xml', // optional path and name of the output file
      suite: '', // suite will become the package name attribute in xml testsuite element
      xrayIdOnly: false //(default false) set it to true to process only the tests that have xrayId like :XRAY-ID:XRAY-123: in the tests name for e.g ':XRAY-ID:XRAY-123: test to validate params'
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};
