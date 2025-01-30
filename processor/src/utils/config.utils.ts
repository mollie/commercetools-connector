import { ConnectorEnvVars } from '../types/index.types';
import CustomError from '../errors/custom.error';
import envValidators from '../validators/env.validators';
import { getValidateMessages } from '../validators/helpers.validators';
/**
 * Read the configuration env vars
 * (Add yours accordingly)
 *
 * @returns The configuration with the correct env vars
 */
export const readConfiguration = () => {
  const envVars: ConnectorEnvVars = {
    commerceTools: {
      clientId: process.env.CTP_CLIENT_ID as string,
      clientSecret: process.env.CTP_CLIENT_SECRET as string,
      projectKey: process.env.CTP_PROJECT_KEY as string,
      scope: process.env.CTP_SCOPE as string,
      region: process.env.CTP_REGION as string,
      authUrl: process.env.CTP_AUTH_URL as string,
      authMode: process.env.AUTHENTICATION_MODE as string,
      sessionAudience: (process.env.CTP_SESSION_AUDIENCE as string) || 'https://mc.europe-west1.gcp.commercetools.com',
      sessionIssuer: (process.env.CTP_SESSION_ISSUER as string) || 'gcp-eu',
    },
    mollie: {
      testApiKey: process.env.MOLLIE_API_TEST_KEY as string,
      liveApiKey: process.env.MOLLIE_API_LIVE_KEY as string,
      mode: process.env.CONNECTOR_MODE as string,
      debug: process.env.DEBUG as string,
      profileId: process.env.MOLLIE_PROFILE_ID as string,
    },
  };

  const validationErrors = getValidateMessages(envValidators, envVars);

  if (validationErrors.length) {
    throw new CustomError(
      'InvalidEnvironmentVariablesError',
      'Invalid Environment Variables please check your .env file. Details: ' + JSON.stringify(validationErrors),
    );
  }

  return envVars;
};

export const getApiKey = (): string => {
  if (process.env.CONNECTOR_MODE === 'test') {
    return process.env.MOLLIE_API_TEST_KEY as string;
  }
  return process.env.MOLLIE_API_LIVE_KEY as string;
};
