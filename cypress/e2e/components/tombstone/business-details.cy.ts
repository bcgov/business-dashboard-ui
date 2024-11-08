context('Business tombstone - business detail section', () => {
  it('Verify the business detail section is rendered for SP/GP businesses', () => {
    cy.visitBusinessDashFor('businessInfo/sp/active.json')

    cy.get('[data-cy="business-details"]')
      .should('contain', 'Registration Date')
      .should('contain', 'Registration Number')
      .should('contain', 'Business Number')
      .should('not.contain', 'Incorporation Number')
      .should('contain', 'Email')
      .should('contain', 'Phone')
  })

  it('Verify the business detail section is rendered for non-firm (SP/GP) businesses', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json')

    cy.get('[data-cy="business-details"]')
      .should('not.contain', 'Registration Date')
      .should('not.contain', 'Registration Number')
      .should('contain', 'Business Number')
      .should('contain', 'Incorporation Number')
      .should('contain', 'Email')
      .should('contain', 'Phone')
  })

  it('Verify the change buttons for email and phone number', () => {
    // Intercept the request for the business profile page
    cy.intercept('GET', '**businessprofile**').as('goToBusinessProfilePage')

    cy.visitBusinessDashFor('businessInfo/ben/active.json')
      .get('[data-cy="business-details"]')
      .get('[data-cy="value-email"]').trigger('mouseover')
      .get('[data-cy="change-button-email"]').click()
      .wait('@goToBusinessProfilePage')
  })
})
