import { getApiKey } from '../../src/utils/config.utils';
import { initMollieClient } from '../../src/client/mollie.client';
import createMollieClient, { MollieClient } from '@mollie/api-client';
import { describe, jest, expect, it } from '@jest/globals';
import { LIBRARY_NAME, LIBRARY_VERSION } from '../../src/utils/constant.utils';

jest.mock('@mollie/api-client', () => ({
  // @ts-expect-error ignore type error
  ...jest.requireActual('@mollie/api-client'),
  __esModule: true,
  default: jest.fn(),
  MollieClient: jest.fn(),
}));

jest.mock('../../src/utils/config.utils', () => ({
  getApiKey: jest.fn(),
}));

describe('Test mollie.client.ts', () => {
  const mockCreateMollieClient = createMollieClient as jest.Mock;
  const mockGetApiKey = getApiKey as jest.Mock;
  let mockMollieClient: MollieClient;

  it('should initialize and return a MollieClient instance with the correct API key', () => {
    mockCreateMollieClient.mockReturnValue(mockMollieClient);
    mockGetApiKey.mockReturnValue('test-api-key');

    const client = initMollieClient();

    expect(mockGetApiKey).toHaveBeenCalled();
    expect(mockCreateMollieClient).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      versionStrings: `${LIBRARY_NAME}/${LIBRARY_VERSION}`,
    });
    expect(client).toBe(mockMollieClient);
  });
});
