context('Business Dash Auth Error Handling', () => {
  it('should display error modal', () => {
    cy.visitBusinessDashAuthError()
    cy.get('[data-cy="bcros-dialog"]').should('exist')
    cy.get('[data-cy="bcros-dialog"]').find('h1').should('have.text', 'Business Dashboard Unavailable')
    cy.get('[data-cy="bcros-dialog"]').find('[data-cy="bcros-dialog-text"]').find('p')
      .should('contain.text', 'application is currently unavailable')
    cy.get('[data-cy="bcros-dialog"]').find('[data-cy="contact-icon"]').should('exist')
    cy.get('[data-cy="bcros-dialog"]').find('[data-cy="contact-label"]').should('exist')
    cy.get('[data-cy="bcros-dialog"]').find('[data-cy="contact-value"]').should('exist')
    cy.get('[data-cy="bcros-dialog"]').find('[data-cy="bcros-dialog-btn"]').should('exist')
  })

  it('should redirect to error page and show modal', () => {
    cy.visitBusinessDashAuthError('BC0871429', 'BEN', 'EntityAuthError')
    cy.url().should('contain', 'errors/entity')
    cy.get('[data-cy="bcros-dialog-text"]').should('exist')
    cy.get('[data-cy="bcros-dialog-text"]').should('contain',
      'Your account is currently unable to access this Business. This may be because of the following:')

  })
})
