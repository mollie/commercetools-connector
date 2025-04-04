export const projectKey = Cypress.env('PROJECT_KEY');

export const entryPointUriPath = 'mollie';

export const APPLICATION_BASE_ROUTE = `/${projectKey}/${entryPointUriPath}`;

export const PAYMENT_METHODS = [
  'paypal',
  'creditcard',
  'ideal',
  'banktransfer',
  'bancontact',
  'przelewy24',
  'kbc',
  'applepay',
  'blik',
  'klarna',
  'trustly',
  'bancomatpay',
  'mbway',
  'multibanco',
  'satispay',
  'twint',
  'paybybank',
  'eps',
];
