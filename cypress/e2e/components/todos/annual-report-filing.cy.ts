context('TODOs -> Affiliation Requests', () => {
  it('Tood section is rendered when there are affiliation requests', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, true, 'taskAR.json')

    cy.fixture('todos/taskAR.json').then((afrMockResponse) => {
      cy.get('[data-cy="header_todo"]').should('exist')
      cy.get('[data-cy="todoItemList"]').should('exist')

      // verify annual report filing todo item exists
      cy.get('[data-cy="todoItem-header-annualReport"]').should('have.length', 1)
      cy.get('[data-cy="todoItem-label-annualReport"]').should('have.length', 1)
      cy.get('[data-cy="todoItemActions-annualReport"]').should('have.length', 1)

      // verify title and subtitle exist
      cy.get('[data-cy="todoItem-label-annualReport"]').within(() => {
        cy.contains(`File ${afrMockResponse.tasks[0].task.todo.header.ARFilingYear} Annual Report`)
        cy.contains('Verify your Office Address and Current Directors before filing your Annual Report.')
        cy.get('[data-cy="annualReport-checkbox"]').should('exist')
      })

      // The due date is displayed for this case
      cy.get('[data-cy="todoItemActions-annualReport"]').contains('Due:')

      // verify the action button exist and is disabled
      cy.get('[data-cy="todoItemActions-annualReport"]')
        .find('button')
        .should('exist')
        .should('have.text', 'File Annual Report')
        .should('be.disabled')

      // check the checkbox to enable the action button
      cy.get('[data-cy="annualReport-checkbox"]').click()
      cy.get('[data-cy="todoItemActions-annualReport"]').find('button').should('not.be.disabled')
    })
  })
})
