import { DraftFilingSolePropWithNr } from '../../../fixtures/filings/draft/sole-prop-with-nr'
import { SolePropNr } from '../../../fixtures/name-requests/soleProp'
import { DraftFilingIncorporationApplicationNumbered } from '../../../fixtures/filings/draft/incorporation-applicaton'
import { DraftFilingAmalgamationApplication } from '../../../fixtures/filings/draft/amalgamation-application'
import {
  DraftFilingCorporationContinuationApplication
} from '../../../fixtures/filings/draft/corporation-continuation-application'

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

    // dropdown menu
    cy.get('[data-cy="popover-button"]').should('exist').click()

    cy.get('[data-cy="menu-button-0"]')
      .should('exist')
      .should('have.text', 'Delete Registration')
  })

  it('Numbered limited company (no NR)', () => {
    cy.visitTempBusinessDash(DraftFilingIncorporationApplicationNumbered, false)

    cy.get('[data-cy="header_todo"]').should('exist')
    cy.get('[data-cy="todoItemList"]').should('exist')

    // subtitle
    cy.get('[data-cy^="todoItem-label-"]')
      .should('exist')
      .contains('DRAFT')

    // View More button exists
    cy.get('[data-cy^="todoItem-showMore-"]').should('not.exist')

    // The action button exists
    cy.get('[data-cy^="todoItemActions-"]')
      .find('button')
      .should('exist')
      .should('have.text', 'Incorporate a Numbered Company')

    cy.get('[data-cy="popover-button"]').should('exist').click()

    // dropdown menu
    cy.get('[data-cy="menu-button-0"]')
      .should('exist')
      .should('have.text', 'Delete Incorporation Application')
  })

  it('Amalgamation application', () => {
    cy.visitTempBusinessDash(DraftFilingAmalgamationApplication, false)

    cy.get('[data-cy="header_todo"]').should('exist')
    cy.get('[data-cy="todoItemList"]').should('exist')

    // subtitle
    cy.get('[data-cy^="todoItem-label-"]')
      .should('exist')
      .contains('DRAFT')

    // View More button exists
    cy.get('[data-cy^="todoItem-showMore-"]').should('not.exist')

    // The action button exists
    cy.get('[data-cy^="todoItemActions-"]')
      .find('button')
      .should('exist')
      .should('have.text', 'Resume')

    cy.get('[data-cy="popover-button"]').should('exist').click()

    // dropdown menu
    cy.get('[data-cy="menu-button-0"]')
      .should('exist')
      .should('have.text', 'Delete Amalgamation Application')
  })

  it('BC Limited Company Continuation Application', () => {
    cy.visitTempBusinessDash(DraftFilingCorporationContinuationApplication, false)

    cy.get('[data-cy="header_todo"]').should('exist')
    cy.get('[data-cy="todoItemList"]').should('exist')

    // subtitle
    cy.get('[data-cy^="todoItem-label-"]')
      .should('exist')
      .contains('DRAFT')

    // View More button exists
    cy.get('[data-cy^="todoItem-showMore-"]').should('not.exist')

    // The action button exists
    cy.get('[data-cy^="todoItemActions-"]')
      .find('button')
      .should('exist')
      .should('have.text', 'Continue In as a Numbered Company')

    cy.get('[data-cy="popover-button"]').should('exist').click()

    // dropdown menu
    cy.get('[data-cy="menu-button-0"]')
      .should('exist')
      .should('have.text', 'Delete Continuation Application')
  })

})
