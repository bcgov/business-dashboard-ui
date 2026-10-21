context('Business Dashboard -> Basic page rendering tests', () => {
  it('Loads the page with expected text', () => {
    cy.visitBusinessDash()

    cy.get('[data-cy="business-dashboard"]').should('exist')

    cy.get('[data-cy="business-dashboard"]').should('contain.text', 'To Do (0)')
    // The filing history count lives in its own multi-line <span>, so the raw textContent is
    // 'History  (0) ' (Vue condenses but does not trim). Assert on the count hook instead of the
    // exact whitespace of the combined header text.
    cy.get('[data-cy="business-dashboard"]').should('contain.text', 'History')
    cy.get('[data-cy="filing-history-count"]').should(($el) => {
      expect($el.text().trim()).to.equal('(0)')
    })
  })

  it('Loads indefinite, display loader icon', () => {
    // The loading spinner and the filing-history "(loading...)" placeholder can be on-screen for only a
    // frame, so racing cy.get() against them is flaky. Observe the DOM from before the app boots and
    // assert on what was seen instead.
    cy.observeDom(['[data-cy="loading-icon"]', '[data-cy="filing-history-count-loading"]'])
    cy.visitBusinessDash()

    cy.expectDomSeen('[data-cy="loading-icon"]')
    cy.expectDomSeen('[data-cy="filing-history-count-loading"]')
  })
})
