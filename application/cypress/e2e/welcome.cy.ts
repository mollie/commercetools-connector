/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference types="@commercetools-frontend/cypress" />

import {
  entryPointUriPath,
  APPLICATION_BASE_ROUTE,
} from '../support/constants';

describe('Test welcome.cy.ts', () => {
  beforeEach(() => {
    cy.loginToMerchantCenter({
      entryPointUriPath,
      initialRoute: APPLICATION_BASE_ROUTE,
    });
  });
  it('should render payment methods list', () => {
    cy.fixture('forward-to').then((response) => {
      cy.intercept('GET', '/proxy/forward-to', {
        statusCode: 200,
        body: response,
      });
    });

    const paymentMethods = [
      'PayPal',
      'iDEAL Pay in 3 instalments, 0% interest',
      'iDEAL',
      'Bancontact',
      'Blik',
    ];

    const headers = ['Payment method', 'Active', 'Icon', 'Display order'];

    cy.findByText('Mollie payment methods').should('exist');
    cy.findByText('Content will follow...').should('not.exist');

    headers.forEach((header) => {
      cy.findByText(header).should('exist');
    });

    paymentMethods.forEach((paymentMethod) => {
      cy.findByText(paymentMethod).should('exist');
    });
  });

  it('should render no data notification', () => {
    cy.fixture('forward-to').then((response) => {
      cy.intercept('GET', '/proxy/forward-to', {
        statusCode: 200,
        body: {},
      });
    });

    cy.findByText('Mollie yment methods').should('exist');
    cy.findByText('Content will follow...').should('not.exist');
    cy.get('[data-testid="no-data-notification"]').should('exist');
  });
});
