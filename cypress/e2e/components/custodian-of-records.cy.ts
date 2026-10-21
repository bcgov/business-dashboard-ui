context('Business dashboard -> Custodian of Records components', () => {
  it('Custodian accordion is rendered for historical business', () => {
    // when parties contain a person with 'Custodian' role and the business is historical
    cy.visitBusinessDash('BC0871427', 'BEN', true)
    cy.get('[data-cy="accordion_custodian"]').should('exist')
    cy.get('[data-cy="accordion_custodian"]').children().eq(0).children().should('have.length', 1)
  })

  it('Custodian accordion is not rendered for active business without a custodian', () => {
    cy.visitBusinessDash('BC0871427', 'BEN', false)
    cy.get('[data-cy="accordion_officeAddresses"]').should('exist')
    cy.get('[data-cy="accordion_custodian"]').should('not.exist')
  })
})
