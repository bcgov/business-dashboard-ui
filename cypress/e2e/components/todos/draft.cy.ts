import { BusinessRegistryStaffRoles } from '../../../../tests/test-utils/test-authorized-actions'
import { DraftFilingIncorporationApplicationNumbered } from '../../../fixtures/filings/draft/incorporation-applicaton'

context('TODOs -> Draft Filing', () => {
  it('Test draft filing to-do item - base case (draft with no error) - change of registration', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, 'draft/changeOfRegistration.json')

    cy.get('[data-cy="header_todo"]').should('exist')
    cy.get('[data-cy="todoItemList"]').should('exist')

    // subtitle
    cy.get('[data-cy^="todoItem-label-"]').should('exist').contains('DRAFT')

    // View More button should not exist
    cy.get('[data-cy^="todoItem-showMore-"]').should('not.exist')

    cy.get('[data-cy^="todoItemActions-"]').should('exist').as('actionSection')

    // The action button should exist
    cy.get('@actionSection')
      .find('button')
      .should('exist')
      .should('have.text', 'Resume')

    // The dropdown menu should exist
    cy.get('@actionSection')
      .find('[data-cy="popover-button"]')
      .should('exist')
      .click() // open the dropdown menu

    // The 'Delete draft' button should exist in the dropdown menu
    // click the button to open the dialog
    cy.get('@actionSection')
      .find('[data-cy="menu-button-0"]')
      .should('exist')
      .should('have.text', 'Delete draft')
      .click()
      .get('[data-cy="bcros-dialog-confirm"]').should('exist').as('dialog')

    // verify the dialog content
    // click the cancel button to close the dialog
    cy.get('@dialog').find('h1').should('have.text', 'Delete Draft?')
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-text"]')
      .find('p')
      .should('have.text', 'Delete your Change of Registration? Any changes you\'ve made will be lost.')
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-btn"]').should('have.length', 2)
      .eq(0).should('have.text', 'Delete')
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-btn"]')
      .eq(1).should('have.text', 'Cancel')
      .click()
      .get('[data-cy="bcros-dialog"]').should('not.exist')
  })

  it('Test draft filing to-do item - base case (draft with no error) - voluntary dissolution', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, 'draft/voluntaryDissolution.json')

    cy.get('[data-cy="header_todo"]').should('exist')
    cy.get('[data-cy="todoItemList"]').should('exist')

    // subtitle
    cy.get('[data-cy^="todoItem-label-"]').should('exist').contains('DRAFT')

    // View More button should not exist
    cy.get('[data-cy^="todoItem-showMore-"]').should('not.exist')

    cy.get('[data-cy^="todoItemActions-"]').should('exist').as('actionSection')

    // The action button should exist
    cy.get('@actionSection')
      .find('button')
      .should('exist')
      .should('have.text', 'Resume')

    // The dropdown menu should exist
    cy.get('@actionSection')
      .find('[data-cy="popover-button"]')
      .should('exist')
      .click() // open the dropdown menu

    // The delete button should exist in the dropdown menu
    // click the button to open the dialog
    cy.get('@actionSection')
      .find('[data-cy="menu-button-0"]')
      .should('exist')
      .should('have.text', 'Delete Voluntary Dissolution')
      .click()
      .get('[data-cy="bcros-dialog-confirm"]').should('exist').as('dialog')

    // verify the dialog content
    // click the cancel button to close the dialog
    cy.get('@dialog').find('h1').should('have.text', 'Delete Draft?')
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-text"]')
      .find('p')
      .should('have.text', 'Delete your Dissolution? Any changes you\'ve made will be lost.')
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-btn"]').should('have.length', 2)
      .eq(0).should('have.text', 'Delete')
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-btn"]')
      .eq(1).should('have.text', 'Cancel')
      .click()
      .get('[data-cy="bcros-dialog"]').should('not.exist')
  })

  it('Test draft filing to-do item - Incomplete payment', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, 'draft/incompletePayment.json')

    cy.get('[data-cy="header_todo"]').should('exist')
    cy.get('[data-cy="todoItemList"]').should('exist')

    // subtitle
    cy.get('[data-cy^="todoItem-label-"]').should('exist').contains('PAYMENT INCOMPLETE')

    // View More button exists
    cy.get('[data-cy^="todoItem-showMore-"]').should('exist')
    cy.get('[data-cy^="todoItem-showMore-"]').click()
    cy.get('[data-cy="todoItem-content"]').should('exist').contains('Payment Incomplete')

    // The action button and dropdown menu should exist
    cy.get('[data-cy^="todoItemActions-"]')
      .find('button')
      .should('exist')
      .should('have.text', 'Resume')
    cy.get('[data-cy="popover-button"]').should('exist')
    cy.get('[data-cy="popover-button"]').click()
    cy.get('[data-cy="menu-button-0"]')
      .should('exist')
      .should('have.text', 'Delete draft')
  })

  it('Conversion filing draft is visible for both staff account', () => {
    // load the conversion filing draft with a staff account
    cy.visitBusinessDashFor(
      'businessInfo/ben/active.json',
      undefined,
      false,
      false,
      'draft/conversion.json',
      [],
      true,
      BusinessRegistryStaffRoles
    )

    // A staff user can see the conversion filing draft
    cy.get('[data-cy="header_todo"]').should('exist')
    cy.get('[data-cy="todoItemList"]').should('exist')
    cy.get('[data-cy="todoItem-label-conversion"]').contains('Record Conversion')
    cy.get('[data-cy="todoItem-label-conversion"]').contains('DRAFT')
    cy.get('[data-cy="todoItem-showMore-conversion"]').click()
    cy.get('[data-cy="todoItem-content"]')
      .contains('BC Registries is missing information about this business')
    // A staff user can see the action button
    cy.get('[data-cy="todoItemActions-conversion"]').find('button').should('exist')
  })

  it('Conversion filing draft is visible for both staff account but the action button is hidden', () => {
    // load the conversion filing draft with a staff account
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, 'draft/conversion.json')

    // A non-staff user can see the conversion filing draft, but the action button is hidden
    cy.get('[data-cy="header_todo"]').should('exist')
    cy.get('[data-cy="todoItemList"]').should('exist')
    cy.get('[data-cy="todoItem-label-conversion"]').contains('Record Conversion')
    cy.get('[data-cy="todoItem-label-conversion"]').contains('DRAFT')
    cy.get('[data-cy="todoItem-showMore-conversion"]').click()
    cy.get('[data-cy="todoItem-content"]')
      .contains('BC Registries is missing information about this business')
    cy.get('[data-cy="todoItemActions-conversion"]').find('button').should('not.exist')
  })

  // Action: delete a draft
  it('Delete Draft button is working)', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, 'draft/changeOfRegistration.json')

    cy.get('[data-cy="popover-button"]').click()
      .get('[data-cy="menu-button-0"]').click()
      .get('[data-cy="bcros-dialog-confirm"]').should('exist').as('dialog')

    // click to delete the draft - when error: show error dialog and click to close
    cy.intercept('DELETE', '**/businesses/*/filings/*', { statusCode: 401, body: {} }).as('deleteDraft')
      .get('@dialog')
      .find('[data-cy="bcros-dialog-btn"]')
      .eq(0).click()
      .wait('@deleteDraft')
      .get('[data-cy="bcros-dialog-deleteError"]').should('exist').as('errorDialog')
      .find('[data-cy="bcros-dialog-btn"]').should('exist').click()
      .wait(1000)
      .get('@errorDialog').should('not.exist')

    // intercept the DELETE request and reload requests
    cy.intercept('DELETE', '**/api/v2/businesses/*/filings/*', { statusCode: 200, body: {} }).as('deleteDraft')
    cy.intercept('GET', '**/api/v2/businesses/**/tasks*').as('getTasks')
    cy.intercept('GET', '**/api/v2/businesses/**/filings*').as('getFilings')

    cy.get('[data-cy="popover-button"]').click()
      .get('[data-cy="menu-button-0"]').click()
      .get('[data-cy="bcros-dialog-confirm"]')
      .find('[data-cy="bcros-dialog-btn"]')
      .eq(0).click()
      .wait('@deleteDraft')
      .wait('@getTasks')
      .wait('@getFilings')
  })

  // Action: resume - redirect to old dashboard
  it('Resume a draft filing in the old dashboard', () => {
    cy.visitBusinessDashFor('businessInfo/cp/active.json', undefined, false, false, 'draft/incompletePayment.json')
    cy.fixture('todos/draft/incompletePayment.json').then((afrMockResponse) => {
      const identifier = afrMockResponse.tasks[0].task.filing.business.identifier
      const filingId = afrMockResponse.tasks[0].task.filing.header.filingId
      const arYear = afrMockResponse.tasks[0].task.filing.header.ARFilingYear
      cy.intercept('GET', '**/annual-report?**').as('getAnnualReportFiling')
      cy.get('[data-cy^="todoItemActions-"]')
        .click()
        .wait('@getAnnualReportFiling')
        .its('request.url')
        .should('include', `/${identifier}/annual-report?` +
          `accountid=1&businessid=CP1002605&filingId=${filingId}&arFilingYear=${arYear}`)
    })
  })

  // Action: resume - redirect to create ui (dev.create.business.bcregistry.gov.bc.ca)
  it('Resume a draft filing in Create UI', () => {
    cy.visitTempBusinessDash(DraftFilingIncorporationApplicationNumbered, false)

    const identifier = DraftFilingIncorporationApplicationNumbered.filing.business.identifier

    // https://dev.create.business.bcregistry.gov.bc.ca/amalg-reg-information?accountid=3040&id=ThU9aP7BCV
    cy.intercept('GET', '**/incorporation-define-company**').as('getIncorporationApplication')
    cy.get('[data-cy^="todoItemActions-"]')
      .click()
      .wait('@getIncorporationApplication')
      .its('request.url')
      .should('include', '/incorporation-define-company')
      .should('include', `id=${identifier}`)
  })

  // Action: resume - redirect to edit ui (dev.edit.business.bcregistry.gov.bc.ca)
  it('Resume a draft filing in Edit UI', () => {
    cy.visitBusinessDashFor('businessInfo/sp/active.json', undefined, false, false, 'draft/changeOfRegistration.json')
    cy.fixture('todos/draft/changeOfRegistration.json').then((afrMockResponse) => {
      const identifier = afrMockResponse.tasks[0].task.filing.business.identifier
      const filingId = afrMockResponse.tasks[0].task.filing.header.filingId
      cy.intercept('GET', '**/change/**').as('getChangeOfRegistrationFiling')
      cy.get('[data-cy^="todoItemActions-"]')
        .click()
        .wait('@getChangeOfRegistrationFiling')
        .its('request.url')
        .should('include', `/${identifier}/change/`)
        .should('include', `change-id=${filingId}`)
    })
  })

  it('Test draft filing to-do item - base case (draft with no error) - delay of dissolution', () => {
    cy.visitBusinessDashFor(
      'businessInfo/ben/active.json',
      undefined,
      false,
      false,
      'draft/delayOfDissolution.json'
    )

    cy.get('[data-cy="header_todo"]').should('exist')
    cy.get('[data-cy="todoItemList"]').should('exist')

    // Ensure it’s the correct draft
    cy.get('[data-cy^="todoItem-label-"]').should('exist').contains('Delay of Dissolution')
    cy.get('[data-cy^="todoItem-label-"]').contains('DRAFT')

    // No View More (base draft)
    cy.get('[data-cy^="todoItem-showMore-"]').should('not.exist')

    cy.get('[data-cy^="todoItemActions-"]').as('actionSection')

    // Resume button exists
    cy.get('@actionSection').find('button').should('exist').and('have.text', 'Resume')

    // Dropdown exists and has the specific delete label
    cy.get('@actionSection').find('[data-cy="popover-button"]').should('exist').click()
    cy.get('@actionSection')
      .find('[data-cy="menu-button-0"]')
      .should('exist')
      .should('have.text', 'Delete draft')
      .click()
      .get('[data-cy="bcros-dialog-confirm"]').should('exist').as('dialog')

    // Dialog content specific to Delay of Dissolution
    cy.get('@dialog').find('h1').should('have.text', 'Delete Draft?')
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-text"]')
      .find('p')
      .should('have.text', 'Delete your Dissolution? Any changes you\'ve made will be lost.')

    // cancel closes dialog
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-btn"]').should('have.length', 2)
      .eq(1).should('have.text', 'Cancel')
      .click()
      .get('[data-cy="bcros-dialog"]').should('not.exist')
  })
})
