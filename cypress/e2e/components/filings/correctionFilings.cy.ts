import { BusinessRegistryStaffRoles } from '../../../../tests/test-utils/test-authorized-actions'
import { allFilings } from '../../../fixtures/filings/allFilings'
import { administrativeDissolution } from '../../../fixtures/filings/dissolution/administrativeDissolution'
import { incorporationApplication } from '../../../fixtures/filings/incorporationApplication/incorporationApplication'
import { businessCorpsDev } from '../../../fixtures/origins'

context('Correction Filings', () => {
  it('Non staff don\'t get option', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, false)

    cy.get('[data-cy="header.actions.dropdown"]').should('not.exist')
  })

  it('Staff should be able to file a correction', () => {
    Cypress.on('uncaught:exception', (error: Error) => {
      // returning false here prevents Cypress from failing the test for the postMessage error that happens sometimes
      console.error('Caught error', error)
      return !error.stack?.includes('PrimaryOriginCommunicator.toSource')
    })

    cy.visitBusinessDashFor(
      'businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, true, BusinessRegistryStaffRoles
    )
    cy.intercept('POST', '**/api/v2/businesses/**/filings?draft=true', {
      filing: {
        header: {
          filingId: '12345'
        }
      }
    }).as('correctionFilingsPost')

    cy.get('[data-cy="header.actions.dropdown"]').should('exist')
    cy.get('[data-cy="header.actions.dropdown"]').first().click()
    cy.get('[data-cy="header.actions.dropdown"] .fileACorrection').click()
    cy.get('input[name="correctionType"]').should('exist')
    cy.get('input[name="correctionType"]').first().click()
    cy.get('[data-cy="correctionForm.submit"]').should('exist')
    cy.get('[data-cy="correctionForm.submit"]').click()
    cy.wait('@correctionFilingsPost')

    // Navigate to the Business Corps Dev origin (flag is enabled by default in ldarklyContext.json)
    cy.origin(businessCorpsDev, () => {
      cy.get('body', { timeout: 10000 }).should('exist')
    })
  })

  it('Non-corp entity (CP) should route to Edit UI for corrections', () => {
    Cypress.on('uncaught:exception', (error: Error) => {
      console.error('Caught error', error)
      return !error.stack?.includes('PrimaryOriginCommunicator.toSource')
    })

    cy.visitBusinessDashFor(
      'businessInfo/cp/active.json',
      undefined,
      false,
      false,
      undefined,
      [incorporationApplication],
      true,
      BusinessRegistryStaffRoles
    )
    cy.intercept('POST', '**/api/v2/businesses/**/filings?draft=true', {
      filing: {
        header: {
          filingId: '12345'
        }
      }
    }).as('correctionFilingsPost')

    // Intercept the redirect to Edit UI
    cy.intercept('GET', '**/correction/**').as('getEditUICorrection')

    // Target the Incorporation Application filing (COMPLETED)
    cy.get('[data-cy="header.actions.dropdown"]').should('exist')
    cy.get('[data-cy="header.actions.dropdown"]').first().click()
    cy.get('[data-cy="header.actions.dropdown"] .fileACorrection').click()
    cy.get('input[name="correctionType"]').should('exist')
    cy.get('input[name="correctionType"]').first().click()
    cy.get('[data-cy="correctionForm.submit"]').should('exist')
    cy.get('[data-cy="correctionForm.submit"]').click()
    cy.wait('@correctionFilingsPost')

    // Verify it navigates to Edit UI (not Business Corps UI)
    cy.wait('@getEditUICorrection')
      .its('request.url')
      .should('include', '/correction/')
      .should('include', 'correction-id=12345')
  })

  it("Staff shouldn't be able to file a correction against an invalid type", () => {
    cy.visitBusinessDashFor(
      'businessInfo/ben/active.json',
      undefined,
      false,
      false,
      undefined,
      [administrativeDissolution],
      true,
      BusinessRegistryStaffRoles
    )
    cy.intercept('POST', '**/api/v2/businesses/**/filings', {}).as('correctionFilingsPost')

    cy.get('[data-cy="header.actions.dropdown"]').should('exist')

    // open the dropdown for the administrative dissolution in the Filing History; correction option should be disabled
    cy.get('[data-cy="header.actions.dropdown"]').first().click()
    cy.get('[data-cy="header.actions.dropdown"] .fileACorrection').should('have.attr', 'aria-disabled')
    cy.get('[data-cy="header.actions.dropdown"] .fileACorrection').invoke('attr', 'aria-disabled').should('eq', 'true')
  })
})
