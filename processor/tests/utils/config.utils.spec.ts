import { readConfiguration } from '../../src/utils/config.utils';
import CustomError from '../../src/errors/custom.error';
import { describe, expect, test } from '@jest/globals';

describe('Test src/utils/config.utils.ts', () => {
  test('should return the correct configuration when all env vars are valid', () => {
    const config = readConfiguration();
    expect(config).toEqual({
      commerceTools: {
        clientId: process.env.CTP_CLIENT_ID,
        clientSecret: process.env.CTP_CLIENT_SECRET,
        projectKey: process.env.CTP_PROJECT_KEY,
        scope: process.env.CTP_SCOPE,
        region: process.env.CTP_REGION,
        authUrl: process.env.CTP_AUTH_URL,
        authMode: process.env.AUTHENTICATION_MODE,
        sessionAudience: process.env.CTP_SESSION_AUDIENCE,
        sessionIssuer: process.env.CTP_SESSION_ISSUER,
        transactionCustomTypeKey: process.env.CTP_TRANSACTION_CUSTOM_TYPE_KEY,
      },
      mollie: {
        liveApiKey: process.env.MOLLIE_API_LIVE_KEY,
        testApiKey: process.env.MOLLIE_API_TEST_KEY,
        mode: process.env.CONNECTOR_MODE,
        debug: process.env.DEBUG,
        profileId: process.env.MOLLIE_PROFILE_ID,
      },
    });
  });

  test('should throw an error when CTP_CLIENT_ID is not defined', () => {
    delete process.env.CTP_CLIENT_ID;
    expect(() => readConfiguration()).toThrow(CustomError);
  });

  test('should throw an error when CTP_CLIENT_SECRET is not defined', () => {
    delete process.env.CTP_CLIENT_SECRET;
    expect(() => readConfiguration()).toThrow(CustomError);
  });

  test('should throw an error when CTP_PROJECT_KEY is not defined', () => {
    delete process.env.CTP_PROJECT_KEY;
    expect(() => readConfiguration()).toThrow(CustomError);
  });

  test('should throw an error when CTP_SCOPE is not defined', () => {
    delete process.env.CTP_SCOPE;
    expect(() => readConfiguration()).toThrow(CustomError);
  });

  test('should throw an error when CTP_REGION is not defined', () => {
    delete process.env.CTP_REGION;
    expect(() => readConfiguration()).toThrow(CustomError);
  });

  test('should throw an error when MOLLIE_API_LIVE_KEY is not defined', () => {
    delete process.env.MOLLIE_API_LIVE_KEY;
    expect(() => readConfiguration()).toThrow(CustomError);
  });

  test('should throw an error when MOLLIE_API_TEST_KEY is not defined', () => {
    delete process.env.MOLLIE_API_TEST_KEY;
    expect(() => readConfiguration()).toThrow(CustomError);
  });

  test('should throw an error when DEBUG is not defined', () => {
    delete process.env.DEBUG;
    expect(() => readConfiguration()).toThrow(CustomError);
  });

  test('should throw an error when CONNECTOR_MODE is not defined', () => {
    delete process.env.CONNECTOR_MODE;
    expect(() => readConfiguration()).toThrow(CustomError);
  });

  test('should throw an error when AUTHENTICATION_MODE is invalid', () => {
    process.env.AUTHENTICATION_MODE = 'dummy';
    expect(() => readConfiguration()).toThrow(CustomError);
  });

  test('should return CTP_TRANSACTION_CUSTOM_TYPE_KEY', () => {
    process.env.CTP_CLIENT_ID = '123456789012345678901234';
    process.env.CTP_CLIENT_SECRET = '12345678901234567890123456789012';
    process.env.CTP_PROJECT_KEY = 'custom_type_key';
    process.env.CTP_SCOPE = 'custom_type_key';
    process.env.CTP_REGION = 'europe-west1.gcp';
    process.env.CTP_AUTH_URL = 'custom_type_key';
    process.env.AUTHENTICATION_MODE = '0';
    process.env.CTP_SESSION_AUDIENCE = 'custom_type_key';
    process.env.CTP_SESSION_ISSUER = 'custom_type_key';
    process.env.CTP_TRANSACTION_CUSTOM_TYPE_KEY = 'custom_type_key';
    process.env.MOLLIE_API_LIVE_KEY = 'custom_type_key';
    process.env.MOLLIE_API_TEST_KEY = 'custom_type_key';
    process.env.CONNECTOR_MODE = 'test';
    process.env.DEBUG = '0';
    process.env.MOLLIE_PROFILE_ID = 'custom_type_key';
    const config = readConfiguration();

    expect(config.commerceTools.transactionCustomTypeKey).toBe('custom_type_key');
  });
});
