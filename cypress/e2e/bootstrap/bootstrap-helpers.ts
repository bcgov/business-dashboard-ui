import { BoostrapFiling } from '../../fixtures/filings/draft/incorporation-applicaton'
import { DefaultRoles } from '../../../tests/test-utils/test-authorized-actions'
import { BusinessI } from '../../../src/interfaces/business-i'

export const tempIdentifier = BoostrapFiling.filing.business.identifier
export const businessIdentifier = 'BC0871427'
export const tempFilingsUrl = `**/api/v2/businesses/${tempIdentifier}/filings`
export const businessUrl = `**/api/v2/businesses/${businessIdentifier}`

/** Copy of the draft IA bootstrap filing with the given header fields and business identifier. */
export const bootstrapFilingWith = (header: object, identifier = tempIdentifier) => ({
  ...BoostrapFiling,
  filing: {
    ...BoostrapFiling.filing,
    business: { ...BoostrapFiling.filing.business, identifier },
    header: { ...BoostrapFiling.filing.header, ...header }
  }
})

export const paidFiling = bootstrapFilingWith({ status: 'PAID' })

/** Intercepts for everything a non-staff dashboard load needs that is not business specific. */
export const interceptCommon = () => {
  sessionStorage.setItem('FAKE_CYPRESS_LOGIN', 'true')
  cy.intercept('GET', '**/api/v1/users/**/settings', { fixture: 'settings.json' }).as('getSettings')
  cy.interceptLdarkly()
  cy.intercept('GET', '**/api/v1/orgs/**/products*', { fixture: 'products.json' }).as('getProducts')
  cy.interceptAuthorizedActions(DefaultRoles).as('getAuthorizedActions')
}

/**
 * Intercepts for a regular business dashboard load, except the business details call itself so a
 * spec can stage that one (e.g. 401 then 200). Mirrors visitBusinessDashFor in support/commands.ts.
 */
export const interceptBusinessDashExceptDetails = (business: BusinessI) => {
  cy.interceptAllowableActions(false, business.legalType, business.state)
  cy.interceptBusinessContact(business.identifier, 'BEN').as('getBusinessContact')
  cy.interceptAddresses(business.legalType).as('getAddresses')
  cy.interceptParties(business.legalType, false, false, false).as('getParties')
  cy.interceptAffiliationRequests(false, false).as('getAffiliationRequests')
  cy.interceptTasks('tasksEmpty.json').as('getTasks')
  cy.interceptFilingHistory(business.identifier, []).as('getFilingHistory')
  cy.intercept('GET', '**/api/v1/users/**/notifications', { fixture: 'notifications.json' }).as('getNotifications')
  cy.intercept('GET', `${businessUrl}?slim=true`, { fixture: 'slim.json' }).as('getSlimBusinessDetails')
}
