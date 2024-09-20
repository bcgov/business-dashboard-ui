import { allFilings } from '../../../fixtures/filings/allFilings'

context('Add Staff Filing', () => {
  it('Non staff shouldn\'t see menu', () => {
    cy.fixture('comments/businessComments.json').then((response) => {
      cy.intercept(
        'GET',
        '**/api/v2/businesses/**/comments',
        response).as('businessComments')
    })
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, false)
    // cy.wait(5000)
    cy.get('[data-cy="add-staff-filing"]').should('not.exist')
  })

  it('Staff should see menu', () => {
    cy.fixture('comments/businessComments.json').then((response) => {
      cy.intercept(
        'GET',
        '**/api/v2/businesses/**/comments',
        response).as('businessComments')
    })
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, true)
    // cy.wait(5000)
    cy.get('[data-cy="add-staff-filing"]').should('exist')
  })

  it('Staff should be able to cancel filing', () => {
    cy.fixture('comments/businessComments.json').then((response) => {
      cy.intercept(
        'GET',
        '**/api/v2/businesses/**/comments',
        response).as('businessComments')
    })
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, true)
    // cy.wait(5000)
    cy.get('[data-cy="add-staff-filing"]').should('exist')
    cy.get('[data-cy="add-staff-filing"]').click()
    // cy.wait(1000)

    cy.get('[data-cy="admin-freeze"]').should('exist')
    cy.get('[data-cy="admin-freeze"]').click()
    // cy.wait(1000)

    cy.get('#dialog-title').should('exist').should('contain', 'Freeze Business')
    cy.get('[data-cy="modal-body"]').should('exist').should('contain', 'This filing')

    cy.get('[data-cy="cancel-add-staff-filing-modal"]').should('exist')
    cy.get('[data-cy="cancel-add-staff-filing-modal"]').click()

    cy.get('#dialog-title').should('not.exist')
  })

  it('Staff should be able to freeze', () => {
    cy.fixture('comments/businessComments.json').then((response) => {
      cy.intercept(
        'GET',
        '**/api/v2/businesses/**/comments',
        response).as('businessComments')
    })
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, true)
    // cy.wait(5000)
    cy.intercept(
      'POST',
      '**/api/v2/businesses/**/filings',
      {}).as('businessFilingsPost')

    cy.get('[data-cy="add-staff-filing"]').should('exist')
    cy.get('[data-cy="add-staff-filing"]').click()
    // cy.wait(1000)

    cy.get('[data-cy="admin-freeze"]').should('exist')
    cy.get('[data-cy="admin-freeze"]').click()
    // cy.wait(1000)

    cy.get('#dialog-title').should('exist').should('contain', 'Freeze Business')
    cy.get('[data-cy="modal-body"]').should('exist').should('contain', 'This filing')

    cy.get('[data-cy="submit-add-staff-filing-modal"]').should('exist')
    cy.get('[data-cy="submit-add-staff-filing-modal"]').click()
    cy.wait('@businessFilingsPost')

    cy.get('#dialog-title').should('not.exist')
  })
})
