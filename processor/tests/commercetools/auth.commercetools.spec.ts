import { getAccessToken } from './../../src/commercetools/auth.commercetools';
import { afterEach, describe, expect, jest, it } from '@jest/globals';
import fetch from 'node-fetch';

// @ts-expect-error: Mock fetch globally
fetch = jest.fn() as jest.Mock;

describe('test getAccessToken', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  it('should call fetch with the correct parameters', async () => {
    const expectedHeaders = {
      Authorization: `Basic ${btoa(`${process.env.CTP_CLIENT_ID}:${process.env.CTP_CLIENT_SECRET}`)}`,
      'Content-Type': 'application/json',
    };

    const expectedUrl = `${process.env.CTP_AUTH_URL}/oauth/token?grant_type=client_credentials`;

    (fetch as unknown as jest.Mock).mockImplementation(async () =>
      Promise.resolve({
        json: () => Promise.resolve({ data: [] }),
        headers: new Headers(),
        ok: true,
        redirected: false,
        status: 201,
        statusText: 'OK',
        url: '',
      }),
    );

    await getAccessToken();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'POST',
      headers: expectedHeaders,
      redirect: 'follow',
    });
  });
});
