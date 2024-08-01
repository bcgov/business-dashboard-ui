import { allFilings } from '../../../fixtures/filings/allFilings'
import { directorChange } from '../../../fixtures/filings/directorChange/directorChange'
import { administrativeDissolution } from '../../../fixtures/filings/dissolution/administrativeDissolution'

context('Filings history section', () => {
  it('Verifies filing history is displayed, and it shows data', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, undefined, allFilings)

    cy.get('[data-cy="filingHistoryItem-header"]').should('have.length', allFilings.length)

    cy.get('[data-cy="filingHistoryItem-header"]').each((header, index) => {
      cy.wrap(header).should('contain.text', allFilings[index].displayName)
    })
  })

  it('Verifies body of the filings', () => {
    // director change verification aka, verify body list
    const filings = [directorChange, administrativeDissolution]
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, undefined, filings)

    cy.fixture(`filings/directorChange/documentList.json`).then((response) => {
      cy.intercept(
        'GET',
        `**/api/v2/businesses/**/filings/${directorChange.filingId}/documents`,
        response).as('directorChangeDocumentList')
    })

    cy.get('[data-cy="download-document-button-Director Change"]').should('not.exist')
    cy.get('[data-cy="download-document-button-Notice Of Articles"]').should('not.exist')
    cy.get('[data-cy="download-document-button-Receipt"]').should('not.exist')
    cy.get('[data-cy="download-document-button-downloadAll"]').should('not.exist')

    // expand filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${directorChange.filingId}"]`)
      .find('[data-cy="filing-main-action-button"]')
      .click()

    cy.wait('@directorChangeDocumentList')
    cy.get('[data-cy="download-document-button-Director Change"]').should('exist')
    cy.get('[data-cy="download-document-button-Notice Of Articles"]').should('exist')
    cy.get('[data-cy="download-document-button-Receipt"]').should('exist')
    cy.get('[data-cy="download-document-button-downloadAll"]').should('exist')

    // contract filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${directorChange.filingId}"]`)
      .find('[data-cy="filing-main-action-button"]')
      .click()

    // administrative dissolution verification
    // expand filing
    cy.get(`[data-cy="filingHistoryItem-staff-filing-${administrativeDissolution.filingId}"]`)
      .find('[data-cy="filing-main-action-button"]')
      .click()

    // filing number
    cy.get(`[data-cy="filingHistoryItem-staff-filing-${administrativeDissolution.filingId}"]`)
      .find('[data-cy="court-order-number"]')
      .should('exist')

    cy.get(`[data-cy="filingHistoryItem-staff-filing-${administrativeDissolution.filingId}"]`)
      .find('[data-cy="pursuant-to-a-plan"]')
      .should('exist')

    // contract filing
    cy.get(`[data-cy="filingHistoryItem-staff-filing-${administrativeDissolution.filingId}`)
      .find('[data-cy="filing-main-action-button"]')
      .click()

    cy.get(`[data-cy="filingHistoryItem-staff-filing-${administrativeDissolution.filingId}"]`)
      .find('[data-cy="court-order-number"]')
      .should('not.exist')

    cy.get(`[data-cy="filingHistoryItem-staff-filing-${administrativeDissolution.filingId}"]`)
      .find('[data-cy="pursuant-to-a-plan"]')
      .should('not.exist')
  })
})
