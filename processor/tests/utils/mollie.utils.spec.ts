import { CentPrecisionMoney } from '@commercetools/platform-sdk';
import { PaymentStatus } from '@mollie/api-client';
import { CTMoney, CTTransactionState } from '../../src/types/commercetools.types';
import { makeMollieAmount, makeCTMoney, isPayment, shouldPaymentStatusUpdate } from '../../src/utils/mollie.utils';
import { Amount } from '@mollie/api-client/dist/types/src/data/global';
import { expect, describe, it } from '@jest/globals';

describe('Test mollie.utils.ts', () => {
  describe('convertCTToMollieAmountValue', () => {
    it('should convert cent amount to mollie amount with default fraction digits', () => {
      const ctValue = 1234;
      const expected = '12.34';
      expect((ctValue / 100).toFixed(2)).toBe(expected);
    });

    it('should convert cent amount to mollie amount with specified fraction digits', () => {
      const ctValue = 12345;
      const fractionDigits = 3;
      const expected = '12.345';
      expect((ctValue / Math.pow(10, fractionDigits)).toFixed(fractionDigits)).toBe(expected);
    });
  });

  describe('makeMollieAmount', () => {
    it('should create a Mollie Amount from CentPrecisionMoney', () => {
      const centPrecisionMoney: CentPrecisionMoney = {
        centAmount: 1234,
        fractionDigits: 2,
        currencyCode: 'EUR',
      } as CentPrecisionMoney;

      const expected: Amount = {
        value: '12.34',
        currency: 'EUR',
      };

      expect(makeMollieAmount(centPrecisionMoney)).toEqual(expected);
    });
  });

  describe('makeCTMoney', () => {
    it('should create a CTMoney from a Mollie Amount', () => {
      const mollieAmount: Amount = {
        value: '12.34',
        currency: 'EUR',
      };

      const expected: CTMoney = {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 1234,
        fractionDigits: 2,
      };

      expect(makeCTMoney(mollieAmount)).toEqual(expected);
    });

    it('should create a CTMoney with 0 fraction digits if no decimal part', () => {
      const mollieAmount: Amount = {
        value: '12',
        currency: 'EUR',
      };

      const expected: CTMoney = {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 12 * Math.pow(10, 0),
        fractionDigits: 0,
      };

      expect(makeCTMoney(mollieAmount)).toEqual(expected);
    });

    it('should round up the cent amount for positive values', () => {
      const mollieAmount: Amount = {
        value: '12.345',
        currency: 'EUR',
      };

      const expected: CTMoney = {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: Math.ceil(12.345 * 1000),
        fractionDigits: 3,
      };

      expect(makeCTMoney(mollieAmount)).toEqual(expected);
    });

    it('should round down the cent amount for negative values', () => {
      const mollieAmount: Amount = {
        value: '-12.345',
        currency: 'EUR',
      };

      const expected: CTMoney = {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: Math.floor(-12.345 * 1000),
        fractionDigits: 3,
      };

      expect(makeCTMoney(mollieAmount)).toEqual(expected);
    });
  });

  describe('isPayment', () => {
    it('should return true for a valid payment resourceId', () => {
      const resourceId = 'tr_123456';
      expect(isPayment(resourceId)).toBe(true);
    });

    it('should return false for an invalid payment resourceId', () => {
      const resourceId = 'ord_123456';
      expect(isPayment(resourceId)).toBe(false);
    });
  });

  describe('shouldPaymentStatusUpdate', () => {
    it('should return true if molliePaymentStatus is paid and ctTransactionState is not Success', () => {
      expect(shouldPaymentStatusUpdate(PaymentStatus.paid, CTTransactionState.Initial)).toBe(true);
    });

    it('should return false if molliePaymentStatus is paid and ctTransactionState is Success', () => {
      expect(shouldPaymentStatusUpdate(PaymentStatus.paid, CTTransactionState.Success)).toBe(false);
    });

    it('should return true if molliePaymentStatus is canceled and ctTransactionState is not Failure', () => {
      expect(shouldPaymentStatusUpdate(PaymentStatus.canceled, CTTransactionState.Initial)).toBe(true);
    });

    it('should return false if molliePaymentStatus is canceled and ctTransactionState is Failure', () => {
      expect(shouldPaymentStatusUpdate(PaymentStatus.canceled, CTTransactionState.Failure)).toBe(false);
    });

    it('should return false for unsupported molliePaymentStatus', () => {
      expect(shouldPaymentStatusUpdate('unknown' as PaymentStatus, CTTransactionState.Initial)).toBe(false);
    });
  });
});
