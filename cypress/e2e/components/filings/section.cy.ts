context('Filings history section', () => {
  it('Statuses verification, active, BC limited', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json')
    // badges
    cy.get('[data-cy="badge.historical"]').should('not.exist')
    // links
    cy.get('[data-cy="button.colinLink"]').should('not.exist')
    cy.get('[data-cy="button.viewAndChangeBusinessInfo"]').should('exist')
    cy.get('[data-cy="button.downloadSummary"]').should('exist')
    cy.get('[data-cy="button.moreActions"]').should('exist')

})
