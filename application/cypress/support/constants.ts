export const projectKey = Cypress.env('PROJECT_KEY');

export const entryPointUriPath = 'mollie';

export const APPLICATION_BASE_ROUTE = `/${projectKey}/${entryPointUriPath}`;
