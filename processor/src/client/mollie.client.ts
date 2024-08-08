import createMollieClient, { MollieClient } from '@mollie/api-client';
import { getApiKey } from '../utils/config.utils';
import { VERSION_STRING } from '../utils/constant.utils';

/**
 * Initializes the Mollie client using the API key from the configuration.
 *
 * @return {MollieClient} Returns the initialized Mollie client.
 */
export const initMollieClient = (): MollieClient => {
  return createMollieClient({
    apiKey: getApiKey(),
    versionStrings: `${VERSION_STRING}`,
  });
};
