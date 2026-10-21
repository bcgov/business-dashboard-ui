// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import { requestLog } from './commands'
import 'cypress-axe'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// With retries enabled Cypress only reports the error of the FINAL attempt, so a test that fails once and
// then passes leaves no trace of why. Log every failed attempt to the runner output for flake diagnosis.
beforeEach(() => {
  requestLog.length = 0
})

afterEach(function () {
  const test = this.currentTest
  if (test?.state === 'failed') {
    const reason = test.err?.message?.split('\n')[0] ?? 'unknown error'
    cy.task('log', `[flaky-attempt ${test.currentRetry() + 1}] ${test.fullTitle()} -> ${reason}`)
    const seen = `api requests seen (${requestLog.length}):\n  ${requestLog.join('\n  ')}`
    cy.task('log', `[flaky-attempt ${test.currentRetry() + 1}] ${seen}`)
  }
})
