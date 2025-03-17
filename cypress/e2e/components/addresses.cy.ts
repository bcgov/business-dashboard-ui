import { addressChange } from '../../fixtures/filings/addressChange/completed.ts'

context('Business dashboard -> Address side component', () => {
  it('Address accordion is rendered for Registered Office and Record Office', () => {
    cy.visitBusinessDash('BC0871427', 'BEN')

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

  it('Business Addresses section is rendered for SP and GP verify pending address doesn\'t show', () => {
    cy.visitBusinessDash('FM1060270', 'SP')
    cy.get('[data-cy="accordion_officeAddresses"]').should('not.exist')
    cy.get('[data-cy="businessAddresses"]').should('exist')

    cy.visitBusinessDash('FM1060265', 'GP')
    cy.get('[data-cy="accordion_officeAddresses"]').should('not.exist')
    cy.get('[data-cy="businessAddresses"]').should('exist')
    cy.get('[data-cy="address-pending-badge"]').should('not.exist')
  })

  it('Business Addresses section with pending change', () => {
    const d = new Date(addressChange.effectiveDate)
    d.setFullYear(d.getFullYear() + 1)
    addressChange.effectiveDate = d.toString()
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, [addressChange])
    cy.get('[data-cy="address-pending-badge"]').should('exist')
    cy.get('[data-cy="address-pending-tooltip"]').click() // trigger('mouseover') doesn't work for tooltip
    cy.get('[data-cy="address-pending-tooltip"]')
      .should('contain', 'The updated office addresses will be legally effective')
  })

  it('Shows modal for address change for appropriate business (base)', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json')
    cy.get('[data-cy="address-change-button"]').click()
    cy.get('[data-cy="continue-to-coa-button"]').should('exist')
  })

  // This doesn't work as you get navigated to a new domain
  // it('Doesnt show modal for address change for non base business', () => {
  //   cy.visitBusinessDashFor('businessInfo/sp/active.json')
  //   cy.get('[data-cy="address-change-button"]').click()
  //   cy.get('[data-cy="continue-to-coa-button"]').should('not.exist')
  // })

  it('Change button does not exist for historical businesses', () => {
    cy.visitBusinessDashFor('businessInfo/bc/historical.json')
    cy.wait(1000)
    cy.get('[data-cy="address-change-button"]').should('not.exist')
  })

  it('Change button is disabled when \'changeOfAddress\' is not in allowable actions', () => {
    cy.visitBusinessDashFor('businessInfo/ben/unable-to-change-address-and-party.json')
    cy.get('[data-cy="address-change-button"]').should('be.disabled')
  })
})
