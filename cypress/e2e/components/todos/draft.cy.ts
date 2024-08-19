context('TODOs -> Draft Filing', () => {
  it('Test draft filing to-do item - base case (draft with no error)', () => {
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
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, 'draft/conversion.json', [], true)

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
})
