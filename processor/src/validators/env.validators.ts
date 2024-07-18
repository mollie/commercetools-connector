import { optional, standardKey, standardString, region } from './helpers.validators';

/**
 * Create here your own validators
 */
const envValidators = [
  standardString(
    ['commerceTools', 'clientId'],
    {
      code: 'InValidClientId',
      message: 'Client id should be 24 characters.',
      referencedBy: 'environmentVariables',
    },
    { min: 24, max: 24 },
  ),

  standardString(
    ['commerceTools', 'clientSecret'],
    {
      code: 'InvalidClientSecret',
      message: 'Client secret should be 32 characters.',
      referencedBy: 'environmentVariables',
    },
    { min: 32, max: 32 },
  ),

  standardKey(['commerceTools', 'projectKey'], {
    code: 'InvalidProjectKey',
    message: 'Project key should be a valid string.',
    referencedBy: 'environmentVariables',
  }),

  optional(standardString)(
    ['scope'],
    {
      code: 'InvalidScope',
      message: 'Scope should be at least 2 characters long.',
      referencedBy: 'environmentVariables',
    },
    { min: 2, max: undefined },
  ),

  region(['commerceTools', 'region'], {
    code: 'InvalidRegion',
    message: 'Not a valid region.',
    referencedBy: 'environmentVariables',
  }),

  standardKey(['mollie', 'apiKey'], {
    code: 'InvalidMollieApiKey',
    message: 'Mollie API key should be a valid string.',
    referencedBy: 'environmentVariables',
  }),

  standardKey(['mollie', 'profileId'], {
    code: 'InvalidMollieProfileId',
    message: 'Mollie profile id should be a valid string.',
    referencedBy: 'environmentVariables',
  }),

  optional(standardString)(
    ['mollie', 'debug'],
    {
      code: 'InvalidDebug',
      message: 'Mollie debug should be a valid string.',
      referencedBy: 'environmentVariables',
    },
    {
      min: 1,
      max: undefined,
    },
  ),
];

export default envValidators;
