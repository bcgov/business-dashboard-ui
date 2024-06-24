context('Business dashboard -> Parties side components', () => {
  beforeEach(() => {
    cy.visitBusinessDash()
  })

  it('Directors accordion is rendered', () => {
    cy.getDirectorParties()
    cy.get('[data-cy="accordion_directors"]').should('exist')
    cy.get('[data-cy="accordion_directors"]').children().eq(0).children().should('have.length', 5)
  })

  it('Partners accordion is rendered', () => {
    cy.getPartnerParties()
    cy.get('[data-cy="accordion_partners"]').should('exist')
    cy.get('[data-cy="accordion_partners"]').children().eq(0).children().should('have.length', 3)
  })

  it('Proprietors accordion is rendered', () => {
    cy.getProprietorParties()
    cy.get('[data-cy="accordion_proprietors"]').should('exist')
    cy.get('[data-cy="accordion_proprietors"]').children().eq(0).children().should('have.length', 1)
  })
})
