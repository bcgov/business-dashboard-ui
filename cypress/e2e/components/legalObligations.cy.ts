import { allFilings } from '../../fixtures/filings/allFilings'

context('Business dashboard -> Legal Obligations', () => {
  it('Should not be displayed when there is todo items', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, 'taskAR.json')
    cy.get('[data-cy="legalObligation"] button').should('not.exist')
  })

  it('Should not be displayed when there are maintainance filings', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, 'tasksEmpty.json', allFilings)
    cy.get('[data-cy="legalObligation"] button').should('not.exist')
  })

  it('Should not be displayed for temporary business', () => {
    cy.visitTempBusinessDash()
    cy.get('[data-cy="legalObligation"] button').should('not.exist')
  })

  it('Show legal obligations for Business Corporations Act', () => {
    const incorporationApplication = allFilings[6]
    cy.visitBusinessDashFor(
      'businessInfo/ben/active.json', undefined, false, false, 'tasksEmpty.json', [incorporationApplication]
    )
    cy.get('[data-cy="legalObligation"]')
      .should('exist')
      .as('legalObligation')
      .find('button')
      .should('have.text', 'Dismiss')
      .as('dissmissButton')

    cy.get('@legalObligation')
      .find('[data-cy="legalObligation-statement"]')
      .should('exist')
      .contains('Legal Obligations: You are required by the Business Corporations Act to keep the information ' +
        'about your corporation up to date with the Registrar: For example, you must file annual reports, ' +
        'director changes and address changes.')

    cy.get('@legalObligation')
      .find('[data-cy="legalObligation-readMore"]')
      .click()

    cy.get('@legalObligation')
      .find('[data-cy="legalObligation-detail"]')
      .invoke('text')
      .then((text) => {
        const expectedTexts = ['Changes include:', 'Annual Reports', 'Director changes', 'Company address changes']
        expectedTexts.forEach((expectedText) => { expect(text).to.include(expectedText) })
      })

    cy.get('@dissmissButton').click()
    cy.get('@legalObligation').should('not.exist')
  })

  it('Show legal obligations for Partnership Act', () => {
    const incorporationApplication = allFilings[6]
    cy.visitBusinessDashFor(
      'businessInfo/sp/active.json', undefined, false, false, 'tasksEmpty.json', [incorporationApplication]
    )
    cy.get('[data-cy="legalObligation"]')
      .should('exist')
      .as('legalObligation')
      .find('button')
      .should('have.text', 'Dismiss')
      .as('dissmissButton')

    cy.get('@legalObligation')
      .find('[data-cy="legalObligation-statement"]')
      .should('exist')
      .contains('Obligations: You are required by the Partnership Act to keep the information ' +
        'about your firm up to date with the Registrar. Please update changes as they occur.')

    cy.get('@legalObligation')
      .find('[data-cy="legalObligation-readMore"]')
      .click()

    cy.get('@legalObligation')
      .find('[data-cy="legalObligation-detail"]')
      .invoke('text')
      .then((text) => {
        const expectedTexts = [
          'Changes include:',
          'Business name changes',
          'Business address changes',
          'Proprietor/Partner address or legal name changes',
          'Membership of Partnership changes',
          'Nature of business changes',
          'Dissolving a Sole Proprietorship or Partnership'
        ]
        expectedTexts.forEach((expectedText) => { expect(text).to.include(expectedText) })
      })

    cy.get('@dissmissButton').click()
    cy.get('@legalObligation').should('not.exist')
  })
})
