context('Business dashboard -> Side components: Current Directors, Partners, Proprietors', () => {
  it('Directors accordion is rendered', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json')
    cy.get('[data-cy="accordion_directors"]')
      .should('exist')
      .children().eq(0).children()
      .should('have.length', 5)
      .get('[data-cy="header_directors"]')
      .should('contain', 'Current Directors')

    cy.intercept('GET', '**/BC**/standalone-directors**').as('changeDirector')
    cy.get('[data-cy="change-button"]')
      .should('exist')
      .click()
      .wait('@changeDirector')
  })

  it('Partners accordion is rendered', () => {
    cy.visitBusinessDashFor('businessInfo/gp/active.json')
    cy.get('[data-cy="accordion_partners"]')
      .should('exist')
      .children().eq(0).children()
      .should('have.length', 3)
      .get('[data-cy="header_partner"]')
      .should('contain', 'Partners')

    cy.intercept('GET', '**/FM**/change**').as('changePartner')
    cy.get('[data-cy="change-button"]').should('exist').click()
    cy.wait('@changePartner')
  })

  it('Proprietor accordion is rendered', () => {
    cy.visitBusinessDashFor('businessInfo/sp/active.json')
    cy.get('[data-cy="accordion_proprietor"]')
      .should('exist')
      .children().eq(0).children()
      .should('have.length', 1)
      .get('[data-cy="header_proprietor"]')
      .should('contain', 'Proprietor')

    cy.intercept('GET', '**/FM**/change**').as('changeProprietor')
    cy.get('[data-cy="change-button"]').should('exist').click()
    cy.wait('@changeProprietor')
  })

  it('Change button does not exist for historical businesses', () => {
    cy.visitBusinessDashFor('businessInfo/bc/historical.json')
    cy.get('[data-cy="change-button"]').should('not.exist')
  })

  it('Change button is disabled when \'changeOfDirector\' is not in allowable actions', () => {
    cy.visitBusinessDashFor('businessInfo/ben/unable-to-change-address-and-party.json')
    cy.get('[data-cy="change-button"]').should('be.disabled')
  })
})
