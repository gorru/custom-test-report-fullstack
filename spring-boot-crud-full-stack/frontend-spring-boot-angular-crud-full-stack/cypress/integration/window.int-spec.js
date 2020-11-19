/// <reference types="cypress" />
// var MochaJiraReporterUtilities = require('../../reporters/mocha-jira-reporter/jiraReporter')
// require('mocha-jira-reporter');
require('../../reporters/mocha-jira-reporter/index')
// var g = typeof(window) === 'undefined' ? global : window;
context('NAME: AppComponent - ISSUE-ID: 123 - TAGS: tag1, tag2, tag3', () => {
  // global.mochaJiraReporterUtilities = new MochaJiraReporterUtilities('test suite');
  beforeEach(() => {
    // cy.task('addMetadata', 'Prova Microfono!')

    //
    cy.visit('http://localhost:4200/')
  })

  it('NAME: should contain All Courses title - ISSUE-ID:some ID', () => {


    cy.contains('All Courses')

    // https://on.cypress.io/window
  })

  it('should contain Button Add (should fail!)', () => {
    // https://on.cypress.io/title
    cy.get('.btn-success').should('contain', 'Remove')
  })
})
