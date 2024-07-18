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
    },
    mollie: {
      apiKey: process.env.MOLLIE_API_KEY as string,
      debug: process.env.DEBUG as string,
      profileId: process.env.MOLLIE_PROFILE_ID as string,
    },
  };

  const validationErrors = getValidateMessages(envValidators, envVars);

  if (validationErrors.length) {
    throw new CustomError(
      'InvalidEnvironmentVariablesError',
      'Invalid Environment Variables please check your .env file',
    );
  }

  return envVars;
};
