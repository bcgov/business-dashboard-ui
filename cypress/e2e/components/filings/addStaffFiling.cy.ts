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

  it('Menu options are rendered - active BEN company', () => {
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
    cy.get('[data-cy="admin-freeze"]').should('exist').should('not.be.disabled')
    cy.get('[data-cy="dissolution"]').should('exist').should('not.be.disabled')
    cy.get('[data-cy="registrar-notation"]').should('exist').should('not.be.disabled')
    cy.get('[data-cy="registrar-order"]').should('exist').should('not.be.disabled')
    cy.get('[data-cy="court-order"]').should('exist').should('not.be.disabled')
    cy.get('[data-cy="record-conversion"]').should('not.exist')
    cy.get('[data-cy="restore"]').should('not.exist')
    cy.get('[data-cy="put-back-on"]').should('not.exist')
  })

  it('Menu options are rendered - active SP company', () => {
    cy.fixture('comments/businessComments.json').then((response) => {
      cy.intercept(
        'GET',
        '**/api/v2/businesses/**/comments',
        response).as('businessComments')
    })
    cy.visitBusinessDashFor('businessInfo/sp/active.json', undefined, false, false, undefined, allFilings, true)
    // cy.wait(5000)
    cy.get('[data-cy="add-staff-filing"]').should('exist')
    cy.get('[data-cy="add-staff-filing"]').click()
    cy.get('[data-cy="admin-freeze"]').should('exist').should('not.be.disabled')
    cy.get('[data-cy="dissolution"]').should('exist').should('not.be.disabled')
    cy.get('[data-cy="registrar-notation"]').should('exist').should('not.be.disabled')
    cy.get('[data-cy="registrar-order"]').should('exist').should('not.be.disabled')
    cy.get('[data-cy="court-order"]').should('exist').should('not.be.disabled')

    // record conversion only visible for SP and GP
    cy.get('[data-cy="record-conversion"]').should('exist').should('not.be.disabled')

    cy.get('[data-cy="restore"]').should('not.exist')
    cy.get('[data-cy="put-back-on"]').should('not.exist')
  })

  it('Menu options are rendered - historical business', () => {
    cy.fixture('comments/businessComments.json').then((response) => {
      cy.intercept(
        'GET',
        '**/api/v2/businesses/**/comments',
        response).as('businessComments')
    })
    cy.visitBusinessDashFor('businessInfo/bc/historical.json', undefined, false, false, undefined, allFilings, true)
    // cy.wait(5000)
    cy.get('[data-cy="add-staff-filing"]').should('exist')
    cy.get('[data-cy="add-staff-filing"]').click()
    cy.get('[data-cy="admin-freeze"]').should('not.exist')
    cy.get('[data-cy="dissolution"]').should('not.exist')
    cy.get('[data-cy="registrar-notation"]').should('exist').should('not.be.disabled')
    cy.get('[data-cy="registrar-order"]').should('exist').should('not.be.disabled')
    cy.get('[data-cy="court-order"]').should('exist').should('not.be.disabled')
    cy.get('[data-cy="record-conversion"]').should('not.exist')
    cy.get('[data-cy="restore"]').should('exist')
    cy.get('[data-cy="put-back-on"]').should('exist').should('not.be.disabled')
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

  it('staff notation form modal is rendered', () => {
    cy.fixture('comments/businessComments.json').then((response) => {
      cy.intercept(
        'GET',
        '**/api/v2/businesses/**/comments',
        response).as('businessComments')
    })
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, true)
    cy.get('[data-cy="add-staff-filing"]').should('exist')
    cy.get('[data-cy="add-staff-filing"]').click()

    // Add Registrar Notation
    cy.get('[data-cy="registrar-notation"]').click()

    cy.get('[data-cy="modal-body"]')
      .should('contain', 'Enter a Registrar\'s Notation that will appear on the ledger for this entity')

    cy.get('[data-cy="notation"]').should('exist')
    cy.get('[data-cy="court-order-number"]').should('exist')
    cy.get('[data-cy="plan-of-arrangement"]').should('exist')
    cy.get('[data-cy="submit-add-staff-filing-modal"]').click()
    cy.get('[data-cy="modal-body"]').should('contain', 'Enter a Registrar\'s Notation')
    cy.get('[data-cy="cancel-add-staff-filing-modal"]').click()

    // Add Court Order
    cy.get('[data-cy="add-staff-filing"]').click()

    cy.get('[data-cy="court-order"]').click()
    cy.get('[data-cy="modal-body"]')
      .should('contain', 'Enter a Court Order that will appear on the ledger for this entity')
    cy.get('[data-cy="notation"]').should('exist')
    cy.get('[data-cy="court-order-upload"]').should('exist')
    cy.get('[data-cy="court-order-number"]').should('exist')
    cy.get('[data-cy="plan-of-arrangement"]').should('exist')
  })
})
