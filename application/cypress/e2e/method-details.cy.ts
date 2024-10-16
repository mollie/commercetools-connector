/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference types="@commercetools-frontend/cypress" />

import {
  entryPointUriPath,
  APPLICATION_BASE_ROUTE,
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
    const paymentMethods = [
      'PayPal',
      'iDEAL Pay in 3 instalments, 0% interest',
      'iDEAL',
      'Bancontact',
      'Blik',
    ];

    cy.findByText(paymentMethods[0]).click();
    cy.url().should('contain', 'general');

    cy.findByTestId('status-select').should('exist');

    cy.findByTestId(`name-input-${LOCALE}`).should('exist');
    cy.findByTestId(`description-input-${LOCALE}`).should('exist');
    cy.findByTestId(`display-order-input`).should('exist');
  });

  it('should update display order successfully', () => {
    const paymentMethodIds = ['paypal', 'ideal', 'bancontact'];

    cy.findByTestId(`display-order-column-${paymentMethodIds[0]}`).click();
    cy.url().should('contain', 'general');

    cy.findByTestId(`display-order-input`).should('exist');
    cy.findByTestId(`display-order-input`).clear();
    cy.findByTestId(`display-order-input`).type('20');
    cy.findByTestId(`save-button`).click();
    cy.findByLabelText('Go back').click();
    cy.findByTestId(`display-order-column-${paymentMethodIds[0]}`).should(
      'have.text',
      20
    );
  });
});
