/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference types="@commercetools-frontend/cypress" />

import {
  entryPointUriPath,
  APPLICATION_BASE_ROUTE,
} from '../support/constants';

let customObjects;
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

  cy.fixture('objects-paginated').then((response) => {
    customObjects = response;
    cy.intercept('/graphql', (req) => {
      if (req.body.operationName === 'FetchCustomObjects') {
        req.reply({
          data: {
            customObjects: {
              results: response.results,
              count: response.results.length,
              offset: 0,
              total: response.results.length,
              __typename: 'CustomObjectQueryResult',
            },
          },
        });
      } else if (req.body.operationName === 'FetchCustomObjectDetails') {
        req.reply({
          data: {
            customObject: response.results[0], // Should be "Apple Pay" to align with the below test cases
          },
        });
      } else {
        req.continue();
      }
    });
  });
});

describe('Test method details - availability tab', () => {
  it('should be fully functional', () => {
    const LOCALE = Cypress.env('LOCALE');
    const paymentMethods = 'Apple Pay';

    cy.findByText(paymentMethods).click();
    cy.url().should('contain', 'general');

    cy.findByText('Availability').should('exist').click();

    cy.findByText('Currency');
    cy.findByText('Min amount');
    cy.findByText('Max amount');
    cy.findByText('Country');
    cy.findByText('Surcharge transaction cost');

    cy.findByText('EUR');
    cy.findByText('DE');
    cy.findByText(333);
    cy.findByText(999);

    // Create new records
    cy.findByTestId('availability-add-configuration-button').click();

    cy.findByTestId('select-country');
    cy.findByTestId('select-currency');

    // Error message displayed
    cy.findByTestId('money-field-minAmount').type('20');
    cy.findByTestId('money-field-maxAmount').type('10');
    cy.findByText('Maximum amount has to be higher then minimum amount.');

    // Start creating new record
    const newAvailability = {
      countryCode: 'GB',
      currencyCode: 'GBP',
      minAmount: 100,
      maxAmount: 444,
      surchargeCost: {
        percentageAmount: 2,
        fixedAmount: 10
      }
    };

    cy.findByTestId('money-field-maxAmount').type(
      newAvailability.maxAmount.toString()
    );
    cy.findByTestId('money-field-minAmount').type(
      newAvailability.minAmount.toString()
    );
    cy.findByText(
      'Maximum amount has to be higher then minimum amount.'
    ).should('not.exist');

    cy.findByTestId('money-field-surchargeCost--percentageAmount').type(
      newAvailability.surchargeCost.percentageAmount.toString()
    );
    cy.findByTestId('money-field-surchargeCost--fixedAmount').type(
      newAvailability.surchargeCost.fixedAmount.toString()
    );

    const totalSurchargeCost = newAvailability.surchargeCost.percentageAmount + '% + ' + newAvailability.surchargeCost.fixedAmount + newAvailability.currencyCode;

    const updatedPricingConstraints =
      customObjects.results[0].value.pricingConstraints ?? [];
    updatedPricingConstraints.push(newAvailability);

    let updatedMethodDetailsObject = Object.assign(
      {},
      customObjects.results[0]
    );
    updatedMethodDetailsObject.value.pricingConstraints =
      updatedPricingConstraints;

    cy.intercept('/graphql', (req) => {
      if (req.body.operationName === 'UpdateCustomObjectDetails') {
        req.reply({
          data: {
            createOrUpdateCustomObject: updatedMethodDetailsObject,
          },
        });
      } else {
        req.continue();
      }
    });

    cy.findByTestId('availability-save-button').click();
    cy.url().should('contain', 'availability');

    updatedMethodDetailsObject.value.pricingConstraints.forEach((item) => {
      cy.findByText(item.countryCode).should('exist');
      cy.findByText(item.currencyCode).should('exist');
      cy.findByText(item.minAmount.toString()).should('exist');
      cy.findByText(item.maxAmount.toString()).should('exist');
    });

    cy.findByText(totalSurchargeCost).should('exist');
  });
});
