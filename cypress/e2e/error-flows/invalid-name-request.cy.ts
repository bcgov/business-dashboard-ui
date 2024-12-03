import { StatusCodes } from 'http-status-codes'
import { IncorporationApplicationWithNr } from '../../fixtures/filings/draft/incorporation-application-with-nr'
import { IncorporationApplicationNr } from '../../fixtures/name-requests/incorporationApplication'
import { NameRequestStateE } from '../../../src/enums/name-request-states-e'

context('Temporary business with invalid name request', () => {
  let nameRequest = undefined

  beforeEach(() => {
    nameRequest = Object.assign({}, IncorporationApplicationNr)
  })

  it('should redirect to the error page and show invalid name request modal - NR expired', () => {
    nameRequest.state = NameRequestStateE.EXPIRED
    cy.intercept('GET', '**/api/v2/nameRequests/**/validate**', nameRequest).as('nameRequest')
    cy.visitTempBusinessDash(IncorporationApplicationWithNr, false)
    cy.wait('@nameRequest')
    cy.url().should('contain', 'errors/entity')
    cy.get('[data-cy="bcros-dialog-text"]').should('contain', 'The name request has expired.')
  })

  it('should redirect to the error page and show invalid name request modal - NR consumed', () => {
    nameRequest.state = NameRequestStateE.CONSUMED
    cy.intercept('GET', '**/api/v2/nameRequests/**/validate**', nameRequest).as('nameRequest')
    cy.visitTempBusinessDash(IncorporationApplicationWithNr, false)
    cy.wait('@nameRequest')
    cy.url().should('contain', 'errors/entity')
    cy.get('[data-cy="bcros-dialog-text"]').should('contain', 'The name request has already been consumed.')
  })

  it('should redirect to the error page and show invalid name request modal - NR not approved', () => {
    nameRequest.state = NameRequestStateE.NOT_APPROVED
    cy.intercept('GET', '**/api/v2/nameRequests/**/validate**', nameRequest).as('nameRequest')
    cy.visitTempBusinessDash(IncorporationApplicationWithNr, false)
    cy.wait('@nameRequest')
    cy.url().should('contain', 'errors/entity')
    cy.get('[data-cy="bcros-dialog-text"]').should('contain', 'The name request has not been approved.')
  })

  it('should redirect to the error page and show invalid name request modal - NR awaiting consent', () => {
    nameRequest.state = NameRequestStateE.CONDITIONAL
    nameRequest.consentFlag = 'Y'
    cy.intercept('GET', '**/api/v2/nameRequests/**/validate**', nameRequest).as('nameRequest')
    cy.visitTempBusinessDash(IncorporationApplicationWithNr, false)
    cy.wait('@nameRequest')
    cy.url().should('contain', 'errors/entity')
    cy.get('[data-cy="bcros-dialog-text"]').should('contain', 'The name request number is awaiting consent.')
  })

  it('should redirect to the error page and show invalid name request modal - error fetching NR', () => {
    cy.intercept('GET', '**/api/v2/nameRequests/**/validate**', { statusCode: StatusCodes.BAD_REQUEST }).as('nameRequest')
    cy.visitTempBusinessDash(IncorporationApplicationWithNr, false)
    cy.wait('@nameRequest')
    cy.url().should('contain', 'errors/entity')
    cy.get('[data-cy="bcros-dialog-text"]').should('contain', 'An unexpected error has occurred.')
  })
})
