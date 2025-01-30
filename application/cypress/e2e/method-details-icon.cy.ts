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

describe('Test method details - Icon tab', () => {
  it('should be fully functional', () => {
    const paymentMethod = 'PayPal';

    cy.findByText(paymentMethod).click();

    cy.findByRole('tab', { name: 'Icon' }).click();
    cy.url().should('contain', 'icon');

    cy.findByTestId('image-url-input').should('be.visible');
    cy.findByTestId('image-preview').should('be.visible');
  });
});
