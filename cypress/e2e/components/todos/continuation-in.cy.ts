import { ContinuationAuthorizationInitial }
  from '../../../fixtures/filings/continuationApplication/continuation-authorization-initial'
import { ContinuationAuthorizationDraft }
  from '../../../fixtures/filings/continuationApplication/continuation-authorization-draft'
import { ContinuationAuthorizationChangeRequested }
  from '../../../fixtures/filings/continuationApplication/continuation-authorization-change-requested'
import { ContinuationAuthorizationApproved }
  from '../../../fixtures/filings/continuationApplication/continuation-authorization-approved'

context('TODOs -> Continuation-In todo items', () => {
  it('Continuation-in Application - before starting continuation-in authorization process', () => {
    cy.visitTempBusinessDash(ContinuationAuthorizationInitial, false)

    cy.get('[data-cy="header_todo"]').should('exist')
    cy.get('[data-cy="todoItemList"]').should('exist')

    // subtitle
    cy.get('[data-cy^="todoItem-label-"]')
      .should('exist')
      .should('contain', 'DRAFT')

    // View More button should not exist as this example has no Name Request
    cy.get('[data-cy^="todoItem-showMore-"]').should('not.exist')

    // action button
    cy.get('[data-cy^="todoItemActions-"]')
      .find('button')
      .should('exist')
      .should('have.text', 'Begin Continuation')

    cy.get('[data-cy="popover-button"]').should('exist').click()

    // dropdown menu
    cy.get('[data-cy="menu-button-0"]')
      .should('exist')
      .should('have.text', 'Delete Continuation Authorization')
  })

  it('Continuation-in Application - resume a continuation-in authorization application draft', () => {
    cy.visitTempBusinessDash(ContinuationAuthorizationDraft, false)

    // action button
    cy.get('[data-cy^="todoItemActions-"]')
      .find('button')
      .should('exist')
      .should('have.text', 'Resume')

    cy.get('[data-cy="popover-button"]').should('exist').click()

    // dropdown menu
    cy.get('[data-cy="menu-button-0"]')
      .should('exist')
      .should('have.text', 'Delete Continuation Authorization')
  })

  it('Continuation-in Application - change requested', () => {
    cy.visitTempBusinessDash(ContinuationAuthorizationChangeRequested, false)

    // subtitle
    cy.get('[data-cy^="todoItem-label-"]')
      .should('exist')
      .should('contains.text', 'CHANGE REQUESTED')
      .should('contains.text', 'Submitted by')

    // action button
    cy.get('[data-cy^="todoItemActions-"]')
      .find('button')
      .should('exist')
      .should('have.text', 'Make Changes')

    // no dropdown menu
    cy.get('[data-cy="popover-button"]').should('not.exist')

    // view detail button
    cy.get('[data-cy^="todoItem-showMore-"]').should('exist').click()

    // verify the expanded panel
    cy.get('[data-cy="todoItemBody-changeRequested"]')
      .should('exist')
      .should('contains.text', 'Please make the following updates to your continuation authorization document.')
      .find('[data-cy="contact-info"]')
      .should('exist')
  })

  it('Continuation-in Application - authorization is approved and user can move to the application stage', () => {
    cy.visitTempBusinessDash(ContinuationAuthorizationApproved, false)

    // subtitle
    cy.get('[data-cy^="todoItem-label-"]')
      .should('exist')
      .should('contains.text', 'Continuation Authorization APPROVED')
      .should('contains.text', 'Submitted by')

    // action button
    cy.get('[data-cy^="todoItemActions-"]')
      .find('button')
      .should('exist')
      .should('have.text', 'Resume')

    // no dropdown menu
    cy.get('[data-cy="popover-button"]').should('not.exist')
  })
})
