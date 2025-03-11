/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference types="@commercetools-frontend/cypress" />

import {
  entryPointUriPath,
  APPLICATION_BASE_ROUTE,
  PAYMENT_METHODS
} from '../support/constants';
beforeEach(() => {
  cy.loginToMerchantCenter({
    entryPointUriPath,
    initialRoute: APPLICATION_BASE_ROUTE,
  });

  cy.fixture('forward-to').then((response) => {
    cy.intercept('GET', '/proxy/forward-to', {
      statusCode: 200,
      body: response,
    });
  });
});

describe('Test welcome.cy.ts', () => {
  it('should render method details page', () => {
    const LOCALE = Cypress.env('LOCALE');

    PAYMENT_METHODS.forEach((paymentMethod) => {
      cy.findByTestId(`name-column-${paymentMethod}`).click();
      cy.url().should('contain', 'general');
      cy.findByTestId('status-select').should('exist');
      cy.findByTestId(`name-input-${LOCALE}`).should('exist');
      cy.findByTestId(`description-input-${LOCALE}`).should('exist');
      cy.findByTestId(`display-order-input`).should('exist');
      cy.get('body').type('{esc}');
    });
  });

  it('credit card component visibility config should exist', () => {
    cy.findByTestId(`display-order-column-creditcard`).click();
    cy.url().should('contain', 'general');
    cy.findByTestId(`display-card-component`).should('exist');
  });

  it('banktransfer due date config should exist', () => {
    cy.findByTestId(`display-order-column-banktransfer`).click();
    cy.url().should('contain', 'general');
    cy.findByTestId(`banktransfer-due-date`).should('exist');
  });
});
