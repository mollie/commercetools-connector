/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference types="@commercetools-frontend/cypress" />

import {
  entryPointUriPath,
  APPLICATION_BASE_ROUTE,
  PAYMENT_METHODS,
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

    const headers = ['name', 'status', 'image', 'order'];

    cy.findByText('Mollie payment methods').should('exist');
    cy.findByText('Content will follow...').should('not.exist');

    headers.forEach((header) => {
      cy.findByTestId(`header-${header}`).should('exist');
    });

    PAYMENT_METHODS.forEach((paymentMethod) => {
      cy.findByTestId(`name-column-${paymentMethod}`).should('exist');
    });
  });

  it('should render no data notification', () => {
    cy.fixture('forward-to').then(() => {
      cy.intercept('GET', '/proxy/forward-to', {
        statusCode: 200,
        body: {},
      });
    });

    cy.findByText('Mollie payment methods').should('exist');
    cy.findByText('Content will follow...').should('not.exist');
    cy.get('[data-testid="no-data-notification"]').should('exist');
  });
});
