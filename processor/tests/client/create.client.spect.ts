import { createClient } from '../../src/client/build.client';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import { readConfiguration } from '../../src/utils/config.utils';
import { createApiRoot, getProject } from '../../src/client/create.client';

jest.mock('../../src/client/build.client', () => ({
  createClient: jest.fn(),
}));
jest.mock('@commercetools/platform-sdk');
jest.mock('../../src/utils/config.utils');

const mockApiBuilder = {
  withProjectKey: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue('mock-response'),
};

describe('createApiRoot', () => {
  const mockProjectKey = 'test-project-key';

  beforeAll(() => {
    (createClient as jest.Mock).mockReturnValue('mock-client');
    (createApiBuilderFromCtpClient as jest.Mock).mockReturnValue(mockApiBuilder);
    (readConfiguration as jest.Mock).mockReturnValue({
      commerceTools: {
        projectKey: mockProjectKey,
        region: 'eu',
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create and return the correct API root', () => {
    const apiRoot = createApiRoot();
    expect(apiRoot).toBe(mockApiBuilder);
    expect(createClient).toHaveBeenCalled();
    expect(createApiBuilderFromCtpClient).toHaveBeenCalledWith('mock-client');
    expect(mockApiBuilder.withProjectKey).toHaveBeenCalledWith({ projectKey: mockProjectKey });
  });

  it('should return the same API root if called again', () => {
    const apiRoot1 = createApiRoot();
    const apiRoot2 = createApiRoot();
    expect(apiRoot1).toBe(apiRoot2);
  });
});

describe('getProject', () => {
  it('should call createApiRoot and execute the request', async () => {
    const response = await getProject();
    expect(response).toBe('mock-response');
    expect(mockApiBuilder.get).toHaveBeenCalled();
    expect(mockApiBuilder.execute).toHaveBeenCalled();
  });
});
