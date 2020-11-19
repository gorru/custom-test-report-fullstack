/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const cypressTypeScriptPreprocessor = require('./cy-ts-preprocessor')
const installLogsPrinter = require('cypress-terminal-report/src/installLogsPrinter');
// MochaJiraReporterUtilities = require('../../reporters/mocha-jira-reporter/index')
// global.mochaJiraReporterUtilities = new MochaJiraReporterUtilities("plugin");

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
    // mochaJiraReporterUtilities = new MochaJiraReporterUtilities("plugin");

    installLogsPrinter(on);
    on('file:preprocessor', cypressTypeScriptPreprocessor);
    // on('task', {
    //     addMetadata(metadata){
    //         global.mochaJiraReporterUtilities.addTestSuiteDescription(metadata);
    //         return null;
    //     }
    // })
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
    return config;
}
