import { BusinessI } from '../../src/interfaces/business-i'
import { BusinessStateE } from '../../src/enums/business-state-e'
import { BoostrapFiling } from '../fixtures/filings/draft/incorporation-applicaton'
import { BusinessRegistryStaffRoles, DefaultRoles } from '../../tests/test-utils/test-authorized-actions'

Cypress.Commands.add('interceptBusinessInfo', (identifier, legalType, isHistorical = false) => {
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

Cypress.Commands.add('interceptAffiliationRequests',
  (hasAffiliationInvitations = false, hasAffiliationInvitationError = false) => {
    if (hasAffiliationInvitations) {
      cy.fixture('todos/affiliationRequests').then((affiliationResponse) => {
        cy.intercept(
          'GET',
          '**/api/v1/affiliationInvitations?**',
          affiliationResponse
        )
      })
    } else if (hasAffiliationInvitationError) {
      cy.intercept(
        'GET',
        '**/api/v1/affiliationInvitations?**',
        { statusCode: 500, body: { message: 'error loading affiliation requests' } }
      )
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

Cypress.Commands.add('interceptPayApiResponse', (code: string) => {
  cy.fixture('payErrors').then((errors) => {
    cy.intercept(
      'GET',
      '**/api/v1/codes/errors/*',
      errors[code])
  })
})

Cypress.Commands.add('interceptTasks', (fixture) => {
  cy.fixture(`todos/${fixture}`).then((tasks) => {
    cy.intercept(
      'GET',
      '**/api/v2/businesses/**/tasks*',
      tasks)

    for (const task of tasks.tasks) {
      if (task.task.filing && task.task.filing.header.paymentStatusCode) {
        cy.interceptPayApiResponse(task.task.filing.header.paymentStatusCode)
      }
    }
  })
})

Cypress.Commands.add('interceptFilingHistory', (businessIdentifier, filings) => {
  cy.intercept(
    'GET',
    `**/api/v2/businesses/${businessIdentifier}/filings`,
    { filings }
  )
})

Cypress.Commands.add('interceptAllowableActions', (isStaff, legalType = 'BC', state = 'ACTIVE') => {
  let fixtureName = `${legalType.toLowerCase()}-${state.toLowerCase()}`
  if (isStaff) {
    fixtureName = 'staff/' + fixtureName
  }

  cy.fixture(`allowable-actions/${fixtureName}`).then((response) => {
    cy.intercept(
      'GET',
      '**/api/v2/businesses/allowable/**',
      response
    )
  })
})

Cypress.Commands.add('interceptAuthorizedActions', (actions: string[] = []) => {
  cy.intercept(
    'GET',
    '**/api/v2/permissions',
    { authorizedPermissions: actions }
  ).as('getAuthorizedActions')
})

Cypress.Commands.add('visitBusinessDash',
  (
    identifier = 'BC0871427',
    legalType = 'BEN',
    isHistorical = false,
    hasAffiliationInvitations = false,
    hasAffiliationInvitationError = false,
    taskFixture = 'tasksEmpty.json',
    authorizations = DefaultRoles
  ) => {
    cy.wait(500) // https://github.com/cypress-io/cypress/issues/27648
    sessionStorage.setItem('FAKE_CYPRESS_LOGIN', 'true')
    cy.interceptAllowableActions(false, legalType, isHistorical ? 'HISTORICAL' : 'ACTIVE')
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
    cy.interceptAuthorizedActions(authorizations).as('getAuthorizedActions')
    cy.interceptAffiliationRequests(
      hasAffiliationInvitations,
      hasAffiliationInvitationError).as('getAffiliationRequests')
    cy.interceptTasks(taskFixture).as('getTasks')
    cy.intercept('GET',
      '**/api/v1/users/**/notifications', { fixture: 'notifications.json' }).as('getNotifications')

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
    hasAffiliationInvitationError = false,
    taskFixture = 'tasksEmpty.json',
    filings = [],
    asStaff = false,
    authorizations = DefaultRoles
  ) => {
    // settings
    cy.wait(1000) // https://github.com/cypress-io/cypress/issues/27648
    if (asStaff) {
      sessionStorage.setItem('FAKE_CYPRESS_LOGIN', 'trueStaff')
      cy.intercept('GET', '**/api/v1/users/**/settings', { fixture: 'staffSettings.json' }).as('getSettings')
    } else {
      sessionStorage.setItem('FAKE_CYPRESS_LOGIN', 'true')
      cy.intercept('GET', '**/api/v1/users/**/settings', { fixture: 'settings.json' }).as('getSettings')
    }
    // login & credentials
    cy.intercept(
      'REPORT',
      'https://app.launchdarkly.com/sdk/evalx/**/context',
      { fixture: 'ldarklyContext.json' }
    ).as('getLdarklyContext')

    // products
    cy.intercept('GET', '**/api/v1/orgs/**/products*', { fixture: 'products.json' }).as('getProducts')
    cy.interceptAuthorizedActions(authorizations).as('getAuthorizedActions')

    // business related info
    cy.fixture(path).then((b: { business: BusinessI }) => {
      const business = b.business
      if (identifier) {
        business.identifier = identifier
      }

      // load interceptors
      cy.interceptAllowableActions(asStaff, business.legalType, business.state)
      cy.interceptBusinessInfoFor(business).as('getBusinessInfo')
      cy.interceptBusinessContact(business.identifier, 'BEN').as('getBusinessContact')
      cy.interceptAddresses(business.legalType).as('getAddresses')
      cy.interceptParties(business.legalType, business.state === BusinessStateE.HISTORICAL).as('getParties')
      cy.interceptAffiliationRequests(
        hasAffiliationInvitations,
        hasAffiliationInvitationError).as('getAffiliationRequests')
      cy.interceptTasks(taskFixture).as('getTasks')
      cy.interceptFilingHistory(business.identifier, filings).as('getFilingHistory')
      cy.intercept('GET',
        '**/api/v1/users/**/notifications', { fixture: 'notifications.json' }).as('getNotifications')
      cy.intercept('GET',
        `**/api/v2/businesses/${business.identifier}?slim=true`, { fixture: 'slim.json' })
        .as('getSlimBusinessDetails')

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
        '@getTasks',
        '@getFilingHistory',
        '@getSlimBusinessDetails'
      ])
      cy.injectAxe()
    })
  }
)

Cypress.Commands.add('visitTempBusinessDash', (draftFiling = undefined, asStaff = false, authorizations = DefaultRoles) => {
  let bootstrapFiling = BoostrapFiling

  if (draftFiling) {
    bootstrapFiling = draftFiling
  }

  // settings
  if (asStaff) {
    sessionStorage.setItem('FAKE_CYPRESS_LOGIN', 'trueStaff')
    cy.intercept('GET', '**/api/v1/users/**/settings', { fixture: 'staffSettings.json' }).as('getSettings')
  } else {
    sessionStorage.setItem('FAKE_CYPRESS_LOGIN', 'true')
    cy.intercept('GET', '**/api/v1/users/**/settings', { fixture: 'settings.json' }).as('getSettings')
  }
  // login & credentials
  cy.intercept(
    'REPORT',
    'https://app.launchdarkly.com/sdk/evalx/**/context',
    { fixture: 'ldarklyContext.json' }
  ).as('getLdarklyContext')

  // products
  cy.intercept('GET', '**/api/v1/orgs/**/products*', { fixture: 'products.json' }).as('getProducts')

  // business related info
  const tempBusiness = bootstrapFiling.filing.business

  cy.intercept(
    'GET',
    `**/api/v2/businesses/${tempBusiness.identifier}/filings`,
    bootstrapFiling
  ).as('tempFilings')
  
  cy.interceptAuthorizedActions(authorizations).as('getAuthorizedActions')
  // go !
  cy.visit(`/${tempBusiness.identifier}`)
  cy.wait([
    '@getAuthorizedActions',
    '@getSettings',
    '@tempFilings',
    '@getProducts',

  ])
  cy.injectAxe()
})

Cypress.Commands.add('visitBusinessDashAuthError',
  (identifier = 'BC0871427', legalType = 'BEN', errorType = 'SettingsError', authorizations=DefaultRoles) => {
    cy.wait(500) // https://github.com/cypress-io/cypress/issues/27648
    sessionStorage.setItem('FAKE_CYPRESS_LOGIN', 'true')
    const waitFor = []
      cy.interceptAuthorizedActions(authorizations).as('getAuthorizedActions')

    if (errorType === 'SettingsError') {
      cy.intercept('GET', '**/api/v1/users/**/settings', { statusCode: 500, body: {} }).as('getSettingsError')
      waitFor.push('@getSettingsError')
    } else {
      cy.intercept('GET', '**/api/v1/users/**/settings', { fixture: 'settings.json' }).as('getSettings')
      waitFor.push('@getSettings')
    }

    if (errorType === 'EntityAuthError') {
      cy.intercept('GET', `**/api/v2/permissions`, {}).as('authorizationsError')
      waitFor.push('@authorizationsError')
    } 
    

    cy.intercept(
      'REPORT',
      'https://app.launchdarkly.com/sdk/evalx/**/context',
      { fixture: 'ldarklyContext.json' }
    ).as('getLdarklyContext')
    cy.interceptBusinessContact(identifier, legalType).as('getBusinessContact')
    cy.interceptBusinessInfo(identifier, legalType).as('getBusinessInfo')
    cy.visit(`/${identifier}`)
    cy.wait(waitFor)
    cy.injectAxe()
  })

Cypress.Commands.add('visitTempBusinessDashAuthError',
  (errorType = 'SettingsError', draftFiling = undefined, authorizations=DefaultRoles) => {
    let bootstrapFiling = BoostrapFiling
    if (draftFiling) {
      bootstrapFiling = draftFiling
    }
    const tempBusiness = bootstrapFiling.filing.business
    cy.wait(500) // https://github.com/cypress-io/cypress/issues/27648
    sessionStorage.setItem('FAKE_CYPRESS_LOGIN', 'true')
    const waitFor = []
      cy.interceptAuthorizedActions(authorizations).as('getAuthorizedActions')

    if (errorType === 'SettingsError') {
      cy.intercept('GET', '**/api/v1/users/**/settings', { statusCode: 500, body: {} }).as('getSettingsError')
      waitFor.push('@getSettingsError')
    } else {
      cy.intercept('GET', '**/api/v1/users/**/settings', { fixture: 'settings.json' }).as('getSettings')
      waitFor.push('@getSettings')
    }

    if (errorType === 'EntityAuthError') {
      cy.intercept('GET', `**/api/v2/permissions`, {}).as('authorizationsError')
      waitFor.push('@authorizationsError')
    } 

    cy.intercept(
      'REPORT',
      'https://app.launchdarkly.com/sdk/evalx/**/context',
      { fixture: 'ldarklyContext.json' }
    ).as('getLdarklyContext')

    cy.intercept(
      'GET',
        `**/api/v2/businesses/${tempBusiness.identifier}/filings`,
        bootstrapFiling
    ).as('tempFilings')
    waitFor.push('@tempFilings')

    cy.visit(`/${tempBusiness.identifier}`)
    cy.wait(waitFor)
    cy.injectAxe()
  })
