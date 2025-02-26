// ***********************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Import Testing Library commands for Cypress
// @testing-library/cypress v8.0.0
import '@testing-library/cypress/add-commands'

// Prevent Cypress from failing tests when the application
// throws uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})

// Global beforeEach hook to set up consistent test environment
beforeEach(() => {
  // Clear localStorage to ensure a clean state
  cy.clearLocalStorage()
  
  // Visit the application
  cy.visit('/')
})