context('Business Dash Auth Error Handling', () => {
  beforeEach(() => {
    cy.visitBusinessDashAuthError()
  })

  it('should display error modal', () => {
    cy.get('[data-cy="bcros-dialog"]').should('exist')
    cy.get('[data-cy="bcros-dialog"]').find('h1').should('have.text', 'Business Dashboard Unavailable')
    cy.get('[data-cy="bcros-dialog"]').find('[data-cy="bcros-dialog-text"]').find('p')
      .should('contain.text', 'application is currently unavailable')
    cy.get('[data-cy="bcros-dialog"]').find('[data-cy="contact-icon"]').should('exist')
    cy.get('[data-cy="bcros-dialog"]').find('[data-cy="contact-label"]').should('exist')
    cy.get('[data-cy="bcros-dialog"]').find('[data-cy="contact-value"]').should('exist')
    cy.get('[data-cy="bcros-dialog"]').find('[data-cy="bcros-dialog-btn"]').should('exist')
  })
})
