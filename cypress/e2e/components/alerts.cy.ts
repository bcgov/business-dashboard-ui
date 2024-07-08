context('Business dashboard -> Alerts main component', () => {
  it('Alerts are rendered when business has alerts', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active-frozen-not_in_good_standing.json')

    // the alerts exist
    cy.get('[data-cy="alerts-display"]').should('exist')
    cy.get('[data-cy="alert-display-0"]').should('exist')
    cy.get('[data-cy="alert-display-1"]').should('exist')

    // accordion headers exist
    cy.get('[data-cy="alert-display-0"]').contains('This business is frozen').should('be.visible')
    cy.get('[data-cy="alert-display-1"]').contains('This business is not in good standing').should('be.visible')

    // expand the second item
    cy.get('[data-cy="alert-display-1"] > [data-cy="alert-icon"]').click()

    cy.get('[data-cy="alert-description-0"]').should('not.be.visible')
    cy.get('[data-cy="alert-description-1"]').contains('Email').should('be.visible')
  })

  it('Shouldn\'t show alerts when business has no alerts', () => {
    cy.visitBusinessDash('BC0871427', 'SP')

    cy.get('[data-cy="alerts-display"]').should('not.exist')
    cy.get('[data-cy="alert-display-0"]').should('not.exist')
    cy.get('[data-cy="alert-display-1"]').should('not.exist')
  })
})
