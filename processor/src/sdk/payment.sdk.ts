import { readConfiguration } from '../utils/config.utils';
import { RequestContextData, setupPaymentSDK } from '@commercetools/connect-payments-sdk';

const config = readConfiguration().commerceTools;

export const paymentSdk = setupPaymentSDK({
  projectKey: config.projectKey,
  clientId: config.clientId,
  clientSecret: config.clientId,
  authUrl: `https://auth.${config.region}.commercetools.com`,
  apiUrl: `https://api.${config.region}.commercetools.com`,
  sessionUrl: `https://session.${config.region}.commercetools.com`,
  jwksUrl: `https://mc-api.${config.region}.commercetools.com/.well-known/jwks.json`,
  jwtIssuer: `https://mc-api.${config.region}.commercetools.com`,
  getContextFn: (): RequestContextData => {
    return {
      correlationId: '',
      requestId: '',
    };
  },
  updateContextFn: () => {},
});
