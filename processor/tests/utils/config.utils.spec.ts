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
      },
      mollie: {
        apiKey: process.env.MOLLIE_API_KEY,
        debug: process.env.DEBUG,
        profileId: process.env.MOLLIE_PROFILE_ID,
        cardComponent: process.env.MOLLIE_CARD_COMPONENT,
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

  test('should throw an error when MOLLIE_API_KEY is not defined', () => {
    delete process.env.MOLLIE_API_KEY;
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
});
