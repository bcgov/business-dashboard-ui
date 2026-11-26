import {
  businessIdentifier, businessUrl, interceptBusinessDashExceptDetails, interceptCommon, paidFiling,
  tempFilingsUrl, tempIdentifier
} from './bootstrap-helpers'

// After a bootstrap filing completes, auth's affiliation lags the LEAR commit briefly, so the
// dashboard retries a 401 on the temp filing fetch and, right after the redirect, on the business fetch.
context('Bootstrap filing - affiliation lag', () => {
  it('retries a 401 on the temp dashboard and renders without the error dialog', () => {
    interceptCommon()
    // most recently defined intercept wins; the 401 falls away after one hit
    cy.intercept('GET', tempFilingsUrl, paidFiling).as('tempFilings')
    cy.intercept({ method: 'GET', url: tempFilingsUrl, times: 1 }, { statusCode: 401, body: {} }).as('tempFilings401')

    cy.visit(`/${tempIdentifier}`)
    cy.wait('@tempFilings401')
    cy.wait('@tempFilings', { timeout: 10000 })

    cy.get('[data-cy="filingHistoryItem-header"]').should('exist')
    cy.get('[data-cy="bcros-dialog"]').should('not.exist')
  })

  it('retries a 401 on the business fetch when redirected from a completed bootstrap filing', () => {
    interceptCommon()
    cy.fixture('businessBEN').then((business) => {
      business.identifier = businessIdentifier
      interceptBusinessDashExceptDetails(business)
      cy.intercept('GET', businessUrl, { business }).as('getBusinessInfo')
      cy.intercept({ method: 'GET', url: businessUrl, times: 1 }, { statusCode: 401, body: {} })
        .as('getBusinessInfo401')

      cy.visit(`/${businessIdentifier}?bootstrap=${tempIdentifier}`)
      cy.wait('@getBusinessInfo401')
      cy.wait('@getBusinessInfo', { timeout: 10000 })

      cy.get('[data-cy="business-details-name"]').should('contain.text', business.legalName)
      cy.get('[data-cy="bcros-dialog"]').should('not.exist')
    })
  })

  it('shows the error dialog on a 401 for a normal business load', () => {
    interceptCommon()
    cy.fixture('businessBEN').then((business) => {
      business.identifier = businessIdentifier
      interceptBusinessDashExceptDetails(business)
      cy.intercept('GET', businessUrl, { statusCode: 401, body: {} }).as('getBusinessInfo401')

      cy.visit(`/${businessIdentifier}`)
      cy.wait('@getBusinessInfo401')

      cy.get('[data-cy="bcros-dialog"]').should('exist')
      // no retry without the bootstrap marker
      cy.wait(2000)
      cy.get('@getBusinessInfo401.all').should('have.length', 1)
    })
  })
})
