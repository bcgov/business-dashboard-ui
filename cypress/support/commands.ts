Cypress.Commands.add('interceptBusinessSlim', (identifier, legalType, isHistorical) => {
  cy.fixture(`business${legalType}`).then((business) => {
    business.identifier = identifier
    if (isHistorical) {
      business.state = 'HISTORICAL'
    }
    cy.intercept(
      'GET',
      `**/api/v2/businesses/${business.identifier}?slim=true`,
      { business })
  })
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

Cypress.Commands.add('visitBusinessDash', (identifier = 'BC0871427', legalType = 'BEN', isHistorical = false) => {
  sessionStorage.setItem('FAKE_CYPRESS_LOGIN', 'true')
  cy.intercept('GET', '**/api/v1/users/**/settings', { fixture: 'settings.json' }).as('getSettings')
  cy.intercept(
    'REPORT',
    'https://app.launchdarkly.com/sdk/evalx/**/context',
    { fixture: 'ldarklyContext.json' }
  ).as('getLdarklyContext')
  cy.intercept('GET', '**/api/v1/orgs/**/products*', { fixture: 'products.json' }).as('getProducts')
  cy.interceptBusinessContact(identifier, legalType).as('getBusinessContact')
  cy.interceptBusinessSlim(identifier, legalType, isHistorical).as('getBusinessSlim')
  cy.interceptAddresses(legalType).as('getAddresses')
  cy.interceptParties(legalType, isHistorical).as('getParties')

  cy.visit(`/${identifier}`)
  cy.wait(['@getSettings', '@getProducts', '@getBusinessContact', '@getBusinessSlim', '@getAddresses', '@getParties'])
  cy.injectAxe()
})

Cypress.Commands.add('visitBusinessDashAuthError', (identifier = 'BC0871427', legalType = 'BEN') => {
  sessionStorage.setItem('FAKE_CYPRESS_LOGIN', 'true')
  cy.intercept('GET', '**/api/v1/users/**/settings', { statusCode: 500, body: {} }).as('getSettingsError')
  cy.intercept(
    'REPORT',
    'https://app.launchdarkly.com/sdk/evalx/**/context',
    { fixture: 'ldarklyContext.json' }
  ).as('getLdarklyContext')
  cy.interceptBusinessContact(identifier, legalType).as('getBusinessContact')
  cy.interceptBusinessSlim(identifier, legalType).as('getBusinessSlim')
  cy.visit(`/${identifier}`)
  cy.wait(['@getSettingsError'])
  cy.injectAxe()
})
