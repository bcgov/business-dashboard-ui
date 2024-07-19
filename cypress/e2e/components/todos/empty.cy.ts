context('TODOs -> Affiliation Requests', () => {
  it('Tood section is rendered when there is no todo items', () => {
    cy.visitBusinessDash()

    cy.get('[data-cy="header_todo"]').should('exist').contains('To Do (0)')
    cy.get('[data-cy="todoItemList"]').should('exist').within(() => {
      cy.contains("You don't have anything to do yet")
      cy.contains('Filings that require your attention will appear here')
    })
  })
})
