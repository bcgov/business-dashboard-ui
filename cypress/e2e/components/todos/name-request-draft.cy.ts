import { DraftFilingSolePropWithNr } from '../../../fixtures/filings/draft/sole-prop-with-nr'
import { SolePropNr } from '../../../fixtures/name-requests/soleProp'

context('TODOs -> Draft Filings', () => {
  it('Sole Prop with NR - expires today', () => {
    const draftFiling = DraftFilingSolePropWithNr
    const nameRequest = Object.assign({}, SolePropNr)

    const today = new Date()
    nameRequest.expirationDate = today.toISOString()

    cy.intercept(
      'GET',
      '**/api/v2/nameRequests/**/validate**',
      nameRequest
    ).as('nameRequest')

    cy.visitTempBusinessDash(draftFiling, false)
    cy.wait('@nameRequest')

    cy.get('[data-cy="header_todo"]').should('exist')
    cy.get('[data-cy="todoItemList"]').should('exist')

    // subtitle
    cy.get('[data-cy^="todoItem-label-"]')
      .should('exist')
      .contains('NR APPROVED - Expires today')

    // View More button exists
    cy.get('[data-cy^="todoItem-showMore-"]').should('exist')
    cy.get('[data-cy^="todoItem-showMore-"]').click()

    //extended content
    cy.get('[data-cy="todoItem-content"]').should('exist').contains('Name Request')

    // The action button exists
    cy.get('[data-cy^="todoItemActions-"]')
      .find('button')
      .should('exist')
      .should('have.text', 'Register using this NR')

    // no dropdown menu
    cy.get('[data-cy="popover-button"]').should('exist').click()

    cy.get('[data-cy="menu-button-0"]')
      .should('exist')
      .should('have.text', 'Delete Registration')
  })


  it('Sole Prop with NR expire in 10 days', () => {
    const draftFiling = DraftFilingSolePropWithNr
    const nameRequest = Object.assign({}, SolePropNr)

    const in10days = new Date()
    in10days.setDate(in10days.getDate() + 10)
    nameRequest.expirationDate = in10days.toISOString()

    cy.intercept(
      'GET',
      '**/api/v2/nameRequests/**/validate**',
      nameRequest
    ).as('nameRequest')

    cy.visitTempBusinessDash(draftFiling, false)
    cy.wait('@nameRequest')

    cy.get('[data-cy="header_todo"]').should('exist')
    cy.get('[data-cy="todoItemList"]').should('exist')

    // subtitle
    cy.get('[data-cy^="todoItem-label-"]')
      .should('exist')
      .contains('NR APPROVED - Expires in 10 days')

    // View More button exists
    cy.get('[data-cy^="todoItem-showMore-"]').should('exist')
    cy.get('[data-cy^="todoItem-showMore-"]').click()

    //extended content
    cy.get('[data-cy="todoItem-content"]').should('exist').contains('Name Request')

    // The action button exists
    cy.get('[data-cy^="todoItemActions-"]')
      .find('button')
      .should('exist')
      .should('have.text', 'Register using this NR')

    // no dropdown menu
    cy.get('[data-cy="popover-button"]').should('exist').click()

    cy.get('[data-cy="menu-button-0"]')
      .should('exist')
      .should('have.text', 'Delete Registration')
  })
})
