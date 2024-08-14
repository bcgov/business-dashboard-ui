context('TODOs -> Draft Filing', () => {
  it('Test draft filing to-do item - base case (draft with no error)', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, 'draft/changeOfRegistration.json')

    cy.get('[data-cy="header_todo"]').should('exist')
    cy.get('[data-cy="todoItemList"]').should('exist')

    // subtitle
    cy.get('[data-cy^="todoItem-label-"]').should('exist').contains('DRAFT')

    // View More button should not exist
    cy.get('[data-cy^="todoItem-showMore-"]').should('not.exist')

    // The action button should exist
    cy.get('[data-cy^="todoItemActions-"]')
      .find('button')
      .should('exist')
      .should('have.text', 'Resume')
  })

  it('Test draft filing to-do item - Incomplete payment', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, 'draft/incompletePayment.json')

    cy.get('[data-cy="header_todo"]').should('exist')
    cy.get('[data-cy="todoItemList"]').should('exist')

    // subtitle
    cy.get('[data-cy^="todoItem-label-"]').should('exist').contains('PAYMENT INCOMPLETE')

    // View More button exists
    cy.get('[data-cy^="todoItem-showMore-"]').should('exist')
    cy.get('[data-cy^="todoItem-showMore-"]').click()
    cy.get('[data-cy="todoItem-content"]').should('exist').contains('Payment Incomplete')

    // The action button and dropdown menu should exist
    cy.get('[data-cy^="todoItemActions-"]')
      .find('button')
      .should('exist')
      .should('have.text', 'Resume')
    cy.get('[data-cy="popover-button"]').should('exist')
    cy.get('[data-cy="popover-button"]').click()
    cy.get('[data-cy="menu-button-0"]')
      .should('exist')
      .should('have.text', 'Delete draft')
  })
})
