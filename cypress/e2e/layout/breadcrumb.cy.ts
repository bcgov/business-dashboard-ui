import { BusinessRegistryStaffRoles } from "../../../tests/test-utils/test-authorized-actions"

context('Layout -> Breadcrumb', () => {
  it('Breadcrumb is rendered for non-staff account', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, 'taskConversion.json', [], false)

    cy.get('[data-cy="bcros-breadcrumb"]')
      .should('exist')
      .find('[data-cy="crumb-link"]')
      .should('have.length', 3)
      .eq(0)
      .should('have.text', 'BC Registries Dashboard')
  })

  it('Breadcrumb is rendered for staff account', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, 'taskConversion.json', [], true, BusinessRegistryStaffRoles)

    cy.get('[data-cy="bcros-breadcrumb"]')
      .should('exist')
      .find('[data-cy="crumb-link"]')
      .should('have.length', 2)
      .eq(0)
      .should('have.text', 'Staff Dashboard')
  })
})
