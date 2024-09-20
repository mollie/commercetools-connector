import { describe, it, jest, expect } from '@jest/globals';
import { createClient } from '../../src/client/build.client';
import { ClientBuilder } from '@commercetools/sdk-client-v2';
import { readConfiguration } from '../../src/utils/config.utils';

jest.mock('@commercetools/sdk-client-v2', () => ({
  ClientBuilder: jest.fn().mockImplementation(() => ({
    withProjectKey: jest.fn().mockReturnThis(),
    withClientCredentialsFlow: jest.fn().mockReturnThis(),
    withHttpMiddleware: jest.fn().mockReturnThis(),
    withUserAgentMiddleware: jest.fn().mockReturnThis(),
    build: jest.fn(),
  })),
}));

jest.mock('../../src/utils/config.utils', () => ({
  readConfiguration: jest.fn(() => {
    return {
      commerceTools: {
        projectKey: 'test-project-key',
        region: 'europe-west1.gcp',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
      },
    };
  }),
}));

describe('createClient', () => {
  it('should create a client with the correct configuration', () => {
    (readConfiguration as jest.Mock).mockReturnValueOnce({
      commerceTools: {
        projectKey: 'test-project-key',
        region: 'europe-west1.gcp',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
      },
    });
    createClient();
    expect(ClientBuilder).toHaveBeenCalled();
  });
});
