import { directorChange } from '../../fixtures/filings/directorChange/directorChange'

context('Download Error', () => {
  it('verify the document download error dialog occur when downloading fails', () => {
    const filings = [directorChange]
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, filings)
    cy.fixture('filings/directorChange/documentList.json').then((response) => {
      cy.intercept(
        'GET',
        `**/api/v2/businesses/**/filings/${directorChange.filingId}/documents`,
        response).as('directorChangeDocumentList')
    })

    // expand filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${directorChange.filingId}"]`)
      .find('[data-cy="filing-main-action-button"]')
      .click()
      .wait('@directorChangeDocumentList')

    // simulate download error
    cy.intercept('GET', '**/api/v2/businesses/**/filings/**/documents/receipt', { statusCode: 500 })
      .as('downloadError')
    
    // attempt to download a file; the error dialog should appear
    cy.get('[data-cy="download-document-button-Receipt"]').click()
      .wait('@downloadError')
      .get('[data-cy="bcros-dialog-downloadError"]').should('exist')
      .should('contain.text', 'Unable to Download Document')
  })
})
