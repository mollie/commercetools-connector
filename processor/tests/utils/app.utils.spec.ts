import { describe, test, expect, it, jest } from '@jest/globals';
import {
  createDateNowString,
  parseStringToJsonObject,
  removeEmptyProperties,
  validateEmail,
} from '../../src/utils/app.utils';
import { logger } from '../../src/utils/logger.utils';
import CustomError from '../../src/errors/custom.error';

describe('Test createDateNowString', () => {
  test('should return correct time', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-07-24'));

    expect(createDateNowString()).toBe('2024-07-24T00:00:00.000Z');
  });
});

describe('Test parseStringToJsonObject', () => {
  it('should return an empty object if the targeted string is empty', () => {
    expect(parseStringToJsonObject('')).toEqual({});
  });

  it('should return the correct object', async () => {
    expect(parseStringToJsonObject('{"key": "value"}')).toEqual({ key: 'value' });
  });

  it('should throw an error with extra params configured correctly when parsing failed', () => {
    const fieldName = 'test field name';
    const prefix = 'test prefix';
    const commerceToolsId = 'test-commercetools-id';

    try {
      parseStringToJsonObject('not a json string', fieldName, prefix, commerceToolsId);
    } catch (error) {
      const errorMessage = `${prefix} - Failed to parse the JSON string from the custom field ${fieldName}.`;
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(errorMessage, {
        commerceToolsId: commerceToolsId,
      });

      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).message).toBe(errorMessage);
      expect((error as CustomError).statusCode).toBe(400);
    }
  });
});

describe('Test removeEmptyProperties', () => {
  it('should return a new object with non-empty properties only', () => {
    const targetedObject = {
      amount: {
        currency: 'EUR',
        amount: 1000,
        fractionDigits: 2,
      },
      description: 'Testing removing empty properties',
      redirectUrl: 'https://redirect.url',
      webhookUrl: 'https://webhook.url',
      billingAddress: {},
      shippingAddress: {},
      locale: 'de_DE',
      method: 'creditcard',
      issuer: '',
      restrictPaymentMethodsToCountry: null,
      metadata: null,
      applicationFee: {},
      include: '',
      captureMode: 'automatic',
    };

    const result = removeEmptyProperties(targetedObject);
    expect(result).toEqual({
      amount: {
        currency: 'EUR',
        amount: 1000,
        fractionDigits: 2,
      },
      description: 'Testing removing empty properties',
      redirectUrl: 'https://redirect.url',
      webhookUrl: 'https://webhook.url',
      locale: 'de_DE',
      method: 'creditcard',
      captureMode: 'automatic',
    });
  });
});

describe('Test validateEmail', () => {
  it('should return false when the targeted string is an invalid email', () => {
    expect(validateEmail('123123')).toBe(false);
  });

  it('should return true when the targeted string is a valid email', () => {
    expect(validateEmail('n.tran@shopmacher.de')).toBe(true);
  });
});
