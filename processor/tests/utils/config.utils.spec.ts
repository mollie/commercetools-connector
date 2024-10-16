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
        authMode: process.env.AUTHENTICATION_MODE,
        sessionAudience: process.env.CTP_SESSION_AUDIENCE,
        sessionIssuer: process.env.CTP_SESSION_ISSUER,
      },
      mollie: {
        liveApiKey: process.env.MOLLIE_API_LIVE_KEY,
        testApiKey: process.env.MOLLIE_API_TEST_KEY,
        mode: process.env.CONNECTOR_MODE,
        debug: process.env.DEBUG,
        profileId: process.env.MOLLIE_PROFILE_ID,
        cardComponent: process.env.MOLLIE_CARD_COMPONENT,
        bankTransferDueDate: process.env.MOLLIE_BANK_TRANSFER_DUE_DATE,
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

  test('should throw an error when MOLLIE_CARD_COMPONENT is not defined', () => {
    delete process.env.MOLLIE_CARD_COMPONENT;
    expect(() => readConfiguration()).toThrow(CustomError);
  });

  test('should throw an error when CONNECTOR_MODE is not defined', () => {
    delete process.env.CONNECTOR_MODE;
    expect(() => readConfiguration()).toThrow(CustomError);
  });

  test('should throw an error when MOLLIE_BANK_TRANSFER_DUE_DATE is invalid', () => {
    process.env.MOLLIE_BANK_TRANSFER_DUE_DATE = 'dummy';
    expect(() => readConfiguration()).toThrow(CustomError);
  });

  test('should throw an error when AUTHENTICATION_MODE is invalid', () => {
    process.env.AUTHENTICATION_MODE = 'dummy';
    expect(() => readConfiguration()).toThrow(CustomError);
  });
});
