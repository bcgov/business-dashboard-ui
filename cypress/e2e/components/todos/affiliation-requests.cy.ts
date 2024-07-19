context('TODOs -> Affiliation Requests', () => {
  it('Tood section is rendered when there are affiliation requests', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, true)

    cy.fixture('todos/affiliationRequests.json').then((afrMockResponse) => {
      // section exists
      cy.get('[data-cy="header_todo"]').should('exist')

      // item list exist
      cy.get('[data-cy="todoItemList"]').should('exist')

      // verify affiliation items exist
      cy.get('[data-cy="todoItem-header-affiliation"]')
        .should('have.length', afrMockResponse.affiliationInvitations.length)
      cy.get('[data-cy="todoItem-label-affiliation"]')
        .should('have.length', afrMockResponse.affiliationInvitations.length)

      // verify title and subtitle exist
      afrMockResponse.affiliationInvitations.forEach((invitation, index) => {
        cy.get('[data-cy="todoItem-label-affiliation"]').eq(index)
          .contains('Request for authorization to manage this business')
        cy.get('[data-cy="todoItem-label-affiliation"]').eq(index)
          .contains(`From: ${invitation.fromOrg.name}`)
      })

      // verify buttons are here
      cy.get('[data-cy="todoItem-showMore-affiliation"]').should('exist')
        .should('have.length', afrMockResponse.affiliationInvitations.length)
      cy.get('[data-cy="todoItem-affiliation-doNotAuthorizeButton"]')
        .should('have.length', afrMockResponse.affiliationInvitations.length)
      cy.get('[data-cy="todoItem-affiliation-authorizeButton"]')
        .should('have.length', afrMockResponse.affiliationInvitations.length)

      // no body of todo item expanded
      cy.get('[data-cy="todoItemBody-affiliation"]').should('not.exist')
      cy.get('Hide details').should('not.exist')

      cy.get('[data-cy="todoItem-showMore-affiliation"]').first().click()

      cy.get('[data-cy="todoItemBody-affiliation"]').should('exist')

      // no body of todo item hidden
      cy.get('[data-cy="todoItem-showMore-affiliation"]').first().click()

      cy.get('[data-cy="todoItemBody-affiliation"]').should('not.exist')
    })
  })
})
