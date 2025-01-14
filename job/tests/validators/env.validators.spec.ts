import { describe, test, expect } from '@jest/globals';
import envValidators from '../../src/validators/env.validators';

describe('Test env.validators.ts', () => {
  test.each([
    {
      index1: 0,
      field1: 'clientId',
      error: {
        code: 'InValidClientId',
        message: 'Client id should be 24 characters.',
        referencedBy: 'environmentVariables',
      },
      condition: { min: 24, max: 24 },
    },
    {
      index1: 1,
      field1: 'clientSecret',
      error: {
        code: 'InvalidClientSecret',
        message: 'Client secret should be 32 characters.',
        referencedBy: 'environmentVariables',
      },
      condition: { min: 32, max: 32 },
    },
    {
      index1: 2,
      field1: 'projectKey',
      error: {
        code: 'InvalidProjectKey',
        message: 'Project key should be a valid string.',
        referencedBy: 'environmentVariables',
      },
      condition: undefined,
    },
    {
      index1: 3,
      field1: 'scope',
      error: {
        code: 'InvalidScope',
        message: 'Scope should be at least 2 characters long.',
        referencedBy: 'environmentVariables',
      },
      condition: { min: 2, max: undefined },
    },
    {
      index1: 4,
      field1: 'region',
      error: {
        code: 'InvalidRegion',
        message: 'Not a valid region.',
        referencedBy: 'environmentVariables',
      },
      condition: undefined,
    },
  ])(
    'should return the correct validation array contains [%s, %s]',
    async ({ index1, field1, error, condition }) => {
      // console.log(envValidators[index1]);
      field1 && expect(envValidators[index1][0]).toContain(field1);
      error && expect(envValidators[index1][1][0][1]).toStrictEqual(error);
      condition &&
        expect(envValidators[index1][1][0][2][0]).toStrictEqual(condition);
    }
  );
});
