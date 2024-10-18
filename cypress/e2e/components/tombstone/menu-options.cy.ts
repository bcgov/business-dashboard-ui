context('Business tombstone - action buttons in the dropdown menu', () => {
  it('Verify the Digital Business Cards button works', () => {
    // Intercept the GET request for the digital business card page
    cy.intercept('GET', '**/**/digital-credentials/**').as('getDigitalCredentials')

    cy.visitBusinessDashFor('businessInfo/sp/withDigitalCredential.json')

    cy.get('[data-cy="button.moreActions"]')
      .click()
      .find('[data-cy="button.digitalCredentials"]')
      .should('have.text', 'Digital Business Cards')
      .as('digitalBusinessCardsButton')

    cy.fixture('businessInfo/sp/withDigitalCredential.json').then((businessInfo) => {
      cy.get('@digitalBusinessCardsButton')
        .click()
        .wait('@getDigitalCredentials')
        .its('request.url').should('include', `/${businessInfo.business.identifier}/digital-credentials/`)
    })
  })

  it('The button should be hidden when allowedActions.digitalBusinessCard === false', () => {
    cy.visitBusinessDashFor('businessInfo/sp/active.json')

    cy.get('[data-cy="button.moreActions"]')
      .click()
      .find('[data-cy="button.digitalCredentials"]')
      .should('not.exist')
  })

  it('Verify the action buttons in the dropdown menu', () => {
    // Intercept the request for Continuation Out, Request AGM Extension, Request AGM Location Change, and Amalgamate
    cy.intercept('GET', '**/**/consent-continuation-out?**filingId=0**').as('goToContinuationOut')
    cy.intercept('GET', '**/**/agm-extension?**filingId=0**').as('goToAgmExtension')
    cy.intercept('GET', '**/**/agm-location-chg?**filingId=0**').as('goToAgmLocationChange')
    cy.intercept('GET', '**/**/amalgamation-selection?**').as('goToAmalgamation')
    cy.wait(1000)

    cy.visitBusinessDashFor('businessInfo/ben/active.json')
      .get('[data-cy="button.moreActions"]').as('moreActionsButton')
      .click()
      .find('[data-cy="button.consentToContinueOut"]')
      .should('have.text', 'Consent to Continue Out')
      .click()
      .wait(500)
      .wait('@goToContinuationOut')

    cy.visitBusinessDashFor('businessInfo/ben/active.json')
      .get('@moreActionsButton')
      .click()
      .find('[data-cy="button.requestAgmExtension"]')
      .should('have.text', 'Request AGM Extension')
      .click()
      .wait(500)
      .wait('@goToAgmExtension')

    cy.visitBusinessDashFor('businessInfo/ben/active.json')
      .get('@moreActionsButton')
      .click()
      .find('[data-cy="button.requestAgmLocationChange"]')
      .should('have.text', 'Request AGM Location Change')
      .click()
      .wait(500)
      .wait('@goToAgmLocationChange')

    cy.visitBusinessDashFor('businessInfo/ben/active.json')
      .get('@moreActionsButton')
      .click()
      .find('[data-cy="button.amalgamate"]')
      .should('have.text', 'Amalgamate')
      .click()
      .wait(500)
      .wait('@goToAmalgamation')
  })

  it('Verify the dissolve business button works', () => {
    cy.intercept('POST', '**/businesses/**/filings?draft=true**', { statusCode: 201, body: {} }).as('fileDissolution')
    cy.intercept('GET', '**/**/dissolution-define-dissolution?**').as('goToDissolution')
    cy.wait(2000)
    // open the dissolution confirm dialog for 'Voluntary Dissolution' for a BEN company
    cy.visitBusinessDashFor('businessInfo/ben/active.json')
      .get('[data-cy="button.moreActions"]')
      .click()
      .find('[data-cy="button.dissolveBusiness"]')
      .should('have.text', 'Dissolve this Business')
      .click()
      .get('[data-cy="bcros-dialog-confirmDissolution"]')
      .find('[data-cy="bcros-dialog-title"]')
      .should('have.text', 'Voluntary Dissolution')

    cy.get('[data-cy="dissolution-button"]').click()
    cy.wait(2000)
    cy.wait('@fileDissolution').wait('@goToDissolution')

    // open the dissolution confirm dialog for 'Dissolution' for a SP company
    cy.visitBusinessDashFor('businessInfo/sp/active.json')
      .get('[data-cy="button.moreActions"]')
      .click()
      .find('[data-cy="button.dissolveBusiness"]')
      .click()
      .get('[data-cy="bcros-dialog-confirmDissolution"]')
      .find('[data-cy="bcros-dialog-title"]')
      .should('have.text', 'Dissolution')

    cy.get('[data-cy="dissolution-button"]').click()
    cy.wait(2000)
    cy.wait('@fileDissolution').wait('@goToDissolution')
  })
})
