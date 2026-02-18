context('Business tombstone', () => {
  it('Statuses verification - active Benefit Company', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json')
    // badges
    cy.get('[data-cy="badge.historical"]').should('not.exist')
    // links
    cy.get('[data-cy="button.colinLink"]').should('not.exist')
    cy.get('[data-cy="button.viewAndChangeBusinessInfo"]').should('exist')
    cy.get('[data-cy="button.downloadSummary"]').should('exist')
    cy.get('[data-cy="button.moreActions"]').should('exist')
  })

  it('Statuses verification - historical BC Limited', () => {
    cy.visitBusinessDashFor('businessInfo/bc/historical.json')
    // badges
    cy.get('[data-cy="badge.historical"]').should('exist')
    // links
    cy.get('[data-cy="button.colinLink"]').should('not.exist')
    cy.get('[data-cy="button.viewAndChangeBusinessInfo"]').should('not.exist')
    cy.get('[data-cy="button.downloadSummary"]').should('exist')
    // *** TODO: revert temporary disable due to hard-coded authorization
    // cy.get('[data-cy="button.moreActions"]').should('not.exist')
  })

  it('Statuses verification - active frozen NIGS Benefit Company', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active-frozen-not_in_good_standing.json')
    // badges
    cy.get('[data-cy="badge.historical"]').should('not.exist')
    // links
    cy.get('[data-cy="button.colinLink"]').should('not.exist')
    cy.get('[data-cy="button.viewAndChangeBusinessInfo"]').should('exist')
    cy.get('[data-cy="button.downloadSummary"]').should('exist')
    cy.get('[data-cy="button.moreActions"]').should('exist')
  })

  it('Statuses verification - active Cooperative', () => {
    cy.visitBusinessDashFor('businessInfo/cp/active.json')
    // badges
    cy.get('[data-cy="badge.historical"]').should('not.exist')
    // links
    cy.get('[data-cy="button.colinLink"]').should('not.exist')
    cy.get('[data-cy="button.viewAndChangeBusinessInfo"]').should('exist')
    cy.get('[data-cy="button.downloadSummary"]').should('exist')
    cy.get('[data-cy="button.moreActions"]').should('exist')
  })

  it('Statuses verification - active General Partnership', () => {
    cy.visitBusinessDashFor('businessInfo/gp/active.json')
    // badges
    cy.get('[data-cy="badge.historical"]').should('not.exist')
    // links
    cy.get('[data-cy="button.colinLink"]').should('not.exist')
    cy.get('[data-cy="button.viewAndChangeBusinessInfo"]').should('exist')
    cy.get('[data-cy="button.downloadSummary"]').should('exist')
    cy.get('[data-cy="button.moreActions"]').should('exist')
  })

  it('Statuses verification - active Sole Proprietorship', () => {
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
