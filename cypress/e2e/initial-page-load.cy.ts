context('Business Dashboard -> Basic page rendering tests', () => {
  it('Loads the page with expected text', () => {
    cy.visitBusinessDash()

    cy.get('[data-cy="business-dashboard"]').should('exist')

    cy.get('[data-cy="business-dashboard"]').should('contain.text', 'To Do (0)')
    cy.get('[data-cy="business-dashboard"]').should('contain.text', 'Recent Filing History (0)')
  })

  it('Loads indefinite, display loader icon', () => {
    const legalType = 'BEN'
    const isHistorical = false
    const businessIdentifier = 'BC0871427'

    sessionStorage.setItem('FAKE_CYPRESS_LOGIN', 'true')
    cy.intercept('GET', '**/api/v1/users/**/settings', { fixture: 'settings.json' }).as('getSettings')
    cy.intercept(
      'REPORT',
      'https://app.launchdarkly.com/sdk/evalx/**/context',
      { fixture: 'ldarklyContext.json' }
    ).as('getLdarklyContext')
    cy.intercept('GET', '**/api/v1/orgs/**/products*', { fixture: 'products.json' }).as('getProducts')
    cy.interceptBusinessContact(businessIdentifier, legalType).as('getBusinessContact')
    cy.interceptBusinessInfo(businessIdentifier, legalType, isHistorical).as('getBusinessInfo')
    cy.interceptAddresses(legalType).as('getAddresses')
    cy.interceptParties(legalType, isHistorical).as('getParties')
    cy.interceptAffiliationRequests(false, false).as('getAffiliationRequests')
    cy.interceptTasks('tasksEmpty.json').as('getTasks')
    cy.interceptAuthorizations(businessIdentifier)

    cy.visit(`/${businessIdentifier}`)
    cy.get('[data-cy="loading-icon"]').should('be.visible').then(() => {
      cy.wait(['@getBusinessInfo'])
      cy.get('[data-cy="loading-icon"]').should('not.be.visible')
    })
  })
})
