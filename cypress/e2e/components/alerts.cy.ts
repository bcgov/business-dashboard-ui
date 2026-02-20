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

  it('Shows the expected Alert for Transition Required', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active-transition_required.json')

    // the alerts exist
    cy.get('[data-cy="alerts-display"]').should('exist')
    cy.get('[data-cy="alert-display"]').should('have.length', 2)

    // accordion headers exist
    cy.get('[data-cy="alert-display"]').eq(0).contains('This business is not in good standing').should('be.visible')

    // expand the item
    cy.get('[data-cy="alert-display"]').eq(0).find('[data-cy="alert-icon"]').click()

    cy.get('[data-cy="alert-description"]').eq(0).should('be.visible')
    cy.get('[data-cy="alert-description"]').eq(0).contains(
      'A new Business Corporations Act came into effect while' +
      ' this business was dissolved. To restore good standing,' +
      ' transition this business so that it operates under this new legislation.')
    cy.get('[data-cy="alert-description"]').eq(0).contains(
      'If you don’t file a post restoration transition application' +
      ' within a year of your restoration date, this business will be dissolved.')
  })

  it('Shows dissolution alert with extra and maxed messages', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active-dissolution-maxed.json')

    // the alerts exist
    cy.get('[data-cy="alerts-display"]').should('exist')
    cy.get('[data-cy="alert-display"]').should('have.lengthOf.greaterThan', 0)

    // find the dissolution alert by header text
    cy.get('[data-cy="alert-display"]').contains('This business is in the process of being dissolved')
      .should('be.visible')

    // Click the expand button to show details
    cy.get('[data-cy="alert-display"]').eq(0).find('[data-cy="alert-icon"]').click()

    // Wait for the description to appear
    cy.get('[data-cy="alert-description"]').eq(0).should('be.visible')

    // verify the main dissolution message
    cy.get('[data-cy="alert-description"]').eq(0).contains(
      'The business may be struck from the Corporate Registry as soon as'
    ).should('be.visible')

    // verify the maxed message with bold "Note"
    cy.get('[data-cy="alert-description"]').eq(0).contains('Note').should('be.visible')
    cy.get('[data-cy="alert-description"]').eq(0).contains(
      'The maximum number of dissolution delays has been used'
    ).should('be.visible')

    // verify the email link
    cy.get('[data-cy="alert-description"]').eq(0).within(() => {
      cy.get('a[href="mailto:bcregistries@gov.bc.ca"]').should('exist')
      cy.get('a[href="mailto:bcregistries@gov.bc.ca"]').should('contain.text', 'bcregistries@gov.bc.ca')
    })

  })
})
