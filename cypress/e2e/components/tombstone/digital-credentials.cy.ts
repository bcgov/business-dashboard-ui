context('Business tombstone - Digital Business Cards button', () => {
  it('Verify the Digital Business Cards button works', () => {
    // Intercept the GET request for the digital business card page
    cy.intercept('GET', '**/**/digital-credentials/**').as('getDigitalCredentials')

    cy.visitBusinessDashFor('businessInfo/sp/withDigitalCredential.json')

    cy.get('[data-cy="button.moreActions"]')
      .click()
      .find('[id^="headlessui-menu-item-"]')
      .eq(0)
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
      .find('[id^="headlessui-menu-item-"]')
      .eq(0)
      .should('not.have.text', 'Digital Business Cards')
  })
})
