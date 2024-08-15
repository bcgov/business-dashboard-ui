context('TODOs -> Conversion todo task and filing task', () => {
  it('Conversion todo item is rendered for staff account', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, 'taskConversion.json', [], true)

    // todo section header should exist and show the correct count
    cy.get('[data-cy="header_todo"]')
      .should('exist')
      .contains('To Do (1)')

    // todo section body should exist
    cy.get('[data-cy="body_todo"]')
      .should('exist')
      .find('[data-cy="todoItemList"]')
      .should('exist').as('todoList')

    // conversion filing todo item exists
    cy.get('@todoList')
      .find('[data-cy="todoItem-header-conversion"]')
      .should('have.length', 1).as('todoItem')

    // title exists
    cy.get('@todoItem')
      .find('[data-cy="todoItem-label-conversion"]')
      .should('exist')
      .within(() => {
        cy.contains('Record Conversion')
      })

    // action button exists and is enabled
    cy.get('@todoItem')
      .find('[data-cy="todoItemActions-conversion"]')
      .should('exist')
      .find('button')
      .should('exist')
      .should('have.text', 'File Record Conversion')
      .should('be.enabled')

    // 'View details' button exists
    cy.get('@todoItem')
      .find('[data-cy="todoItem-showMore-conversion"]')
      .should('exist')
      .should('have.text', 'View details')
      .click() // click to expand the todo item
      .should('have.text', 'Hide details')

    // expanded content exists after 'View details' is clicked
    cy.get('@todoList')
      .find('[data-cy="todoItem-content"]')
      .should('exist')
      .contains('BC Registries is missing information about this business')
  })

  it('Non-staff account cannot see the conversion todo item', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, 'taskConversion.json', false)

    cy.get('[data-cy="header_todo"]').should('exist').contains('To Do (0)')
    cy.get('[data-cy="todoItemList"]').should('exist').within(() => {
      cy.contains("You don't have anything to do yet")
      cy.contains('Filings that require your attention will appear here')
    })
  })
})
