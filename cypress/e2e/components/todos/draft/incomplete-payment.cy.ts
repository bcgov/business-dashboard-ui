context('TODOs -> Affiliation Requests', () => {
  it('Annual report filing to-do item is rendered and working as expected', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, true, 'draftIncompletePayment.json')

    cy.fixture('todos/draftIncompletePayment.json').then((_afrMockResponse) => {
      cy.get('[data-cy="header_todo"]').should('exist')
      cy.get('[data-cy="todoItemList"]').should('exist')

      // subtitle
      cy.get('[data-cy="todoItem-label-annualReport"]').should('exist').contains('PAYMENT INCOMPLETE')

      // View More button exists
      cy.get('[data-cy="todoItem-showMore-annualReport"]').should('exist')
      cy.get('[data-cy="todoItem-showMore-annualReport"]').click()
      cy.get('[data-cy="todoItem-content"]').should('exist').contains('Payment Incomplete')

      // verify the action button exist and is disabled
      cy.get('[data-cy="todoItemActions-annualReport"]')
        .find('button')
        .should('exist')
        .should('have.text', 'Resume')
    })
  })
})
