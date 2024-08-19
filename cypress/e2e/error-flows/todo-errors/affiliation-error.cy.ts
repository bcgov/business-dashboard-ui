context('Error flows in To-Do section -> Affiliation Requests', () => {
  it('Error fetching affiliation requests', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, true)

    cy.get('[data-cy="bcros-dialog"]').should('exist').as('dialog')
    cy.get('@dialog').find('h1').should('have.text', 'Error fetching affiliation invitation.')
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-text"]')
      .find('p').eq(0)
      .should('have.text', 'An error happened while fetching affiliation invitation.')
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-text"]')
      .find('p').eq(1)
      .should('have.text', 'Please try again later.')
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-btn"]')
      .should('have.text', 'OK')
      .click()
      .get('[data-cy="bcros-dialog"]').should('not.exist')
  })

  it('Error authorizing affiliation requests', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, true, false)

    cy.intercept(
      'PATCH',
      '**/api/v1/affiliationInvitations/**/authorization/accept',
      { statusCode: 500, body: { message: 'error accepting the affiliation request' } }
    ).as('acceptAffiliationRequest')

    cy.get('[data-cy="todoItemActions-affiliation"]')
      .find('button').eq(1)
      .should('have.text', 'Authorize')
      .click()

    cy.wait('@acceptAffiliationRequest').its('response.statusCode').should('equal', 500)

    cy.get('[data-cy="bcros-dialog"]').should('exist').as('dialog')
    cy.get('@dialog').find('h1').should('have.text', 'Error updating affiliation invitation.')
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-text"]')
      .find('p').eq(0)
      .should('have.text', 'An error happened while updating affiliation invitation.')
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-text"]')
      .find('p').eq(1)
      .should('have.text', 'Please try again later.')
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-btn"]')
      .should('have.text', 'OK')
      .click()
      .get('[data-cy="bcros-dialog"]').should('not.exist')
  })
})
