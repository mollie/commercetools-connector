import { getApiKey, readConfiguration } from '../../src/utils/config.utils';
import { initMollieClient, initMollieClientForApplePaySession } from '../../src/client/mollie.client';
import createMollieClient, { MollieClient } from '@mollie/api-client';
import { describe, jest, expect, it } from '@jest/globals';
import { MOLLIE_VERSION_STRINGS } from '../../src/utils/constant.utils';

jest.mock('@mollie/api-client', () => ({
  // @ts-expect-error ignore type error
  ...jest.requireActual('@mollie/api-client'),
  __esModule: true,
  default: jest.fn(),
  MollieClient: jest.fn(),
}));

jest.mock('../../src/utils/config.utils', () => ({
  getApiKey: jest.fn(),
  readConfiguration: jest.fn(),
}));

describe('Test mollie.client.ts', () => {
  const mockCreateMollieClient = createMollieClient as jest.Mock;
  const mockGetApiKey = getApiKey as jest.Mock;
  const mockReadConfiguration = readConfiguration as jest.Mock;
  const mockMollieClient: MollieClient = {} as MollieClient;

  it('should initialize and return a MollieClient instance with the correct API key', () => {
    mockCreateMollieClient.mockReturnValue(mockMollieClient);
    mockGetApiKey.mockReturnValue('test-api-key');

    const client = initMollieClient();

    expect(mockGetApiKey).toHaveBeenCalled();
    expect(mockCreateMollieClient).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      versionStrings: MOLLIE_VERSION_STRINGS,
    });
    expect(client).toBe(mockMollieClient);
  });

  it('should initialize and return a MollieClientForApplePaySession instance with the correct API key', () => {
    mockCreateMollieClient.mockReturnValue(mockMollieClient);
    mockReadConfiguration.mockReturnValue({
      mollie: {
        liveApiKey: 'test-api-key',
      },
    });

    const client = initMollieClientForApplePaySession();

    expect(mockReadConfiguration).toHaveBeenCalled();
    expect(mockCreateMollieClient).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      versionStrings: MOLLIE_VERSION_STRINGS,
    });
    expect(client).toBe(mockMollieClient);
  });
});
