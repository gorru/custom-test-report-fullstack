/// <reference types="cypress" />

context('Window', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/')
  })

  it('should contain All Courses title', () => {
    // https://on.cypress.io/window
    cy.contains('All Courses')
  })

  it('should contain Button Add', () => {
    // https://on.cypress.io/title
    cy.get('.btn-success').should('contain', 'Add')
  })
})
