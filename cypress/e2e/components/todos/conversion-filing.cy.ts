context('TODOs -> Conversion Todo Task', () => {
  it('Conversion filing to-do item is rendered and working as expected', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, 'taskConversion.json')

    cy.fixture('todos/taskAR.json').then(() => {
      cy.get('[data-cy="header_todo"]').should('exist')
      cy.get('[data-cy="todoItemList"]').should('exist')

      // verify conversion filing todo item exists
      cy.get('[data-cy="todoItem-header-conversion"]').should('have.length', 1)
      cy.get('[data-cy="todoItem-label-conversion"]').should('have.length', 1)
      cy.get('[data-cy="todoItemActions-conversion"]').should('have.length', 1)

      // verify the title exists
      cy.get('[data-cy="todoItem-label-conversion"]').within(() => {
        cy.contains('Record Conversion')
      })

      // View More button exists
      cy.get('[data-cy^="todoItem-showMore-"]').should('exist')
      cy.get('[data-cy^="todoItem-showMore-"]').click()
      cy.get('[data-cy="todoItem-content"]')
        .should('exist')
        .contains('BC Registries is missing information about this business')

      // verify the action button exist and is enabled
      cy.get('[data-cy="todoItemActions-conversion"]')
        .find('button')
        .should('exist')
        .should('have.text', 'File Record Conversion')
        .should('be.enabled')
    })
  })
})
