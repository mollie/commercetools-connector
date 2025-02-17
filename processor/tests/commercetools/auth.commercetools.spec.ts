import { getAccessToken } from './../../src/commercetools/auth.commercetools';
import { afterEach, describe, expect, jest, test } from '@jest/globals';
import fetch from 'node-fetch';

// @ts-expect-error: Mock fetch globally
fetch = jest.fn() as jest.Mock;

jest.mock('./../../src/commercetools/auth.commercetools', () => ({
  getAccessToken: jest.fn(),
}));

describe('test getAccessToken', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  test('should call fetch with the correct parameters', () => {
    const expectedHeaders = {
      Authorization: `Basic ${btoa(`${process.env.CTP_CLIENT_ID}:${process.env.CTP_CLIENT_SECRET}`)}`,
      'Content-Type': 'application/json',
    };

    const expectedUrl = `${process.env.CTP_AUTH_URL}/oauth/token?grant_type=client_credentials`;

    (getAccessToken as jest.Mock).mockImplementation(async () => {
      return await fetch(expectedUrl, {
        method: 'POST',
        headers: expectedHeaders,
        redirect: 'follow',
      });
    });

    getAccessToken();

    expect(fetch).toBeCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'POST',
      headers: expectedHeaders,
      redirect: 'follow',
    });
  });
});
