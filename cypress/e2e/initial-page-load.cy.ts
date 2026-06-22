import { BusinessRegistryStaffRoles } from '../../tests/test-utils/test-authorized-actions'

context('Business Dashboard -> Basic page rendering tests', () => {
  it('Loads the page with expected text', () => {
    cy.visitBusinessDash()

    cy.get('[data-cy="business-dashboard"]').should('exist')

    cy.get('[data-cy="business-dashboard"]').should('contain.text', 'To Do (0)')
    cy.get('[data-cy="business-dashboard"]').should('contain.text', 'History (0)')
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
    cy.interceptAuthorizedActions(BusinessRegistryStaffRoles).as('getAuthorizedActions')

    // The loading spinner can be on-screen for only a frame, so racing cy.get() against it is flaky.
    // Instead, attach a MutationObserver before the app boots and record whether the spinner node
    // ever entered the DOM - even momentarily - then assert on that record.
    cy.visit(`/${businessIdentifier}`, {
      onBeforeLoad (win) {
        const w = win as Cypress.AUTWindow & { loadingIconSeen?: boolean }
        w.loadingIconSeen = false
        const observer = new win.MutationObserver(() => {
          if (win.document.querySelector('[data-cy="loading-icon"]')) {
            w.loadingIconSeen = true
            observer.disconnect()
          }
        })
        observer.observe(win.document, { childList: true, subtree: true })
      }
    })

    // assert the spinner appeared at some point during the initial load (retries until the flag flips)
    cy.window().should((win) => {
      const w = win as Cypress.AUTWindow & { loadingIconSeen?: boolean }
      expect(w.loadingIconSeen, 'loading spinner appeared during initial load').to.equal(true)
    })
  })
})
