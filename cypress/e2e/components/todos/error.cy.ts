context('TODOs -> Error Filing', () => {
  it('Test error filing to-do item', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, 'error.json')

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
      cy.get('[data-cy="todoItem-content"]').should('exist').contains('Payment Unsuccessful')

      // The action button exists
      cy.get('[data-cy^="todoItemActions-"]')
        .find('button')
        .should('exist')
        .should('have.text', 'Retry Payment')

      // no dropdown menu
      cy.get('[data-cy="popover-button"]').should('not.exist')
    })
  })
})
