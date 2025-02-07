import { describe, test, expect, it, jest } from '@jest/globals';
import {
  calculateTotalSurchargeAmount,
  convertCentToEUR,
  createDateNowString,
  parseStringToJsonObject,
  removeEmptyProperties,
  roundSurchargeAmountToCent,
  sortTransactionsByLatestCreationTime,
} from '../../src/utils/app.utils';
import { logger } from '../../src/utils/logger.utils';
import CustomError from '../../src/errors/custom.error';
import { Payment, Transaction } from '@commercetools/platform-sdk';
import { SurchargeCost } from '../../src/types/commercetools.types';

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

describe('Test convertCentToEUR', () => {
  it('should return correct result', () => {
    expect(convertCentToEUR(100, 2)).toBe(1);
  });
});

describe('Test calculateTotalSurchargeAmount', () => {
  it('should return correct surcharge amount', () => {
    const payment = {
      amountPlanned: {
        centAmount: 2000,
        fractionDigits: 2,
      },
    } as Payment;

    const surcharge = {
      percentageAmount: 10,
      fixedAmount: 5,
    } as SurchargeCost;

    expect(calculateTotalSurchargeAmount(payment, surcharge)).toBe(7);
  });

  it('should return 0 if surcharge param is not defined', () => {
    const payment = {
      amountPlanned: {
        centAmount: 2000,
        fractionDigits: 2,
      },
    } as Payment;

    expect(calculateTotalSurchargeAmount(payment, undefined)).toBe(0);
  });
});

describe('Test roundSurchargeAmountToCent', () => {
  it('should return correct surcharge amount in cent', () => {
    const surchargeAmountInEur = 300.998;

    const fractionDigits = 2;

    expect(roundSurchargeAmountToCent(surchargeAmountInEur, fractionDigits)).toBe(30100);
  });
});

describe('Test sortTransactionsByLatestCreationTime', () => {
  it('should return the correct order', () => {
    const data = [
      {
        id: '39c1eae1-e9b4-45f0-ac18-7d83ec429cc8',
        timestamp: '2024-06-24T08:28:43.474Z',
        type: 'Authorization',
        amount: {
          type: 'centPrecision',
          currencyCode: 'GBP',
          centAmount: 61879,
          fractionDigits: 2,
        },
        interactionId: '12789fae-d6d6-4b66-9739-3a420dbda2a8',
        state: 'Failure',
      },
      {
        id: '39c1eae1-e9b4-45f0-ac18-7d83ec429cde',
        timestamp: '2024-06-24T08:29:43.474Z',
        type: 'Authorization',
        amount: {
          type: 'centPrecision',
          currencyCode: 'GBP',
          centAmount: 61879,
          fractionDigits: 2,
        },
        interactionId: '12789fae-d6d6-4b66-9739-3a420dbda2a8',
        state: 'Failure',
      },
      {
        id: '39c1eae1-e9b4-45f0-ac18-7d83ec429cd9',
        timestamp: '2024-06-24T08:30:43.474Z',
        type: 'Authorization',
        amount: {
          type: 'centPrecision',
          currencyCode: 'GBP',
          centAmount: 61879,
          fractionDigits: 2,
        },
        interactionId: '12789fae-d6d6-4b66-9739-3a420dbda2a8',
        state: 'Failure',
      },
      {
        id: '39c1eae1-e9b4-45f0-ac18-7d83ec429111',
        type: 'Authorization',
        amount: {
          type: 'centPrecision',
          currencyCode: 'GBP',
          centAmount: 61879,
          fractionDigits: 2,
        },
        interactionId: '12789fae-d6d6-4b66-9739-3a420dbda2a8',
        state: 'Failure',
      },
    ] as Transaction[];

    expect(sortTransactionsByLatestCreationTime(data)).toStrictEqual([data[2], data[1], data[0], data[3]]);
  });
});
