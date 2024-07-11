import createMollieClient, { MollieClient } from '@mollie/api-client';
import { readConfiguration } from '../utils/config.utils';
import { LIBRARY_NAME, LIBRARY_VERSION } from '../utils/constant.utils';

/**
 * Initializes the Mollie client using the API key from the configuration.
 *
 * @return {MollieClient} Returns the initialized Mollie client.
 */
export const initMollieClient = (): MollieClient => {
  const { mollie } = readConfiguration();
  return createMollieClient({
    apiKey: mollie.apiKey,
    versionStrings: `${LIBRARY_NAME}/${LIBRARY_VERSION}`,
  });
};
