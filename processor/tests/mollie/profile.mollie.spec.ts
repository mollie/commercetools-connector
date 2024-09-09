import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { getProfile } from '../../src/mollie/profile.mollie';
import { MollieApiError, Profile } from '@mollie/api-client';
import { initMollieClient } from '../../src/client/mollie.client';

jest.mock('../../src/client/mollie.client', () => ({
  initMollieClient: jest.fn(),
}));

describe('Test profile.mollie.ts', () => {
  let mockProfile: Profile;

  beforeEach(() => {
    mockProfile = {
      mode: 'test',
      name: 'Test Profile',
      website: 'https://example.com',
      status: 'verified',
    } as unknown as Profile;

    (initMollieClient as jest.Mock).mockReturnValue({
      profiles: {
        getCurrent: jest.fn().mockReturnValue(mockProfile),
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the current profile', async () => {
    const profile = await getProfile();
    expect(profile).toEqual(mockProfile);
    expect(initMollieClient).toHaveBeenCalled();
  });

  it('should return Mollie API errors when fetching the profile', async () => {
    const errorMessage = `SCTM - getProfile - error: Missing authentication, or failed to authenticate, field: undefined"`;
    (initMollieClient as jest.Mock).mockReturnValue({
      profiles: {
        getCurrent: jest.fn().mockReturnValue(new MollieApiError(errorMessage)),
      },
    });

    await expect(getProfile()).rejects.toThrow(errorMessage);
  });

  it('should return unknown errors when fetching the profile', async () => {
    const errorMessage = 'SCTM - getProfile - Failed to get Mollie profile with unknown errors';
    (initMollieClient as jest.Mock).mockReturnValue({
      profiles: {
        getCurrent: jest.fn().mockReturnValue(new Error(errorMessage)),
      },
    });

    await expect(getProfile()).rejects.toThrow(errorMessage);
  });
});
