import {
  standardDueDate,
  array,
  standardEmail,
  standardNaturalNumber,
  standardString,
  standardKey,
  standardUrl,
  getValidateMessages,
  optional,
  region,
} from './../../src/validators/helpers.validators';
import { describe, test, expect, jest, it } from '@jest/globals';
import { ConnectorEnvVars, Message } from '../../src/types/index.types';
import envValidators from '../../src/validators/env.validators';

const mockObject = {
  standardString: {
    path: ['./demo/path'] as string[],
    message: {
      code: 'InValidClientId',
      message: 'Client id should be 24 characters.',
      referencedBy: 'environmentVariables',
    } as Message,
    overrideConfig: { min: 2, max: 34 } as object | undefined,
  },
  standardEmail: {
    path: ['./demo/path/email'] as string[],
    message: {
      code: 'InvalidEmail',
      message: 'Not a valid email.',
      referencedBy: 'environmentVariables',
    } as Message,
  },
  standardNaturalNumber: {
    path: ['./demo/path/naturalNumber'] as string[],
    message: {
      code: 'InvalidNaturalNumber',
      message: 'Not a valid natural number.',
      referencedBy: 'environmentVariables',
    } as Message,
  },
  standardKey: {
    path: ['./demo/path/key'] as string[],
    message: {
      code: 'InvalidKey',
      message: 'Not a valid key.',
      referencedBy: 'environmentVariables',
    } as Message,
  },
  standardUrl: {
    path: ['./demo/path/url'] as string[],
    message: {
      code: 'InvalidUrl',
      message: 'Not a valid Url.',
      referencedBy: 'environmentVariables',
    } as Message,
    overrideConfig: {
      min: 2,
      max: 256,
    } as object | undefined,
  },
  region: {
    path: ['./demo/path/region'] as string[],
    message: {
      code: 'InvalidRegion',
      message: 'Not a valid region.',
      referencedBy: 'environmentVariables',
    } as Message,
  },
  standardDueDate: {
    path: ['./demo/path/dueDate'] as string[],
    message: {
      code: 'InvalidBankTransferDueDate',
      message:
        'Bank transfer due date must be from 1d to 100d, the number must be an integer. If it was not set, the default will be 14d',
      referencedBy: 'environmentVariables',
    } as Message,
  },
};

const mockResponse = {
  standardString: [
    ['./demo/path'],
    [
      [
        [jest.fn()],
        {
          code: 'InValidClientId',
          message: 'Client id should be 24 characters.',
          referencedBy: 'environmentVariables',
        },
        [{ max: 34, min: 2 }],
      ],
    ],
  ],
  standardEmail: [
    ['./demo/path/email'],
    [
      [
        [jest.fn()],
        {
          code: 'InvalidEmail',
          message: 'Not a valid email.',
          referencedBy: 'environmentVariables',
        },
        [undefined],
      ],
    ],
  ],
  standardDueDate: [
    ['./demo/path/dueDate'],
    [
      [
        [jest.fn()],
        {
          code: 'InvalidBankTransferDueDate',
          message:
            'Bank transfer due date must be from 1d to 100d, the number must be an integer. If it was not set, the default will be 14d',
          referencedBy: 'environmentVariables',
        },
      ],
    ],
  ],
  standardNaturalNumber: [
    ['./demo/path/naturalNumber'],
    [
      [
        [jest.fn()],
        {
          code: 'InvalidNaturalNumber',
          message: 'Not a valid natural number.',
          referencedBy: 'environmentVariables',
        },
        [undefined],
      ],
    ],
  ],
  standardKey: [
    ['./demo/path/key'],
    [
      [
        [jest.fn()],
        {
          code: 'InvalidKey',
          message: 'Not a valid key.',
          referencedBy: 'environmentVariables',
        },
        [undefined],
      ],
    ],
  ],
  standardUrl: [
    ['./demo/path/url'],
    [
      [
        [jest.fn()],
        {
          code: 'InvalidUrl',
          message: 'Not a valid Url.',
          referencedBy: 'environmentVariables',
        },
        [
          {
            require_protocol: true,
            require_valid_protocol: true,
            protocols: ['http', 'https'],
            require_host: true,
            require_port: false,
            allow_protocol_relative_urls: false,
            allow_fragments: false,
            allow_query_components: true,
            validate_length: true,
            max: 256,
            min: 2,
          },
        ],
      ],
    ],
  ],
  region: [
    ['./demo/path/region'],
    [
      [
        [jest.fn()],
        {
          code: 'InvalidRegion',
          message: 'Not a valid region.',
          referencedBy: 'environmentVariables',
        },
        [undefined],
      ],
    ],
  ],
};

