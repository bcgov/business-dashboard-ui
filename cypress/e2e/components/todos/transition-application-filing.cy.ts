context('TODOs -> Transition Application Todo Task', () => {
  it('Transition application filing to-do item is rendered and working as expected', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, 'taskTA.json')

    cy.fixture('todos/taskTA.json').then((afrMockResponse) => {
      const identifier = afrMockResponse.tasks[0].task.todo.business.identifier
      const arYear = afrMockResponse.tasks[0].task.todo.header.ARFilingYear

      cy.get('[data-cy="header_todo"]')
        .should('exist')
        .contains('To Do (2)')

      cy.get('[data-cy="body_todo"]')
        .should('exist')
        .find('[data-cy="todoItemList"]')
        .should('exist').as('todoList')

      cy.get('@todoList').get('[data-cy="todoItem"]').should('have.length', 2)

      // verify both transition application and annual report filing todo items exist in the right order
      cy.get('@todoList').get('[data-cy="todoItem"]').eq(0)
        .find('[data-cy="todoItem-header-transition"]')
        .should('have.length', 1).as('todoItemTransition')

      cy.get('@todoList').get('[data-cy="todoItem"]').eq(1)
        .find('[data-cy="todoItem-header-annualReport"]')
        .should('have.length', 1).as('todoItemAR')

      // verify title, subtitle, and the checkbox for both exist
      cy.get('@todoItemTransition')
        .find('[data-cy="todoItem-label-transition"]')
        .should('exist')
        .within(() => {
          cy.contains('Post Restoration Transition Application')
          cy.contains(
            'A new Business Corporations Act came into effect ' +
            'while this business was dissolved. Transition this ' +
            'business so that it operates under this new legislation.')
          cy.get('[data-cy="todo-checkbox"]').should('exist').as('checkbox')
        })

      cy.get('@todoItemAR')
        .find('[data-cy="todoItem-label-annualReport"]')
        .should('exist')
        .within(() => {
          cy.contains(`File ${arYear} Annual Report`)
          cy.get('[data-cy="todo-checkbox"]').should('exist')
        })

      // verify action button exists for transition
      cy.get('@todoItemTransition')
        .find('[data-cy="todoItemActions-transition"]')
        .find('button')
        .should('exist').as('actionButton')
        .should('have.text', 'Begin Application')

      // Intercept the GET request for the transition application page
      cy.intercept('GET', `**/${identifier}?**`).as('getTransitionFiling')

      // check the checkbox to enable the action button, and then click the action button
      cy.get('@actionButton')
        .should('be.disabled')
        .then(() => {
          cy.get('@checkbox').click()
          cy.get('@actionButton')
            .should('be.enabled')
            .click()
            .wait('@getTransitionFiling')
            .its('request.url')
            .should('include', `/${identifier}?` +
              `accountid=1&businessid=${identifier}`)
        })
    })
  })
})
