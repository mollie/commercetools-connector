import dotenv from 'dotenv';
dotenv.config();

import { assertError, assertString } from '../utils/assert.utils';
import { createExtensionAndCustomFields } from '../service/connector.service';
import { logger } from '../utils/logger.utils';

const CONNECT_APPLICATION_URL_KEY = 'CONNECT_SERVICE_URL';

async function postDeploy(properties: Map<string, unknown>): Promise<void> {
  const applicationUrl = properties.get(CONNECT_APPLICATION_URL_KEY);

  assertString(applicationUrl, CONNECT_APPLICATION_URL_KEY);

  logger.info('Processor URL: ', applicationUrl);
  logger.info('properties', properties);

  await createExtensionAndCustomFields(applicationUrl);
}

async function run(): Promise<void> {
  try {
    const properties = new Map(Object.entries(process.env));
    await postDeploy(properties);
  } catch (error) {
    assertError(error);
    process.stderr.write(`Post-deploy failed: ${error.message}`);
    process.exitCode = 1;
  }
}

run();
