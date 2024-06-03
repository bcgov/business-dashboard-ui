context('Accessibility -> Layout', () => {
  it('check the page layout passes accessibility', () => {
    cy.visitBusinessDash()
    cy.checkA11y('[data-cy="bcros-header"')
    cy.checkA11y('[data-cy="bcros-breadcrumb"')
    cy.checkA11y('[data-cy="bcros-footer"')
  })
})
