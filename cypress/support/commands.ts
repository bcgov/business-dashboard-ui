import { BusinessI } from '../../src/interfaces/business-i'
import { BusinessStateE } from '../../src/enums/business-state-e'

Cypress.Commands.add('interceptBusinessInfo', (identifier, legalType, isHistorical) => {
  cy.fixture(`business${legalType}`).then((business) => {
    business.identifier = identifier
    if (isHistorical) {
      business.state = 'HISTORICAL'
    }
    cy.intercept(
      'GET',
      `**/api/v2/businesses/${business.identifier}`,
      { business })
  })
})

Cypress.Commands.add('interceptBusinessInfoFor', (business: BusinessI) => {
  cy.intercept(
    'GET',
    `**/api/v2/businesses/${business.identifier}`,
    { business })
})

Cypress.Commands.add('interceptBusinessContact', (identifier, legalType) => {
  cy.fixture(`business${legalType}`).then((business) => {
    business.identifier = identifier
    cy.fixture(`businessContact${legalType}`).then((contact) => {
      contact.businessIdentifier = identifier
      cy.intercept(
        'GET',
        `**/api/v1/entities/${business.identifier}`,
        contact)
    })
  })
})

Cypress.Commands.add('interceptAffiliationRequests', (hasAffiliationInvitations = false) => {
  if (hasAffiliationInvitations) {
    cy.fixture('todos/affiliationRequests').then((affiliationResponse) => {
      cy.intercept(
        'GET',
        '**/api/v1/affiliationInvitations?**',
        affiliationResponse
      )
    })
  } else {
    cy.intercept(
      'GET',
      '**/api/v1/affiliationInvitations?**',
      { affiliationInvitations: [] }
    )
  }
})

Cypress.Commands.add('interceptAddresses', (legalType) => {
  let addressFixture = 'addressBEN'
  if (legalType === 'SP' || legalType === 'GP') {
    addressFixture = 'addressSPandGP'
  }

  cy.fixture(addressFixture).then((address) => {
    cy.intercept(
      'GET',
      '**/api/v2/businesses/**/addresses*',
      address)
  })
})

Cypress.Commands.add('interceptParties', (legalType, hasCustodian = false) => {
  let partyFixture = 'directorParties'

  if (legalType === 'SP') {
    partyFixture = 'proprietorParties'
  } else if (legalType === 'GP') {
    partyFixture = 'partnerParties'
  }

  cy.fixture(partyFixture).then((parties) => {
    cy.fixture('custodianOfRecords').then((custodian) => {
      if (hasCustodian) {
        parties.parties.push(custodian)
      }
      cy.intercept(
        'GET',
        '**/api/v2/businesses/**/parties*',
        parties)
    })
  })
})

Cypress.Commands.add('interceptTasks', (fixture) => {
  cy.fixture(`todos/${fixture}`).then((tasks) => {
    cy.intercept(
      'GET',
      '**/api/v2/businesses/**/tasks*',
      tasks)
  })
})

Cypress.Commands.add('visitBusinessDash',
  (
    identifier = 'BC0871427',
    legalType = 'BEN',
    isHistorical = false,
    hasAffiliationInvitations = false,
    taskFixture = 'tasksEmpty.json'
  ) => {
    sessionStorage.setItem('FAKE_CYPRESS_LOGIN', 'true')
    cy.intercept('GET', '**/api/v1/users/**/settings', { fixture: 'settings.json' }).as('getSettings')
    cy.intercept(
      'REPORT',
      'https://app.launchdarkly.com/sdk/evalx/**/context',
      { fixture: 'ldarklyContext.json' }
    ).as('getLdarklyContext')
    cy.intercept('GET', '**/api/v1/orgs/**/products*', { fixture: 'products.json' }).as('getProducts')
    cy.interceptBusinessContact(identifier, legalType).as('getBusinessContact')
    cy.interceptBusinessInfo(identifier, legalType, isHistorical).as('getBusinessInfo')
    cy.interceptAddresses(legalType).as('getAddresses')
    cy.interceptParties(legalType, isHistorical).as('getParties')
    cy.interceptAffiliationRequests(hasAffiliationInvitations).as('getAffiliationRequests')
    cy.interceptTasks(taskFixture).as('getTasks')

    cy.visit(`/${identifier}`)
    cy.wait([
      '@getSettings',
      '@getProducts',
      '@getBusinessContact',
      '@getBusinessInfo',
      '@getAddresses',
      '@getParties',
      '@getAffiliationRequests',
      '@getTasks'
    ])
    cy.injectAxe()
  }
)

Cypress.Commands.add('visitBusinessDashFor',
  (
    path: string,
    identifier = undefined,
    hasAffiliationInvitations = false,
    taskFixture = 'tasksEmpty.json'
  ) => {
    sessionStorage.setItem('FAKE_CYPRESS_LOGIN', 'true')
    // settings
    cy.intercept('GET', '**/api/v1/users/**/settings', { fixture: 'settings.json' }).as('getSettings')
    // login & credentials
    cy.intercept(
      'REPORT',
      'https://app.launchdarkly.com/sdk/evalx/**/context',
      { fixture: 'ldarklyContext.json' }
    ).as('getLdarklyContext')

    // products
    cy.intercept('GET', '**/api/v1/orgs/**/products*', { fixture: 'products.json' }).as('getProducts')

    // business related info
    cy.fixture(path).then((b: { business: BusinessI }) => {
      const business = b.business
      if (identifier) {
        business.identifier = identifier
      }

      // load interceptors
      cy.interceptBusinessInfoFor(business).as('getBusinessInfo')
      cy.interceptBusinessContact(business.identifier, 'BEN').as('getBusinessContact')
      cy.interceptAddresses(business.legalType).as('getAddresses')
      cy.interceptParties(business.legalType, business.state === BusinessStateE.HISTORICAL).as('getParties')
      cy.interceptAffiliationRequests(hasAffiliationInvitations).as('getAffiliationRequests')
      cy.interceptTasks(taskFixture).as('getTasks')

      // go !
      cy.visit(`/${business.identifier}`)
      cy.wait([
        '@getSettings',
        '@getProducts',
        '@getBusinessContact',
        '@getBusinessInfo',
        '@getAddresses',
        '@getParties',
        '@getAffiliationRequests',
        '@getTasks'
      ])
      cy.injectAxe()
    })
  }
)

Cypress.Commands.add('visitBusinessDashAuthError', (identifier = 'BC0871427', legalType = 'BEN') => {
  sessionStorage.setItem('FAKE_CYPRESS_LOGIN', 'true')
  cy.intercept('GET', '**/api/v1/users/**/settings', { statusCode: 500, body: {} }).as('getSettingsError')
  cy.intercept(
    'REPORT',
    'https://app.launchdarkly.com/sdk/evalx/**/context',
    { fixture: 'ldarklyContext.json' }
  ).as('getLdarklyContext')
  cy.interceptBusinessContact(identifier, legalType).as('getBusinessContact')
  cy.interceptBusinessInfo(identifier, legalType).as('getBusinessInfo')
  cy.visit(`/${identifier}`)
  cy.wait(['@getSettingsError'])
  cy.injectAxe()
})
