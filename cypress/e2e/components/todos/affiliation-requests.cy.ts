context('TODOs -> Affiliation Requests', () => {
  it('Tood section is rendered when there are affiliation requests', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, true)

    cy.fixture('todos/affiliationRequests.json').then((afrMockResponse) => {
      // section exists
      cy.get('[data-cy="header_todo"]').should('exist')

      // item list exist
      cy.get('[data-cy="todoItemList"]').should('exist')

      // verify affiliation items exist
      cy.get('[data-cy="todoItem-affiliation"]')
        .should('have.length', afrMockResponse.affiliationInvitations.length)

      // verify buttons are here
      cy.get('[data-cy="todoItem-affiliation-showMore"]')
        .should('have.length', afrMockResponse.affiliationInvitations.length)
      cy.get('[data-cy="todoItem-affiliation-doNotAuthorizeButton"]')
        .should('have.length', afrMockResponse.affiliationInvitations.length)
      cy.get('[data-cy="todoItem-affiliation-authorizeButton"]')
        .should('have.length', afrMockResponse.affiliationInvitations.length)

      // no body of todo item expanded
      cy.get('[data-cy="todoItemBody-affiliation"]').should('not.exist')
      cy.get('Hide details').should('not.exist')

      cy.get('[data-cy="todoItem-affiliation-showMore"]').first().click()

      cy.get('[data-cy="todoItemBody-affiliation"]').should('exist')

      // no body of todo item hidden
      cy.get('[data-cy="todoItem-affiliation-showMore"]').first().click()

      cy.get('[data-cy="todoItemBody-affiliation"]').should('not.exist')
    })
  })
})
