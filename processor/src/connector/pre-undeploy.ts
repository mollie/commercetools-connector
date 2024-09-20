import { assertError } from '../utils/assert.utils';
import { removeExtension } from './../service/connector.service';
import dotenv from 'dotenv';
dotenv.config();

async function preUndeploy(): Promise<void> {
  await removeExtension();
}

async function run(): Promise<void> {
  try {
    await preUndeploy();
  } catch (error) {
    assertError(error);
    process.stderr.write(`Pre-undeploy failed: ${error.message}`);
    process.exitCode = 1;
  }
}

run();
