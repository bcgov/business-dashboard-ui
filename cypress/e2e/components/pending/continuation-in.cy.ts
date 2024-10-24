import { ContinuationAuthorizationPendingReview }
  from '../../../fixtures/filings/continuationApplication/continuation-authorization-pending-review'

context('Pending Section -> Continuation-In pending staff review', () => {
  it('Verifies the Pending section is displayed for a pending continuation-in filing', () => {
    cy.visitTempBusinessDash(ContinuationAuthorizationPendingReview, false)

    cy.get('[data-cy="header_pending"]')
      .should('exist')
      .contains('Pending')

    // subtitle
    cy.get('[data-cy="pendingItem-label-continuation-in"]')
      .should('exist')
      .should('contains.text', 'PENDING STAFF REVIEW')
      .should('contains.text', 'Submitted by')

    // View More button should exist and the content is expanded by default
    cy.get('[data-cy="pendingItem-showMore-continuation-in"]')
      .should('exist')
      .contains('Hide details')

    // content
    cy.get('[data-cy="pendingItem-content"]')
      .should('exist')
      .should(
        'contains.text',
        'BC Registries will review your documents and contact you with the results within 5 business days.'
      )
      .find('[data-cy="contact-info"]')
      .should('exist')
  })
})
