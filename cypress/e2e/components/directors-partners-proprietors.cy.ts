context('Business dashboard -> Side components: Current Directors, Partners, Proprietors', () => {
  it('Directors accordion is rendered', () => {
    cy.visitBusinessDash('BC0871427', 'BEN')
    cy.get('[data-cy="accordion_directors"]').should('exist')
    cy.get('[data-cy="accordion_directors"]').children().eq(0).children().should('have.length', 5)
  })

  it('Partners accordion is rendered', () => {
    cy.visitBusinessDash('FM1060265', 'GP')
    cy.get('[data-cy="accordion_partners"]').should('exist')
    cy.get('[data-cy="accordion_partners"]').children().eq(0).children().should('have.length', 3)
  })

  it('Proprietors accordion is rendered', () => {
    cy.visitBusinessDash('FM1060270', 'SP')
    cy.get('[data-cy="accordion_proprietors"]').should('exist')
    cy.get('[data-cy="accordion_proprietors"]').children().eq(0).children().should('have.length', 1)
  })
})
