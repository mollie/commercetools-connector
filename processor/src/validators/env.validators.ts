import { optional, standardKey, standardString, region, standardDueDate } from './helpers.validators';

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

  standardKey(['mollie', 'testApiKey'], {
    code: 'InvalidMollieTestApiKey',
    message: 'Mollie test API key should be a valid string.',
    referencedBy: 'environmentVariables',
  }),

  standardKey(['mollie', 'liveApiKey'], {
    code: 'InvalidMollieLiveApiKey',
    message: 'Mollie live API key should be a valid string.',
    referencedBy: 'environmentVariables',
  }),

  standardKey(['mollie', 'profileId'], {
    code: 'InvalidMollieProfileId',
    message: 'Mollie profile id should be a valid string.',
    referencedBy: 'environmentVariables',
  }),

  standardString(
    ['mollie', 'debug'],
    {
      code: 'InvalidDebug',
      message: 'Mollie debug should be a valid string of either "0" or "1".',
      referencedBy: 'environmentVariables',
    },
    {
      min: 1,
      max: 1,
    },
  ),

  standardString(
    ['mollie', 'cardComponent'],
    {
      code: 'InvalidEnableCardComponent',
      message: 'Enable Mollie card component should be a valid string of either "0" or "1".',
      referencedBy: 'environmentVariables',
    },
    {
      min: 1,
      max: 1,
    },
  ),

  standardString(
    ['mollie', 'mode'],
    {
      code: 'InvalidMode',
      message: 'Mode should be a valid string of either "test" or "live".',
      referencedBy: 'environmentVariables',
    },
    {
      min: 1,
      max: 4,
    },
  ),
  standardDueDate(['mollie', 'bankTransferDueDate'], {
    code: 'InvalidBankTransferDueDate',
    message:
      'Bank transfer due date must be from 1d to 100d, the number must be an integer. If it was not set, the default will be 14d',
    referencedBy: 'environmentVariables',
  }),

  standardString(
    ['commerceTools', 'authMode'],
    {
      code: 'InvalidAuthMode',
      message: 'AuthMode should be a valid string of either "0" or "1".',
      referencedBy: 'environmentVariables',
    },
    {
      min: 1,
      max: 1,
    },
  ),
];

export default envValidators;
