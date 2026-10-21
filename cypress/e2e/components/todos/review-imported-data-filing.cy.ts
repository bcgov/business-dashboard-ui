import { DefaultRoles } from '../../../../tests/test-utils/test-authorized-actions'
import { AuthorizedActionsE } from '../../../../src/enums/authorized-actions-e'

context('TODOs -> Review Imported Data todo task', () => {
  it('Review Imported Data todo item is rendered for a client account', () => {
    cy.visitBusinessDashFor(
      'businessInfo/ben/active-missing-info.json', undefined, false, false, 'taskReviewImportedData.json'
    )

    // todo section header should exist and show the correct count
    cy.get('[data-cy="header_todo"]')
      .should('exist')
      .contains('To Do (1)')

    // todo section body should exist
    cy.get('[data-cy="body_todo"]')
      .should('exist')
      .find('[data-cy="todoItemList"]')
      .should('exist').as('todoList')

    // review imported data todo item exists
    cy.get('@todoList')
      .find('[data-cy="todoItem-header-reviewImportedData"]')
      .should('have.length', 1).as('todoItem')

    // title, intro text, one bullet per category and the alert are always visible (no expansion panel)
    cy.get('@todoItem')
      .find('[data-cy="todoItem-label-reviewImportedData"]')
      .should('exist')
      .within(() => {
        cy.contains('Review your migrated information')
        cy.get('[data-cy="todoItemBody-reviewImportedData"]').should('exist').within(() => {
          cy.contains('Some of the following information is either missing or incorrect.')
          cy.get('li').should('have.length', 2)
          cy.get('li').eq(0).should('have.text', 'Office address')
          cy.get('li').eq(1).should('have.text', 'Director address')
          cy.get('[data-cy="todoItem-reviewImportedData-alert"]')
            .should('exist')
            .contains('Until updated, the listed items above may impact your ability to submit other reports.')
        })
      })

    // no 'View details' button
    cy.get('@todoItem')
      .find('[data-cy="todoItem-showMore-reviewImportedData"]')
      .should('not.exist')

    // action button exists and is enabled
    cy.get('@todoItem')
      .find('[data-cy="todoItemActions-reviewImportedData"]')
      .should('exist')
      .find('button')
      .should('exist')
      .should('have.text', 'Review now')
      .should('be.enabled')
  })

  it('Account without the permission cannot see the todo item', () => {
    const roles = DefaultRoles.filter(role => role !== AuthorizedActionsE.REVIEW_IMPORTED_DATA_FILING)
    cy.visitBusinessDashFor(
      'businessInfo/ben/active-missing-info.json',
      undefined, false, false, 'taskReviewImportedData.json', [], false, roles
    )

    cy.get('[data-cy="header_todo"]').should('exist').contains('To Do (0)')
    cy.get('[data-cy="todoItemList"]').should('exist').within(() => {
      cy.contains("You don't have anything to do yet")
    })
  })
})
