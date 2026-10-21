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
    // "View Access" applies to historical businesses too, so the More Actions menu still renders,
    // but it must not offer any filing actions. Force the click: a modal overlay covers the tombstone
    // on the historical dashboard and would otherwise block the pointer event.
    cy.get('[data-cy="button.moreActions"]').click({ force: true })
    cy.get('[data-cy="button.moreActions"]').find('[data-cy^="button."]').should('have.length', 1)
    cy.get('[data-cy="button.moreActions"]').find('[data-cy="button.viewAccess"]').should('exist')
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
