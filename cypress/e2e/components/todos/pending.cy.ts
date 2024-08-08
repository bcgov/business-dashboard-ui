context('TODOs -> Pending Filing', () => {
  it('Test pending filing to-do item - pending payment', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, 'pendingPayment.json')

    cy.fixture('todos/draftIncompletePayment.json').then(() => {
      cy.get('[data-cy="header_todo"]').should('exist')
      cy.get('[data-cy="todoItemList"]').should('exist')

      // subtitle
      cy.get('[data-cy^="todoItem-label-"]')
        .should('exist')
        .contains('FILING PENDING')

      // View More button exists
      cy.get('[data-cy^="todoItem-showMore-"]').should('exist')
      cy.get('[data-cy^="todoItem-showMore-"]').click()
      cy.get('[data-cy="todoItem-content"]').should('exist').contains('Payment Incomplete')

      // The action button and dropdown menu should exist
      cy.get('[data-cy^="todoItemActions-"]')
        .find('button')
        .should('exist')
        .should('have.text', 'Resume Payment')
      cy.get('[data-cy="popover-button"]').should('exist')
      cy.get('[data-cy="popover-button"]').click()
      cy.get('[data-cy="menu-button-0"]')
        .should('exist')
        .should('have.text', 'Cancel Payment')
    })
  })
})