describe('Test helpers.validators.ts', () => {
  test('call standardString()', async () => {
    const response = standardString(
      mockObject.standardString.path,
      mockObject.standardString.message,
      mockObject.standardString.overrideConfig,
    );

    expect(response).toBeDefined();
    expect(response[0]).toStrictEqual(mockResponse.standardString[0]);
    expect(response[1][0][1]).toStrictEqual(mockResponse.standardString[1][0][1]);
    expect(response[1][0][2]).toStrictEqual(mockResponse.standardString[1][0][2]);
  });

  test('call standardEmail()', async () => {
    const response = standardEmail(mockObject.standardEmail.path, mockObject.standardEmail.message);

    expect(response).toBeDefined();
    expect(response[0]).toStrictEqual(mockResponse.standardEmail[0]);
    expect(response[1][0][1]).toStrictEqual(mockResponse.standardEmail[1][0][1]);
  });

  test('call standardNaturalNumber()', async () => {
    const response = standardNaturalNumber(
      mockObject.standardNaturalNumber.path,
      mockObject.standardNaturalNumber.message,
    );

    expect(response).toBeDefined();
    expect(response[0]).toStrictEqual(mockResponse.standardNaturalNumber[0]);
    expect(response[1][0][1]).toStrictEqual(mockResponse.standardNaturalNumber[1][0][1]);
  });

  test('call standardKey()', async () => {
    const response = standardKey(mockObject.standardKey.path, mockObject.standardKey.message);

    expect(response).toBeDefined();
    expect(response[0]).toStrictEqual(mockResponse.standardKey[0]);
    expect(response[1][0][1]).toStrictEqual(mockResponse.standardKey[1][0][1]);
  });

  test('call standardUrl()', async () => {
    const response = standardUrl(
      mockObject.standardUrl.path,
      mockObject.standardUrl.message,
      mockObject.standardUrl.overrideConfig,
    );

    expect(response).toBeDefined();
    expect(response[0]).toStrictEqual(mockResponse.standardUrl[0]);
    expect(response[1][0][1]).toStrictEqual(mockResponse.standardUrl[1][0][1]);
  });

  test('call getValidateMessages() with correct environment variables', async () => {
    const vars = {
      commerceTools: {
        clientId: process.env.CTP_CLIENT_ID as string,
        clientSecret: process.env.CTP_CLIENT_SECRET as string,
        projectKey: process.env.CTP_PROJECT_KEY as string,
        scope: process.env.CTP_SCOPE as string,
        region: process.env.CTP_REGION as string,
        authUrl: process.env.CTP_AUTH_URL as string,
        authMode: process.env.AUTHENTICATION_MODE as string,
      },
      mollie: {
        liveApiKey: process.env.MOLLIE_API_LIVE_KEY as string,
        testApiKey: process.env.MOLLIE_API_TEST_KEY as string,
        mode: process.env.CONNECTOR_MODE as string,
        debug: (process.env.DEBUG ?? '0') as string,
        profileId: process.env.MOLLIE_PROFILE_ID as string,
        cardComponent: (process.env.MOLLIE_CARD_COMPONENT ?? '0') as string,
        bankTransferDueDate: process.env.MOLLIE_BANK_TRANSFER_DUE_DATE,
      },
    };
    const error = getValidateMessages(envValidators, vars);

    expect(error).toHaveLength(0);
  });

  test('call getValidateMessages() with incorrect environment variables', async () => {
    const vars = {
      commerceTools: {
        clientId: '' as string,
        clientSecret: process.env.CTP_CLIENT_SECRET as string,
        projectKey: process.env.CTP_PROJECT_KEY as string,
        scope: process.env.CTP_SCOPE as string,
        region: process.env.CTP_REGION as string,
        authUrl: process.env.CTP_AUTH_URL as string,
        authMode: process.env.AUTHENTICATION_MODE as string,
      },
      mollie: {
        liveApiKey: process.env.MOLLIE_API_LIVE_KEY as string,
        testApiKey: process.env.MOLLIE_API_TEST_KEY as string,
        mode: process.env.CONNECTOR_MODE as string,
        debug: (process.env.DEBUG ?? '0') as string,
        profileId: process.env.MOLLIE_PROFILE_ID as string,
        cardComponent: (process.env.MOLLIE_CARD_COMPONENT ?? '0') as string,
        bankTransferDueDate: process.env.MOLLIE_BANK_TRANSFER_DUE_DATE,
      },
    };
    const error = getValidateMessages(envValidators, vars);

    expect(error).toBeDefined();
    expect(error).toHaveLength(1);
    expect(error[0]).toStrictEqual(mockResponse.standardString[1][0][1]);
  });

  test('call optional()', async () => {
    const response = optional(
      standardString(
        mockObject.standardString.path,
        mockObject.standardString.message,
        mockObject.standardString.overrideConfig,
      ),
    );
    expect(response).toBeDefined();
  });

  test('call array()', async () => {
    const response = array(
      standardString(
        mockObject.standardString.path,
        mockObject.standardString.message,
        mockObject.standardString.overrideConfig,
      ),
    );
    expect(response).toBeDefined();
  });

  test('call region()', async () => {
    const response = region(mockObject.region.path, mockObject.region.message);
    expect(response).toBeDefined();
    expect(response[0]).toStrictEqual(mockResponse.region[0]);
    expect(response[1][0][1]).toStrictEqual(mockResponse.region[1][0][1]);
  });

  test('call standardDuedate', async () => {
    const response = standardDueDate(mockObject.standardDueDate.path, mockObject.standardDueDate.message);
    expect(response).toBeDefined();
    expect(response[0]).toStrictEqual(mockResponse.standardDueDate[0]);
    expect(response[1][0][1]).toStrictEqual(mockResponse.standardDueDate[1][0][1]);
  });
});

