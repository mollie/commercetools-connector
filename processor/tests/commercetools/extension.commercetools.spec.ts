import { afterEach, describe, expect, jest } from '@jest/globals';
import { createApiRoot } from '../../src/client/create.client';
import {
  createPaymentExtension,
  deletePaymentExtension,
  getPaymentExtension,
  PAYMENT_EXTENSION_KEY,
} from '../../src/commercetools/extensions.commercetools';
import { Extension } from '@commercetools/platform-sdk';

jest.mock('../../src/client/create.client', () => ({
  createApiRoot: jest.fn(),
}));

describe('Test extension.commercetools', () => {
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

  const setupMocks = (results: Extension[], deleteMock = jest.fn(), createMock = jest.fn()) => {
    const getExtensions = jest.fn().mockReturnValue({
      execute: jest.fn().mockResolvedValue({
        body: {
          results,
        },
      } as never),
    });

    const withKey = jest.fn().mockReturnValue({
      delete: deleteMock,
    });

    (createApiRoot as jest.Mock).mockReturnValue({
      extensions: jest.fn().mockReturnValue({
        get: getExtensions,
        post: createMock,
        withKey,
      }),
    });

    return { getExtensions, withKey, deleteMock, createMock };
  };

  it('PAYMENT_EXTENSION_KEY should be string and is correct value', () => {
    expect(typeof PAYMENT_EXTENSION_KEY).toBe('string');
    expect(PAYMENT_EXTENSION_KEY).toBe('sctm-payment-create-update-extension');
  });

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

  it('deletePaymentExtension should delete the extension if passed', async () => {
    const { withKey, deleteMock } = setupMocks(
      [],
      jest.fn().mockReturnValue({
        execute: jest.fn(),
      }),
    );

    await deletePaymentExtension(mockExtension);

    expect(withKey).toHaveBeenCalledTimes(1);
    expect(withKey).toHaveBeenCalledWith({ key: PAYMENT_EXTENSION_KEY });
    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(deleteMock).toHaveBeenCalledWith({
      queryArgs: {
        version: mockExtension.version,
      },
    });
  });

  it('deletePaymentExtension should fetch and delete the extension if not passed', async () => {
    const { getExtensions, withKey, deleteMock } = setupMocks(
      [mockExtension],
      jest.fn().mockReturnValue({
        execute: jest.fn(),
      }),
    );

    await deletePaymentExtension();

    expect(getExtensions).toHaveBeenCalledTimes(1);
    expect(getExtensions).toHaveBeenCalledWith({
      queryArgs: {
        where: `key = "${PAYMENT_EXTENSION_KEY}"`,
      },
    });
    expect(withKey).toHaveBeenCalledTimes(1);
    expect(withKey).toHaveBeenCalledWith({ key: PAYMENT_EXTENSION_KEY });
    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(deleteMock).toHaveBeenCalledWith({
      queryArgs: {
        version: mockExtension.version,
      },
    });
  });

  it('deletePaymentExtension should not delete if no extension found', async () => {
    const { getExtensions, withKey, deleteMock } = setupMocks([]);

    await deletePaymentExtension();

    expect(getExtensions).toHaveBeenCalledTimes(1);
    expect(getExtensions).toHaveBeenCalledWith({
      queryArgs: {
        where: `key = "${PAYMENT_EXTENSION_KEY}"`,
      },
    });
    expect(withKey).toHaveBeenCalledTimes(0);
    expect(deleteMock).toHaveBeenCalledTimes(0);
  });

  it('createPaymentExtension should delete existing extension and create new one', async () => {
    const { getExtensions, withKey, deleteMock, createMock } = setupMocks(
      [mockExtension],
      jest.fn().mockReturnValue({
        execute: jest.fn(),
      }),
      jest.fn().mockReturnValue({
        execute: jest.fn(),
      }),
    );

    const accessToken = 'token123';

    await createPaymentExtension(mockUrl, accessToken);

    expect(getExtensions).toHaveBeenCalledTimes(1);
    expect(withKey).toHaveBeenCalledTimes(1);
    expect(withKey).toHaveBeenCalledWith({ key: PAYMENT_EXTENSION_KEY });
    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(deleteMock).toHaveBeenCalledWith({
      queryArgs: {
        version: mockExtension.version,
      },
    });
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith({
      body: {
        key: PAYMENT_EXTENSION_KEY,
        destination: {
          type: 'HTTP',
          url: mockUrl,
          authentication: {
            type: 'AuthorizationHeader',
            headerValue: `Bearer ${accessToken}`,
          },
        },
        triggers: [
          {
            resourceTypeId: 'payment',
            actions: ['Create', 'Update'],
          },
        ],
        timeoutInMs: 10000,
      },
    });
  });

  it('createPaymentExtension should create new extension if none exists', async () => {
    const { getExtensions, createMock } = setupMocks(
      [],
      undefined,
      jest.fn().mockReturnValue({
        execute: jest.fn(),
      }),
    );

    const accessToken = 'token123';

    await createPaymentExtension(mockUrl, accessToken);

    expect(getExtensions).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith({
      body: {
        key: PAYMENT_EXTENSION_KEY,
        destination: {
          type: 'HTTP',
          url: mockUrl,
          authentication: {
            type: 'AuthorizationHeader',
            headerValue: `Bearer ${accessToken}`,
          },
        },
        triggers: [
          {
            resourceTypeId: 'payment',
            actions: ['Create', 'Update'],
          },
        ],
        timeoutInMs: 10000,
      },
    });
  });
});
