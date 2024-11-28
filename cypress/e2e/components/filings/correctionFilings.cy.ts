import { allFilings } from '../../../fixtures/filings/allFilings'
import { devBCReg } from '../../../fixtures/origins'

context('Correction Filings', () => {
  it('Non staff don\'t get option', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, false)

    cy.get('[data-cy="header.actions.dropdown"]').should('not.exist')
  })

  it('Staff should be able to file a correction', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, true)
    cy.intercept('POST', '**/api/v2/businesses/**/filings?draft=true', {
      filing: {
        header: {
          filingId: '12345'
        }
      }
    }).as('correctionFilingsPost')

    cy.get('[data-cy="header.actions.dropdown"]').should('exist')
    cy.get('[data-cy="header.actions.dropdown"]').first().click()
    cy.get('[data-cy="header.actions.dropdown"] .fileACorrection').click()
    cy.get('input[name="correctionType"]').should('exist')
    cy.get('input[name="correctionType"]').first().click()
    cy.get('[data-cy="correctionForm.submit"]').should('exist')
    cy.get('[data-cy="correctionForm.submit"]').click()
    cy.wait('@correctionFilingsPost')

    //can't check that it has navigated away without hard checking origin
    cy.origin(devBCReg, () => {
      cy.get('body').should('contain', 'BC Registries Account Login')
    })
  })

  it("Staff shouldn't be able to file a correction against an invalid type", () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, true)
    cy.intercept('POST', '**/api/v2/businesses/**/filings', {}).as('correctionFilingsPost')

    cy.get('[data-cy="header.actions.dropdown"]').should('exist')
    //select filing 2 instead of 0 or 1 which are correctionable
    cy.get('[data-cy="header.actions.dropdown"]').eq(2).click()
    cy.get('[data-cy="header.actions.dropdown"] .fileACorrection').should('have.attr', 'aria-disabled')
    cy.get('[data-cy="header.actions.dropdown"] .fileACorrection').invoke('attr', 'aria-disabled').should('eq', 'true')
  })
})