describe('test getValidateMessages', () => {
  it('should able to return suitable error message when MOLLIE_BANK_TRANSFER_DUE_DATE is invalid', () => {
    const envVars: ConnectorEnvVars = {
      commerceTools: {
        clientId: process.env.CTP_CLIENT_ID as string,
        clientSecret: process.env.CTP_CLIENT_SECRET as string,
        projectKey: process.env.CTP_PROJECT_KEY as string,
        scope: process.env.CTP_SCOPE as string,
        region: process.env.CTP_REGION as string,
        authUrl: process.env.CTP_AUTH_URL as string,
        authMode: process.env.AUTHENTICATION_MODE as string,
      },
      mollie: {
        testApiKey: process.env.MOLLIE_API_TEST_KEY as string,
        liveApiKey: process.env.MOLLIE_API_LIVE_KEY as string,
        mode: process.env.CONNECTOR_MODE as string,
        debug: process.env.DEBUG as string,
        profileId: process.env.MOLLIE_PROFILE_ID as string,
        cardComponent: process.env.MOLLIE_CARD_COMPONENT as string,
        bankTransferDueDate: 'dummy',
      },
    };

    const result = getValidateMessages(envValidators, envVars);

    expect(result).toEqual([
      {
        code: 'InvalidBankTransferDueDate',
        message:
          'Bank transfer due date must be from 1d to 100d, the number must be an integer. If it was not set, the default will be 14d',
        referencedBy: 'environmentVariables',
      },
    ]);
  });

  it('should able to return suitable error message when MOLLIE_BANK_TRANSFER_DUE_DATE is invalid', () => {
    const envVars: ConnectorEnvVars = {
      commerceTools: {
        clientId: process.env.CTP_CLIENT_ID as string,
        clientSecret: process.env.CTP_CLIENT_SECRET as string,
        projectKey: process.env.CTP_PROJECT_KEY as string,
        scope: process.env.CTP_SCOPE as string,
        region: process.env.CTP_REGION as string,
        authUrl: process.env.CTP_AUTH_URL as string,
        authMode: process.env.AUTHENTICATION_MODE as string,
      },
      mollie: {
        testApiKey: process.env.MOLLIE_API_TEST_KEY as string,
        liveApiKey: process.env.MOLLIE_API_LIVE_KEY as string,
        mode: process.env.CONNECTOR_MODE as string,
        debug: process.env.DEBUG as string,
        profileId: process.env.MOLLIE_PROFILE_ID as string,
        cardComponent: process.env.MOLLIE_CARD_COMPONENT as string,
        bankTransferDueDate: 'dummy',
      },
    };

    const result = getValidateMessages(envValidators, envVars);

    expect(result).toEqual([
      {
        code: 'InvalidBankTransferDueDate',
        message:
          'Bank transfer due date must be from 1d to 100d, the number must be an integer. If it was not set, the default will be 14d',
        referencedBy: 'environmentVariables',
      },
    ]);
  });

  it('should able to return suitable error message when MOLLIE_BANK_TRANSFER_DUE_DATE is more than 100 days', () => {
    const envVars: ConnectorEnvVars = {
      commerceTools: {
        clientId: process.env.CTP_CLIENT_ID as string,
        clientSecret: process.env.CTP_CLIENT_SECRET as string,
        projectKey: process.env.CTP_PROJECT_KEY as string,
        scope: process.env.CTP_SCOPE as string,
        region: process.env.CTP_REGION as string,
        authUrl: process.env.CTP_AUTH_URL as string,
        authMode: process.env.AUTHENTICATION_MODE as string,
      },
      mollie: {
        testApiKey: process.env.MOLLIE_API_TEST_KEY as string,
        liveApiKey: process.env.MOLLIE_API_LIVE_KEY as string,
        mode: process.env.CONNECTOR_MODE as string,
        debug: process.env.DEBUG as string,
        profileId: process.env.MOLLIE_PROFILE_ID as string,
        cardComponent: process.env.MOLLIE_CARD_COMPONENT as string,
        bankTransferDueDate: '101d',
      },
    };

    const result = getValidateMessages(envValidators, envVars);

    expect(result).toEqual([
      {
        code: 'InvalidBankTransferDueDate',
        message:
          'Bank transfer due date must be from 1d to 100d, the number must be an integer. If it was not set, the default will be 14d',
        referencedBy: 'environmentVariables',
      },
    ]);
  });
});
