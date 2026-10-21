import { ContactCentreStaffRoles, DefaultRoles } from '../../../../tests/test-utils/test-authorized-actions'

/**
 * Stub response for navigations to other BC Registries apps. The tests only verify that the dashboard
 * sends the browser to the right URL; without a stub the real external app loads (LaunchDarkly, status
 * API, ...), which is slow and leaves the test on a foreign origin.
 */
const EXTERNAL_PAGE = { statusCode: 200, body: '<html><body data-cy="external-page-stub"></body></html>' }

context('Business tombstone - action buttons in the dropdown menu', () => {
  it('Verify the Digital Business Cards button works', () => {
    // Intercept the GET request for the digital business card page
    cy.intercept('GET', '**/**/digital-credentials/**', EXTERNAL_PAGE).as('getDigitalCredentials')

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

  // one test per action: a second page load inside one test re-registers every intercept, which
  // Cypress drops intermittently (cypress-io/cypress#27648)
  const menuActions = [
    {
      button: 'consentToContinueOut',
      label: 'Consent to Continue Out',
      url: '**/**/consent-continuation-out?**filingId=0**'
    },
    { button: 'requestAgmExtension', label: 'Request AGM Extension', url: '**/**/agm-extension?**filingId=0**' },
    {
      button: 'requestAgmLocationChange',
      label: 'Request AGM Location Change',
      url: '**/**/agm-location-chg?**filingId=0**'
    },
    { button: 'amalgamate', label: 'Amalgamate', url: '**/**/amalgamation-selection?**' }
  ]
  menuActions.forEach(({ button, label, url }) => {
    it(`Verify the "${label}" action button in the dropdown menu`, () => {
      cy.on('uncaught:exception', (error: Error) => {
        // returning false here prevents Cypress from failing the test for the postMessage error that happens sometimes
        console.error('Caught error', error)
        return !error.stack?.includes('PrimaryOriginCommunicator.toSource')
      })
      cy.intercept('GET', url, EXTERNAL_PAGE).as('goToExternalApp')

      cy.visitBusinessDashFor('businessInfo/ben/active.json')
      cy.get('[data-cy="button.moreActions"]').click()
      cy.get('[data-cy="button.moreActions"]')
        .find(`[data-cy="button.${button}"]`)
        .should('have.text', label)
        .click()
      cy.wait('@goToExternalApp')
    })
  })

  it('Verify the dissolve business button works for a BEN company', () => {
    cy.intercept('POST', '**/businesses/**/filings?draft=true**', { statusCode: 201, body: {} }).as('fileDissolution')
    cy.intercept('GET', '**/**/dissolution-define-dissolution?**', EXTERNAL_PAGE).as('goToDissolution')

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
    cy.intercept('GET', '**/**/dissolution-define-dissolution?**', EXTERNAL_PAGE).as('goToDissolution')

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
