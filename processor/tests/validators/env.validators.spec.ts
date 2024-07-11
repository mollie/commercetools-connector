import { describe, test, expect } from '@jest/globals';
import envValidators from '../../src/validators/env.validators';

describe('Test env.validators.ts', () => {
  test.each([
    {
      index1: 0,
      index2: 0,
      field1: 'commerceTools',
      field2: 'clientId',
      error: {
        code: 'InValidClientId',
        message: 'Client id should be 24 characters.',
        referencedBy: 'environmentVariables',
      },
      condition: { min: 24, max: 24 },
    },
    {
      index1: 1,
      index2: 0,
      field1: 'commerceTools',
      field2: 'clientSecret',
      error: {
        code: 'InvalidClientSecret',
        message: 'Client secret should be 32 characters.',
        referencedBy: 'environmentVariables',
      },
      condition: { min: 32, max: 32 },
    },
    {
      index1: 2,
      index2: 0,
      field1: 'commerceTools',
      field2: 'projectKey',
      error: {
        code: 'InvalidProjectKey',
        message: 'Project key should be a valid string.',
        referencedBy: 'environmentVariables',
      },
      condition: undefined,
    },
    {
      index1: 3,
      index2: 0,
      field1: 'scope',
      field2: '',
      error: {
        code: 'InvalidScope',
        message: 'Scope should be at least 2 characters long.',
        referencedBy: 'environmentVariables',
      },
      condition: { min: 2, max: undefined },
    },
    {
      index1: 4,
      index2: 0,
      field1: 'commerceTools',
      field2: 'region',
      error: {
        code: 'InvalidRegion',
        message: 'Not a valid region.',
        referencedBy: 'environmentVariables',
      },
      condition: undefined,
    },
    {
      index1: 5,
      index2: 0,
      field1: 'mollie',
      field2: 'apiKey',
      error: {
        code: 'InvalidMollieApiKey',
        message: 'Mollie API key should be a valid string.',
        referencedBy: 'environmentVariables',
      },
      condition: undefined,
    },
    {
      index1: 6,
      index2: 0,
      field1: 'mollie',
      field2: 'debug',
      error: {
        code: 'InvalidDebug',
        message: 'Mollie debug should be a valid string',
        referencedBy: 'environmentVariables',
      },
      condition: { min: 1, max: undefined },
    },
  ])(
    'should return the correct validation array expected envValidators[%s][%s] contains [%s, %s]',
    async ({ index1, index2, field1, field2, error, condition }) => {
      field1 && expect(envValidators[index1][index2]).toContain(field1);
      field2 && expect(envValidators[index1][index2]).toContain(field2);
      error && expect(envValidators[index1][1][0][1]).toStrictEqual(error);
      condition && expect(envValidators[index1][1][0][2][0]).toStrictEqual(condition);
    },
  );
});
