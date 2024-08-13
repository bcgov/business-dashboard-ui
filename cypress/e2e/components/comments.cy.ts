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
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, undefined, allFilings, true)

    cy.get('[data-cy="header.actions.dropdown"] button').should('exist')
    cy.get('[data-cy="header.actions.dropdown"] button').eq(0).click()

    cy.get('.i-mdi-comment-plus').should('exist')
    cy.get('.i-mdi-comment-plus').click()

    cy.get('[data-cy="comment-add-textarea"]').should('exist')
    cy.get('[data-cy="comment-list"]').should('exist')
  })

  it('Should add a comment', () => {
    const commentText = 'Test comment'
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, undefined, allFilings, true)

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
  })

  it('Should fail to add a comment over 2000', () => {
    const commentText = getString(2001)
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, undefined, allFilings, true)

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
      .should('contain.text', 'character too long')
      .should('have.class', 'text-red-600')

    cy.get('[data-cy="comment-add-textarea"]').type('123123123123')
    cy.get('[data-cy="comment-add-slot"] p')
      .should('contain.text', 'characters too long')
      .should('have.class', 'text-red-600')
  })
})