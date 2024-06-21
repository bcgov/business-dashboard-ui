context('Business dashboard -> Address side component', () => {
  beforeEach(() => {
    cy.visitBusinessDash()
  })

  it('Address accordion is rendered for Registered Office and Record Office', () => {
    cy.getOfficeAddresses()

    // the accordion exists
    cy.get('[data-cy="accordion_officeAddresses"]').should('exist')

    // accordion headers exist
    cy.get('[data-cy="accordion_item_button_officeAddresses0"]').contains('Registered Office').should('be.visible')
    cy.get('[data-cy="accordion_item_button_officeAddresses1"]').contains('Records Office').should('be.visible')

    // the first accordion item is expanded by default and it contain address information
    cy.get('[data-cy="officeAddresses_0"]').contains('Delivery Address').should('be.visible')
    cy.get('[data-cy="officeAddresses_0"]').contains('Mailing Address').should('be.visible')
    cy.get('[data-cy="officeAddresses_1"]').contains('Delivery Address').should('not.be.visible')
    cy.get('[data-cy="officeAddresses_1"]').contains('Mailing Address').should('not.be.visible')

    // expand the second item
    cy.get('[data-cy="accordion_item_button_officeAddresses1"]').click()

    // Note: the current config allow only one item to be expanded
    // This is different from the behavior of the old dashboard.
    cy.get('[data-cy="officeAddresses_0"]').contains('Delivery Address').should('not.be.visible')
    cy.get('[data-cy="officeAddresses_0"]').contains('Mailing Address').should('not.be.visible')
    cy.get('[data-cy="officeAddresses_1"]').contains('Delivery Address').should('be.visible')
    cy.get('[data-cy="officeAddresses_1"]').contains('Mailing Address').should('be.visible')
  })

  it('Business Addresses section is rendered for SP and GP', () => {
    cy.getBusinessAddresses()
    cy.get('[data-cy="accordion_officeAddresses"]').should('not.exist')
    cy.get('[data-cy="businessAddresses"]').should('exist')
  })
})
