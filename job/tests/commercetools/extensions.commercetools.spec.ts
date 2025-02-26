import { afterEach, describe, expect, jest, it } from '@jest/globals';
import { Extension, HttpDestination } from '@commercetools/platform-sdk';
import {
  getPaymentExtension,
  PAYMENT_EXTENSION_KEY,
  updatePaymentExtension,
} from '../../src/commercetools/extensions.commercetools';
import { createApiRoot } from '../../src/client/create.client';
import { logger } from '../../src/utils/logger.utils';

jest.mock('../../src/client/create.client', () => ({
  createApiRoot: jest.fn(),
}));

describe('Test extensions.commercetools', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUrl = 'http://localhost:3000';
  const mockExtension: Extension = {
    id: 'mock-id',
    key: PAYMENT_EXTENSION_KEY,
    version: 1,
    createdAt: '2021-10-01T00:00:00.000Z',
    lastModifiedAt: '2021-10-01T00:00:00.000Z',
    destination: {
      type: 'HTTP',
      url: mockUrl,
      authentication: {
        type: 'AuthorizationHeader',
        headerValue: 'Bearer _token_',
      },
    },
    triggers: [
      {
        resourceTypeId: 'payment',
        actions: ['Create', 'Update'],
      },
    ],
    timeoutInMs: 10000,
  };

  const setupMocks = (
    results: Extension[],
    updateMock = jest.fn(),
    createMock = jest.fn()
  ) => {
    const getExtensions = jest.fn().mockReturnValue({
      execute: jest.fn().mockResolvedValue({
        body: {
          results,
        },
      } as never),
    });

    const withId = jest.fn().mockReturnValue({
      post: updateMock,
    });

    (createApiRoot as jest.Mock).mockReturnValue({
      extensions: jest.fn().mockReturnValue({
        get: getExtensions,
        post: createMock,
        withId,
      }),
    });

    return { getExtensions, withId, updateMock, createMock };
  };

  it('getPaymentExtension should return null if no extension found', async () => {
    const { getExtensions } = setupMocks([]);

    const extension = await getPaymentExtension();

    expect(getExtensions).toHaveBeenCalledTimes(1);
    expect(getExtensions).toHaveBeenCalledWith({
      queryArgs: {
        where: `key = "${PAYMENT_EXTENSION_KEY}"`,
      },
    });
    expect(extension).toBeNull();
  });

  it('getPaymentExtension should return the correct extension if found', async () => {
    const { getExtensions } = setupMocks([mockExtension]);

    const extension = await getPaymentExtension();

    expect(getExtensions).toHaveBeenCalledTimes(1);
    expect(getExtensions).toHaveBeenCalledWith({
      queryArgs: {
        where: `key = "${PAYMENT_EXTENSION_KEY}"`,
      },
    });
    expect(extension).toEqual(mockExtension);
  });

  it('updatePaymentExtension should retrieve the existing extension and update it', async () => {
    const { getExtensions, withId, updateMock } = setupMocks(
      [mockExtension],
      jest.fn().mockReturnValue({
        execute: jest.fn(),
      }),
      jest.fn().mockReturnValue({
        execute: jest.fn(),
      })
    );

    const accessToken = 'token123';

    await updatePaymentExtension(accessToken);

    expect(getExtensions).toHaveBeenCalledTimes(1);
    expect(withId).toHaveBeenCalledTimes(1);
    expect(withId).toHaveBeenCalledWith({ ID: mockExtension.id });
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith({
      body: {
        version: mockExtension.version,
        actions: [
          {
            action: 'changeDestination',
            destination: {
              type: 'HTTP',
              url: (mockExtension.destination as HttpDestination).url,
              authentication: {
                type: 'AuthorizationHeader',
                headerValue: `Bearer ${accessToken}`,
              },
            },
          },
        ],
      },
    });
  });

  it('updatePaymentExtension should log a message if no extension found', async () => {
    const { getExtensions, withId, updateMock } = setupMocks(
      [],
      jest.fn().mockReturnValue({
        execute: jest.fn(),
      }),
      jest.fn().mockReturnValue({
        execute: jest.fn(),
      })
    );

    const accessToken = 'token123';

    await updatePaymentExtension(accessToken);

    expect(getExtensions).toHaveBeenCalledTimes(1);
    expect(withId).toHaveBeenCalledTimes(0);
    expect(updateMock).toHaveBeenCalledTimes(0);
    expect(logger.info).toBeCalledTimes(1);
    expect(logger.info).toBeCalledWith(
      'Could not find extension URL with key: ' + PAYMENT_EXTENSION_KEY
    );
  });
});
