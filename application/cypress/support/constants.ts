export const projectKey = Cypress.env('PROJECT_KEY');

export const entryPointUriPath = 'mollie';

export const applicationBaseRoute = `/${projectKey}/${entryPointUriPath}`;
