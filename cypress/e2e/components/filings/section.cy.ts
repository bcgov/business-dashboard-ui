import { allFilings } from '../../../fixtures/filings/allFilings'
import { directorChange } from '../../../fixtures/filings/directorChange/directorChange'
import { administrativeDissolution } from '../../../fixtures/filings/dissolution/administrativeDissolution'
import { courtOrder } from '../../../fixtures/filings/staffFiling/courtOrder'
import { adminFreeze, adminFreezeWithDisplayLedgerTrue } from '../../../fixtures/filings/staffFiling/adminFreeze'
import { ContinuationRejected } from '../../../fixtures/filings/continuationApplication/continuation-rejected'

context('Filings history section', () => {
  it('Verifies filing history is displayed, and it shows data', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, allFilings)

    cy.get('[data-cy="filingHistoryItem-header"]').should('have.length', allFilings.length)

    cy.get('[data-cy="filingHistoryItem-header"]').each((header, index) => {
      cy.wrap(header).should('contain.text', allFilings[index].displayName)
    })
  })

  it('Verifies body of the filings -- document list, court number', () => {
    // director change verification aka, verify body list
    const filings = [directorChange, administrativeDissolution]
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, filings)

    cy.fixture('filings/directorChange/documentList.json').then((response) => {
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

  it('Verifies body of the filings -- details (comments)', () => {
    const filings = [directorChange, administrativeDissolution]
    cy.fixture('filings/directorChange/commentList.json').then((response) => {
      cy.intercept(
        'GET',
        `**/api/v2/businesses/**/filings/${directorChange.filingId}/comments`,
        response).as('detailsList')
      cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, filings)

      cy.get('[data-cy="details-list"]').should('not.exist')

      // expand filing
      cy.get(`[data-cy="filingHistoryItem-default-filing-${directorChange.filingId}"]`)
        .find('[data-cy="filing-main-action-button"]')
        .click()

      // cy.wait('@detailsList')

      cy.get('[data-cy="details-list"]').should('exist')
      cy.get('[data-cy="details-list"]').contains('Details (2)')
      cy.get('[data-cy="details-list"]').contains('this is another comment... test 123')
      cy.get('[data-cy="details-list"]').contains('Test adding STAFF comments')

      // collapse filing
      cy.get(`[data-cy="filingHistoryItem-default-filing-${directorChange.filingId}"]`)
        .find('[data-cy="filing-main-action-button"]')
        .click()

      cy.get('[data-cy="details-list"]').should('not.exist')
    })
  })

  it('Verifies that if there is a court order, displays notification and verifies expanded court order', () => {
    const filings = [courtOrder]
    cy.visitBusinessDashFor('businessInfo/cc/withCourtOrder.json', undefined, false, false, undefined, filings)

    // verify notification
    cy.get('[data-cy="hasCourtOrdersNotificationCard"]').should('exist')

    // expand filing
    cy.get(`[data-cy="filingHistoryItem-staff-filing-${courtOrder.filingId}"]`)
      .find('[data-cy="filing-main-action-button"]')
      .click()

    cy.get(`[data-cy="filingHistoryItem-staff-filing-${courtOrder.filingId}"]`)
      .contains('Pursuant to a Plan of Arrangement')
    cy.get(`[data-cy="filingHistoryItem-staff-filing-${courtOrder.filingId}"]`)
      .contains(`Court Order Number: ${courtOrder.data.order.fileNumber}`)
  })

  it('Verifies that admin freeze is not displayed (when it has displayLedger set to false)', () => {
    const filings = [courtOrder, courtOrder, adminFreeze]
    cy.visitBusinessDashFor('businessInfo/cc/withCourtOrder.json', undefined, false, false, undefined, filings)

    // verify we cant see admin freeze
    cy.contains('Admin Freeze').should('not.exist')

    cy.get('[data-cy*="filingHistoryItem-staff"]').should('have.length', 2)
  })

  it('Verifies that admin unfreeze is displayed when it has displayLedger set to true', () => {
    const filings = [adminFreeze, adminFreezeWithDisplayLedgerTrue]
    cy.visitBusinessDashFor('businessInfo/cc/withCourtOrder.json', undefined, false, false, undefined, filings)

    // verify we cant see admin freeze
    cy.contains('Admin Freeze').should('exist')

    cy.get('[data-cy*="filingHistoryItem-staff"]').should('have.length', 1)
  })

  it('Verifies body of the filings -- rejected Continuation-in Application', () => {
    cy.visitTempBusinessDash(ContinuationRejected, false)
    cy.get('[data-cy="filingHistoryItem-header"]')
      .should('have.length', 1)
      .should('contain.text', 'REJECTED')

    // expand filing
    cy.get('[data-cy="filing-main-action-button"]').click()

    cy.get('[data-cy="filingHistoryItem-body"]')
      .should('exist')
      .should('contain.text', 'Review the reasons your continuation authorization was rejected below:')
      .should('contain.text', 'Please submit a new application if you’d like to continue your business into B.C.')
  })
})
