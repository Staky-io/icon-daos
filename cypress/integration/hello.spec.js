import { viewports } from '../utils/viewports'

describe('base test', () => {
  it('should display "Hello world!" message', () => {
    cy.visit('/')
    cy.title().should('include', 'Hello')
    cy.get('[data-test=title]').should(($title) => {
      expect($title.first()).to.contain('Hello world!')
    })
  })

  viewports.forEach((viewport) => {
    it(`Should display title on ${viewport} screen`, () => {
      cy.viewport(...viewport)
      cy.visit('/')
      cy.title().should('include', 'Hello')
      cy.get('[data-test=title]').should('be.visible')
    })
  })
})
