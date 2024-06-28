context('Business tombstone', () => {
  it('Statuses verification, active, BC limited', () => {
    cy.visitBusinessDash('BC0871427', 'BEN')
    cy.get('[data-cy="button.colinLink"]').should('not.exist')
    cy.get('[data-cy="button.viewAndChangeBusinessInfo"]').should('exist')
    cy.get('[data-cy="button.downloadSummary"]').should('exist')
    cy.get('[data-cy="button.moreActions"]').should('exist')

    cy.visitBusinessDash('BC0814603', 'BEN', true)
    cy.get('[data-cy="button.colinLink"]').should('not.exist')
    cy.get('[data-cy="button.viewAndChangeBusinessInfo"]').should('not.exist')
    cy.get('[data-cy="button.downloadSummary"]').should('exist')
    cy.get('[data-cy="button.moreActions"]').should('not.exist')
  })
})
