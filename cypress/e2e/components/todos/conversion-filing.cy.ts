context('TODOs -> Conversion todo task and filing task', () => {
  it('Conversion todo item is rendered for staff account', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, 'taskConversion.json', [], true)

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

  it('Non-staff account cannot see the conversion todo item ', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, 'taskConversion.json', false)

    cy.get('[data-cy="header_todo"]').should('exist').contains('To Do (0)')
    cy.get('[data-cy="todoItemList"]').should('exist').within(() => {
      cy.contains("You don't have anything to do yet")
      cy.contains('Filings that require your attention will appear here')
    })
  })
})
