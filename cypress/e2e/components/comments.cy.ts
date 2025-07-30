import { BusinessRegistryStaffRoles } from '../../../tests/test-utils/test-authorized-actions'
import { allFilings } from '../../fixtures/filings/allFilings'

context('Business dashboard -> Comment side modal', () => {
  const getString = function(n) {
    let str = ''
    const characters =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const charLen = characters.length

    for (let i = 0; i < n; i++) {
      // Generating a random index
      const idx = Math.floor(Math.random() * charLen)

      str += characters.charAt(idx)
    }

    return str
  }

  it('Comment side modal is rendered', () => {
    cy.visitBusinessDashFor(
      'businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, true, BusinessRegistryStaffRoles
    )

    cy.get('[data-cy="header.actions.dropdown"] button').should('exist')
    cy.get('[data-cy="header.actions.dropdown"] button').eq(0).click()

    cy.get('.i-mdi-comment-plus').should('exist')
    cy.get('.i-mdi-comment-plus').click()

    cy.get('[data-cy="comment-add-textarea"]').should('exist')
    cy.get('[data-cy="comment-list"]').should('exist')
  })

  it('the comment modal can be closed', () => {
    cy.visitBusinessDashFor(
      'businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, true, BusinessRegistryStaffRoles
    )

    // open the comment
    cy.get('[data-cy="header.actions.dropdown"] button').eq(0).click()
    cy.get('.i-mdi-comment-plus').click()
    cy.get('[data-cy="comment"]').should('exist')

    // click the cancel button to close the modal
    cy.get('[data-cy="cancel-comment"]').click()
    cy.get('[data-cy="comment"]').should('not.exist')

    // open the comment again
    cy.get('[data-cy="header.actions.dropdown"] button').eq(0).click()
    cy.get('.i-mdi-comment-plus').click()
    cy.get('[data-cy="comment"]').should('exist')

    // click the X icon to close the modal
    cy.get('.i-mdi-close').click()
    cy.get('[data-cy="comment"]').should('not.exist')
  })

  it('Should add a comment', () => {
    const commentText = 'Test comment'
    cy.visitBusinessDashFor(
      'businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, true, BusinessRegistryStaffRoles
    )
    cy.intercept(
      'POST',
      '**/api/v2/businesses/**/comments',
      {}).as('businessCommentsPost')

    cy.get('[data-cy="header.actions.dropdown"] button').should('exist')
    cy.get('[data-cy="header.actions.dropdown"] button').eq(0).click()

    cy.get('.i-mdi-comment-plus').should('exist')
    cy.get('.i-mdi-comment-plus').click()

    cy.get('[data-cy="comment-add-textarea"]').should('exist')
    cy.get('[data-cy="comment-list"]').should('exist')

    cy.get('[data-cy="comment-add-slot"] p')
      .should('contain.text', 'Please enter a comment')
      .should('have.class', 'text-red-600')

    cy.get('[data-cy="comment-add-textarea"]').type(commentText)

    cy.get('[data-cy="comment-add-slot"] p')
      .should('not.contain.text', 'Please enter a comment')
      .should('not.have.class', 'text-red-600')

    cy.get('[data-cy="save-comment"]').should('exist').click()
    cy.wait('@businessCommentsPost')
  })

  it('Should fail to add a comment over 2000', () => {
    const commentText = getString(2001)
    cy.visitBusinessDashFor(
      'businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, true, BusinessRegistryStaffRoles
    )

    cy.get('[data-cy="header.actions.dropdown"] button').should('exist')
    cy.get('[data-cy="header.actions.dropdown"] button').eq(0).click()

    cy.get('.i-mdi-comment-plus').should('exist')
    cy.get('.i-mdi-comment-plus').click()

    cy.get('[data-cy="comment-add-textarea"]').should('exist')
    cy.get('[data-cy="comment-list"]').should('exist')

    cy.get('[data-cy="comment-add-slot"] p')
      .should('contain.text', 'Please enter a comment')
      .should('have.class', 'text-red-600')

    cy.get('[data-cy="comment-add-textarea"]').type(commentText, { delay: 0 })

    cy.get('[data-cy="comment-add-slot"] p')
      .should('contain.text', 'character too long')
      .should('have.class', 'text-red-600')

    cy.get('[data-cy="comment-add-textarea"]').type('123123123123')
    cy.get('[data-cy="comment-add-slot"] p')
      .should('contain.text', 'characters too long')
      .should('have.class', 'text-red-600')
  })
})

context('Business dashboard -> Business comments', () => {
  it('Should load comments on page load', () => {
    cy.fixture('comments/businessComments.json').then((response) => {
      cy.intercept(
        'GET',
        '**/api/v2/businesses/**/comments',
        response).as('businessComments')
    })
    cy.visitBusinessDashFor(
      'businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, true, BusinessRegistryStaffRoles
    )
    cy.get('[data-cy="button.comment"]').should('exist')
      .should('contain.text', '3 Comments')
  })

  it('Should open comment modal for business', () => {
    cy.fixture('comments/businessComments.json').then((response) => {
      cy.intercept(
        'GET',
        '**/api/v2/businesses/**/comments',
        response).as('businessComments')
    })
    cy.visitBusinessDashFor(
      'businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, true, BusinessRegistryStaffRoles
    )
    cy.get('[data-cy="button.comment"]').should('exist').click()
    cy.get('[data-cy="comment-add-textarea"]').should('exist')
    cy.get('[data-cy="comment-list"]').should('exist')
  })

  it('Should try to add a comment for business', () => {
    const commentText = 'Test comment'
    cy.fixture('comments/businessComments.json').then((response) => {
      cy.intercept(
        'GET',
        '**/api/v2/businesses/**/comments',
        response).as('businessComments')
    })

    cy.intercept(
      'POST',
      '**/api/v2/businesses/**/comments',
      {}).as('businessCommentsPost')

    cy.visitBusinessDashFor(
      'businessInfo/ben/active.json', undefined, false, false, undefined, allFilings, true, BusinessRegistryStaffRoles
    )
    cy.get('[data-cy="button.comment"]').should('exist').click()
    cy.get('[data-cy="comment-add-textarea"]').should('exist')
    cy.get('[data-cy="comment-list"]').should('exist')

    cy.get('[data-cy="comment-add-textarea"]').type(commentText)
    cy.get('[data-cy="save-comment"]').should('exist').click()

    cy.wait('@businessCommentsPost')
  })
})
