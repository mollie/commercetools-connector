import createMollieClient, { MollieClient } from '@mollie/api-client';
import { getApiKey, readConfiguration } from '../utils/config.utils';
import { MOLLIE_VERSION_STRINGS } from '../utils/constant.utils';

/**
 * Initializes the Mollie client using the API key from the configuration.
 *
 * @return {MollieClient} Returns the initialized Mollie client.
 */
export const initMollieClient = (): MollieClient => {
  return createMollieClient({
    apiKey: getApiKey(),
    versionStrings: MOLLIE_VERSION_STRINGS,
  });
};

export const initMollieClientForApplePaySession = (): MollieClient => {
  return createMollieClient({
    apiKey: readConfiguration().mollie.liveApiKey,
    versionStrings: MOLLIE_VERSION_STRINGS,
  });
};
