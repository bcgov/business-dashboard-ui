context('Business dashboard -> Alerts main component', () => {
  it('Alerts are rendered when business has alerts', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active-frozen-not_in_good_standing.json')

    // the alerts exist
    cy.get('[data-cy="alerts-display"]').should('exist')
    cy.get('[data-cy="alert-display"]').should('have.length', 4)

    // accordion headers exist
    cy.get('[data-cy="alert-display"]').eq(0).contains('This business is frozen').should('be.visible')
    cy.get('[data-cy="alert-display"]').eq(2).contains('This business is not in good standing').should('be.visible')

    // expand the second item
    cy.get('[data-cy="alert-display"]').eq(2).find('[data-cy="alert-icon"]').click()

    cy.get('[data-cy="alert-description"]').eq(0).should('not.be.visible')
    cy.get('[data-cy="alert-description"]').eq(1).contains('Email').should('be.visible')
  })

  it('Shouldn\'t show alerts when business has no alerts', () => {
    cy.visitBusinessDash('BC0871427', 'SP')

    cy.get('[data-cy="alerts-display"]').should('not.exist')
    cy.get('[data-cy="alert-display"]').should('not.exist')
  })
})
