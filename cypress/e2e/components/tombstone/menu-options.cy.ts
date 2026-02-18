import { ContactCentreStaffRoles, DefaultRoles } from '../../../../tests/test-utils/test-authorized-actions'

context('Business tombstone - action buttons in the dropdown menu', () => {
  it('Verify the Digital Business Cards button works', () => {
    // Intercept the GET request for the digital business card page
    cy.intercept('GET', '**/**/digital-credentials/**').as('getDigitalCredentials')

    cy.visitBusinessDashFor('businessInfo/sp/withDigitalCredential.json')

    cy.get('[data-cy="button.moreActions"]')
      .click()
    cy.get('[data-cy="button.moreActions"]')
      .find('[data-cy="button.digitalCredentials"]')
      .should('have.text', 'Digital Business Cards')
      .as('digitalBusinessCardsButton')

    cy.fixture('businessInfo/sp/withDigitalCredential.json').then((businessInfo) => {
      cy.get('@digitalBusinessCardsButton')
        .click()
      cy.get('@digitalBusinessCardsButton')
        .wait('@getDigitalCredentials')
        .its('request.url').should('include', `/${businessInfo.business.identifier}/digital-credentials/`)
    })
  })

  it('The button should be hidden when allowedActions.digitalBusinessCard === false', () => {
    cy.visitBusinessDashFor('businessInfo/sp/active.json')

    cy.get('[data-cy="button.moreActions"]')
      .click()
    cy.get('[data-cy="button.moreActions"]')
      .find('[data-cy="button.digitalCredentials"]')
      .should('not.exist')
  })

  it('Verify the action buttons in the dropdown menu', () => {
    Cypress.on('uncaught:exception', (error: Error) => {
      // returning false here prevents Cypress from failing the test for the postMessage error that happens sometimes
      console.error('Caught error', error)
      return !error.stack?.includes('PrimaryOriginCommunicator.toSource')
    })

    // Intercept the request for Continuation Out, Request AGM Extension, Request AGM Location Change, and Amalgamate
    cy.intercept('GET', '**/**/consent-continuation-out?**filingId=0**').as('goToContinuationOut')
    cy.intercept('GET', '**/**/agm-extension?**filingId=0**').as('goToAgmExtension')
    cy.intercept('GET', '**/**/agm-location-chg?**filingId=0**').as('goToAgmLocationChange')
    cy.intercept('GET', '**/**/amalgamation-selection?**').as('goToAmalgamation')

    cy.visitBusinessDashFor('businessInfo/ben/active.json')
      .get('[data-cy="button.moreActions"]').as('moreActionsButton')
      .click()
      .find('[data-cy="button.consentToContinueOut"]')
      .should('have.text', 'Consent to Continue Out')
      .click()
      .wait('@goToContinuationOut')

    cy.visitBusinessDashFor('businessInfo/ben/active.json')
      .get('@moreActionsButton')
      .click()
      .find('[data-cy="button.requestAgmExtension"]')
      .should('have.text', 'Request AGM Extension')
      .click()
      .wait('@goToAgmExtension')

    cy.visitBusinessDashFor('businessInfo/ben/active.json')
      .get('@moreActionsButton')
      .click()
      .find('[data-cy="button.requestAgmLocationChange"]')
      .should('have.text', 'Request AGM Location Change')
      .click()
      .wait('@goToAgmLocationChange')

    cy.visitBusinessDashFor('businessInfo/ben/active.json')
      .get('@moreActionsButton')
      .click()
      .find('[data-cy="button.amalgamate"]')
      .should('have.text', 'Amalgamate')
      .click()
      .wait('@goToAmalgamation')
  })

  it('Verify the dissolve business button works for a BEN company', () => {
    cy.intercept('POST', '**/businesses/**/filings?draft=true**', { statusCode: 201, body: {} }).as('fileDissolution')
    cy.intercept('GET', '**/**/dissolution-define-dissolution?**').as('goToDissolution')

    // open the dissolution confirm dialog for 'Voluntary Dissolution'
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
    cy.wait(['@fileDissolution']) // Cypress doesn't like to wait for CORS urls .wait('@goToDissolution')
  })

  it('Verify the dissolve business button works for a Sole Prop', () => {
    cy.intercept('POST', '**/businesses/**/filings?draft=true**', { statusCode: 201, body: {} }).as('fileDissolution')
    cy.intercept('GET', '**/**/dissolution-define-dissolution?**').as('goToDissolution')

    // open the dissolution confirm dialog for 'Dissolution'
    cy.visitBusinessDashFor('businessInfo/sp/active.json')
    cy.get('[data-cy="button.moreActions"]').click()

    cy.get('[data-cy="button.moreActions"]')
      .find('[data-cy="button.dissolveBusiness"]')
      .click()
    cy.get('[data-cy="bcros-dialog-confirmDissolution"]')
      .find('[data-cy="bcros-dialog-title"]')
      .should('have.text', 'Dissolution')

    cy.get('[data-cy="dissolution-button"]').click()
    cy.wait(['@fileDissolution'])// Cypress doesn't like to wait for CORS urls .wait('@goToDissolution')
  })

  it('shows the Annual Report Reminders dialog', () => {
    // use the bc/active fixture that allows action "arReminder"
    // use DefaultRoles authorization that includes AR_REMINDER_OPT_OUT
    cy.visitBusinessDashFor('businessInfo/bc/active.json', undefined, undefined, undefined,
      undefined, undefined, undefined, DefaultRoles)
      .get('[data-cy="button.moreActions"]')
      .click()
      .find('[data-cy="button.annualReportReminders"]')
      .should('have.text', 'Annual Report Reminders')

    // FUTURE
    // cy.intercept('GET', '**/api/v2/businesses/**/ar-reminder', { arReminder: true }).as('getArReminder')
    // cy.intercept('PUT', '**/api/v2/businesses/**/ar-reminder', { statusCode: 200, body: {} }).as('saveArReminder')

    // // open and verify the Annual Report Reminders dialog
    // cy.get('[data-cy="button.annualReportReminders"]')
    //   .click()
    //   .get('[data-cy="bcros-dialog-annualReportReminders"]')
    //   .find('[data-cy="bcros-dialog-title"]')
    //   .should('have.text', 'Annual Report Reminders')

    // // click the toggle button and wait for PUT network call to succeed
    // cy.get('[data-cy="toggle-button"]').click()
    // cy.wait(['@saveArReminder'])

    // // click the close button and verify dialog closes
    // cy.get('[data-cy="close-button"]').click()
    // cy.get('[data-cy="bcros-dialog-annualReportReminders"]')
    //   .should('not.exist')
  })

  it('doesn\'t show the Annual Report Reminders button when not allowed', () => {
    // use the sp/active fixture that does not allow action "arReminder"
    // use DefaultRoles authorization that includes AR_REMINDER_OPT_OUT
    cy.visitBusinessDashFor('businessInfo/sp/active.json', undefined, false, false,
      undefined, undefined, undefined, DefaultRoles)

    cy.get('[data-cy="button.moreActions"]')
      .click({ force: true })

    cy.get('[data-cy="button.moreActions"]')
      .find('[data-cy="button.annualReportReminders"]')
      .should('not.exist')
  })

  it('doesn\'t show the Annual Report Reminders button when not authorized', () => {
    // use the bc/active fixture that allows action "arReminder"
    // use ContactCentreStaffRoles authorization that does not include AR_REMINDER_OPT_OUT
    cy.visitBusinessDashFor('businessInfo/bc/active.json', undefined, undefined, undefined,
      undefined, undefined, undefined, ContactCentreStaffRoles)

    cy.get('[data-cy="button.moreActions"]')
      .click({ force: true })

    cy.get('[data-cy="button.moreActions"]')
      .find('[data-cy="button.annualReportReminders"]')
      .should('not.exist')
  })
})
