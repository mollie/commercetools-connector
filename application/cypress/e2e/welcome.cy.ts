/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference types="@commercetools-frontend/cypress" />

import {
  entryPointUriPath,
  APPLICATION_BASE_ROUTE,
} from '../support/constants';

describe('Test welcome.cy.', () => {
  beforeEach(() => {
    cy.loginToMerchantCenter({
      entryPointUriPath,
      initialRoute: APPLICATION_BASE_ROUTE,
    });
  });
  it('should render page', () => {
    cy.findByText('Mollie payment methods').should('exist');
    cy.findByText('Content will follow...').should('not.exist');
  });
});
