context('TODOs -> Pending Filing', () => {
  it('Test pending filing to-do item - pending payment', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, 'pendingPayment.json')

    cy.get('[data-cy="header_todo"]').should('exist')
    cy.get('[data-cy="todoItemList"]').should('exist')

    // subtitle
    cy.get('[data-cy^="todoItem-label-"]')
      .should('exist')
      .contains('FILING PENDING')

    // View More button exists
    cy.get('[data-cy^="todoItem-showMore-"]').should('exist')
    cy.get('[data-cy^="todoItem-showMore-"]').click()
    cy.get('[data-cy="todoItem-content"]').should('exist').contains('Payment Incomplete')

    cy.get('[data-cy^="todoItemActions-"]').should('exist').as('actionSection')

    // The action button and dropdown menu should exist
    cy.get('@actionSection')
      .find('button')
      .should('exist')
      .should('have.text', 'Resume Payment')

    // The dropdown menu should exist
    cy.get('@actionSection')
      .find('[data-cy="popover-button"]')
      .should('exist')
      .click() // open the dropdown menu

    // The 'Cancel Payment' button should exist in the dropdown menu
    // click the button to open the dialog
    cy.get('@actionSection')
      .find('[data-cy="menu-button-0"]')
      .should('exist')
      .should('have.text', 'Cancel Payment')
      .click()
      .get('[data-cy="bcros-dialog-confirm"]').should('exist').as('dialog')

    // verify the dialog content
    // click the "Don't Cancel" button to close the dialog
    cy.get('@dialog').find('h1').should('have.text', 'Cancel Payment?')
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-text"]')
      .find('p')
      .should('have.text', 'Cancel payment for your 2024 Annual Report?')
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-btn"]').should('have.length', 2)
      .eq(0).should('have.text', 'Cancel Payment')
    cy.get('@dialog')
      .find('[data-cy="bcros-dialog-btn"]')
      .eq(1).should('have.text', 'Don\'t Cancel')
      .click()
      .get('[data-cy="bcros-dialog"]').should('not.exist')
  })

  it('Test pending filing to-do item - pending online banking payment', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, 'pendingPaymentOnline.json')

    cy.get('[data-cy="header_todo"]').should('exist')
    cy.get('[data-cy="todoItemList"]').should('exist')

    // subtitle
    cy.get('[data-cy^="todoItem-label-"]')
      .should('exist')
      .should('contains.text', 'FILING PENDING')
      .should('contains.text', 'ONLINE BANKING PAYMENT PENDING')

    // View More button exists
    cy.get('[data-cy^="todoItem-showMore-"]').should('exist')
    cy.get('[data-cy^="todoItem-showMore-"]').click()

    // Verify the expanded content
    cy.get('[data-cy="todoItem-content"]')
      .should('exist')
      .should('contains.text', 'Online Banking Payment Pending')
      .should('contains.text', 'is pending payment and/or processing at your bank')
      .should('contains.text', 'If you have not done so, log in to your online bank account to pay the outstanding ' +
        'balance on your BC Registries and Online Services account.')
      .should('contains.text', 'Once submitted through your bank, ' +
        'Online Banking payments can take 2 to 5 days to be processed')

    cy.get('[data-cy^="todoItemActions-"]')
      .find('button')
      .should('exist')
      .should('have.text', 'Change Payment Type')
  })
})
