context('Business tombstone', () => {
  it('Statuses verification, active, BC limited', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json')
    // badges
    cy.get('[data-cy="badge.historical"]').should('not.exist')
    // links
    cy.get('[data-cy="button.colinLink"]').should('not.exist')
    cy.get('[data-cy="button.viewAndChangeBusinessInfo"]').should('exist')
    cy.get('[data-cy="button.downloadSummary"]').should('exist')
    cy.get('[data-cy="button.moreActions"]').should('exist')

    cy.visitBusinessDashFor('businessInfo/bc/historical.json')
    // badges
    cy.get('[data-cy="badge.historical"]').should('exist')
    // links
    cy.get('[data-cy="button.colinLink"]').should('not.exist')
    cy.get('[data-cy="button.viewAndChangeBusinessInfo"]').should('not.exist')
    cy.get('[data-cy="button.downloadSummary"]').should('exist')
    cy.get('[data-cy="button.moreActions"]').should('not.exist')

    cy.visitBusinessDashFor('businessInfo/ben/active-frozen-not_in_good_standing.json')
    // badges
    cy.get('[data-cy="badge.historical"]').should('not.exist')
    // links
    cy.get('[data-cy="button.colinLink"]').should('not.exist')
    cy.get('[data-cy="button.viewAndChangeBusinessInfo"]').should('exist')
    cy.get('[data-cy="button.downloadSummary"]').should('exist')
    cy.get('[data-cy="button.moreActions"]').should('exist')


    cy.visitBusinessDashFor('businessInfo/cp/active.json')
    // badges
    cy.get('[data-cy="badge.historical"]').should('not.exist')
    // links
    cy.get('[data-cy="button.colinLink"]').should('not.exist')
    cy.get('[data-cy="button.viewAndChangeBusinessInfo"]').should('exist')
    cy.get('[data-cy="button.downloadSummary"]').should('exist')
    cy.get('[data-cy="button.moreActions"]').should('exist')

    cy.visitBusinessDashFor('businessInfo/gp/active.json')
    // badges
    cy.get('[data-cy="badge.historical"]').should('not.exist')
    // links
    cy.get('[data-cy="button.colinLink"]').should('not.exist')
    cy.get('[data-cy="button.viewAndChangeBusinessInfo"]').should('exist')
    cy.get('[data-cy="button.downloadSummary"]').should('exist')
    cy.get('[data-cy="button.moreActions"]').should('exist')

    cy.visitBusinessDashFor('businessInfo/sp/active.json')
    // badges
    cy.get('[data-cy="badge.historical"]').should('not.exist')
    // links
    cy.get('[data-cy="button.colinLink"]').should('not.exist')
    cy.get('[data-cy="button.viewAndChangeBusinessInfo"]').should('exist')
    cy.get('[data-cy="button.downloadSummary"]').should('exist')
    cy.get('[data-cy="button.moreActions"]').should('exist')

  })
})
