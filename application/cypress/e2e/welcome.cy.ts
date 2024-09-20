import { entryPointUriPath, applicationBaseRoute } from '../support/constants';

describe('Test welcome.cy.', () => {
  beforeEach(() => {
    cy.loginToMerchantCenter({
      entryPointUriPath,
      initialRoute: applicationBaseRoute,
    });
  });
  it('should render page', () => {
    cy.findByText('Mollie').should('exist');
    cy.findByText('Content will follow...').should('exist');
  });
});
