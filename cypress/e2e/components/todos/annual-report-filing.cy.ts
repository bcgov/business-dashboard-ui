context('TODOs -> Annual Report Todo Task', () => {
  it('Annual report filing to-do item is rendered and working as expected', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, 'taskAR.json')

    cy.fixture('todos/taskAR.json').then((afrMockResponse) => {
      const identifier = afrMockResponse.tasks[0].task.todo.business.identifier
      const arYear = afrMockResponse.tasks[0].task.todo.header.ARFilingYear

      cy.get('[data-cy="header_todo"]')
        .should('exist')
        .contains('To Do (1)')

      cy.get('[data-cy="body_todo"]')
        .should('exist')
        .find('[data-cy="todoItemList"]')
        .should('exist').as('todoList')

      // verify annual report filing todo item exists
      cy.get('@todoList')
        .find('[data-cy="todoItem-header-annualReport"]')
        .should('have.length', 1).as('todoItem')

      // verify title, subtitle, and the checkbox exist
      cy.get('@todoItem')
        .find('[data-cy="todoItem-label-annualReport"]')
        .should('exist')
        .within(() => {
          cy.contains(`File ${arYear} Annual Report`)
          cy.contains('Verify your Office Address and Current Directors before filing your Annual Report.')
          cy.get('[data-cy="annualReport-checkbox"]').should('exist').as('checkbox')
        })

      // verify action button exists and the due date is displayed
      cy.get('@todoItem')
        .find('[data-cy="todoItemActions-annualReport"]')
        .should('contain.text', 'Due: ')
        .find('button')
        .should('exist').as('actionButton')
        .should('have.text', 'File Annual Report')

      // Intercept the GET request for the annual report page
      cy.intercept('GET', '**/annual-report?**').as('getAnnualReportFiling')

      // check the checkbox to enable the action button, and then click the action button
      cy.get('@actionButton')
        .should('be.disabled')
        .then(() => {
          cy.get('@checkbox').click()
          cy.get('@actionButton')
            .should('be.enabled')
            .click()
            .wait('@getAnnualReportFiling')
            .its('request.url')
            .should('include', `/${identifier}/annual-report?` +
              `accountid=1&businessid=BC0871427&filingId=0&arFilingYear=${arYear}`)
        })
    })
  })
})
