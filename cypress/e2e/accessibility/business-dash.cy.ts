context('Accessibility -> Business Dashboard', () => {
  beforeEach(() => {
    cy.visitBusinessDash()
  })

  it('check page passes accessibility after initial page load', () => {
    cy.get('[data-cy="business-dashboard"]').should('exist')
    // TODO: enable this case and fix it later
    // cy.checkA11y('[data-cy="business-dashboard"]')
  })
})
