context('Business Dashboard -> Basic page rendering tests', () => {
  beforeEach(() => {
    cy.visitBusinessDash()
  })

  it('Loads the page with expected text', () => {
    cy.get('[data-cy="business-dashboard"]').should('exist')

    cy.get('[data-cy="business-dashboard"]').should('contain.text', 'To Do (0)')
    cy.get('[data-cy="business-dashboard"]').should('contain.text', 'Recent Filing History (0)')
  })
})
