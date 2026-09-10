import { CentPrecisionMoney } from '@commercetools/platform-sdk';
import { Payment, PaymentStatus, RefundStatus } from '@mollie/api-client';
import { CTMoney, CTTransactionState } from '../../src/types/commercetools.types';
import {
  makeMollieAmount,
  makeCTMoney,
  isPayment,
  shouldPaymentStatusUpdate,
  shouldRefundStatusUpdate,
  calculateDueDate,
  getMollieFailureDetails,
} from '../../src/utils/mollie.utils';
import { expect, describe, it, test, jest } from '@jest/globals';
import { logger } from '../../src/utils/logger.utils';
import CustomError from '../../src/errors/custom.error';
import { Amount } from '@mollie/api-client/dist/types/data/global';

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

    it('should create a Mollie Amount from CentPrecisionMoney with surcharge amount is not 0', () => {
      const centPrecisionMoney: CentPrecisionMoney = {
        centAmount: 1234,
        fractionDigits: 2,
        currencyCode: 'EUR',
      } as CentPrecisionMoney;

      const surchargeAmountInCent = 20;

      const expected: Amount = {
        value: '12.54',
        currency: 'EUR',
      };

      expect(makeMollieAmount(centPrecisionMoney, surchargeAmountInCent)).toEqual(expected);
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
        centAmount: Math.round(12.345 * 1000),
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

  describe('shouldRefundStatusUpdate', () => {
    test('returns true when mollieRefundStatus is queued, pending, or processing and ctTransactionStatus is not Pending', () => {
      expect(shouldRefundStatusUpdate(RefundStatus.queued, CTTransactionState.Success)).toBe(true);
      expect(shouldRefundStatusUpdate(RefundStatus.pending, CTTransactionState.Failure)).toBe(true);
      expect(shouldRefundStatusUpdate(RefundStatus.processing, CTTransactionState.Success)).toBe(true);
    });

    test('returns false when mollieRefundStatus is queued, pending, or processing and ctTransactionStatus is Pending', () => {
      expect(shouldRefundStatusUpdate(RefundStatus.queued, CTTransactionState.Pending)).toBe(false);
      expect(shouldRefundStatusUpdate(RefundStatus.pending, CTTransactionState.Pending)).toBe(false);
      expect(shouldRefundStatusUpdate(RefundStatus.processing, CTTransactionState.Pending)).toBe(false);
    });

    test('returns true when mollieRefundStatus is refunded and ctTransactionStatus is not Success', () => {
      expect(shouldRefundStatusUpdate(RefundStatus.refunded, CTTransactionState.Pending)).toBe(true);
      expect(shouldRefundStatusUpdate(RefundStatus.refunded, CTTransactionState.Failure)).toBe(true);
    });

    test('returns false when mollieRefundStatus is refunded and ctTransactionStatus is Success', () => {
      expect(shouldRefundStatusUpdate(RefundStatus.refunded, CTTransactionState.Success)).toBe(false);
    });

    test('returns true when mollieRefundStatus is failed and ctTransactionStatus is not Failure', () => {
      expect(shouldRefundStatusUpdate(RefundStatus.failed, CTTransactionState.Pending)).toBe(true);
      expect(shouldRefundStatusUpdate(RefundStatus.failed, CTTransactionState.Success)).toBe(true);
    });

    test('returns false when mollieRefundStatus is failed and ctTransactionStatus is Failure', () => {
      expect(shouldRefundStatusUpdate(RefundStatus.failed, CTTransactionState.Failure)).toBe(false);
    });

    test('returns false for unknown mollieRefundStatus', () => {
      expect(shouldRefundStatusUpdate('unknown' as RefundStatus, CTTransactionState.Pending)).toBe(false);
    });
  });

  describe('getMollieFailureDetails', () => {
    it('should return the status together with the failure reason and message of a credit card payment', () => {
      const molliePayment = {
        status: PaymentStatus.failed,
        method: 'creditcard',
        details: {
          cardNumber: '6787',
          failureReason: 'insufficient_funds',
          failureMessage: 'The card has insufficient funds.',
        },
      } as unknown as Payment;

      expect(getMollieFailureDetails(molliePayment)).toStrictEqual({
        status: 'failed',
        reason: 'insufficient_funds',
        message: 'The card has insufficient funds.',
      });
    });

    it('should return the status together with the failure reason of a bancontact payment', () => {
      const molliePayment = {
        status: PaymentStatus.failed,
        method: 'bancontact',
        details: {
          cardNumber: '1234',
          failureReason: 'card_declined',
        },
      } as unknown as Payment;

      expect(getMollieFailureDetails(molliePayment)).toStrictEqual({
        status: 'failed',
        reason: 'card_declined',
      });
    });

    it('should prefer the status reason of a point-of-sale payment over the payment details', () => {
      const molliePayment = {
        status: PaymentStatus.failed,
        method: 'pointofsale',
        statusReason: {
          code: 'failed_transaction_declined',
          message: 'The transaction was declined by the terminal.',
        },
        details: {
          terminalId: 'term_7MgL4wea46qkRcoTZjWEH',
          failureReason: 'card_declined',
          failureMessage: 'The card was declined.',
        },
      } as unknown as Payment;

      expect(getMollieFailureDetails(molliePayment)).toStrictEqual({
        status: 'failed',
        reason: 'failed_transaction_declined',
        message: 'The transaction was declined by the terminal.',
      });
    });

    it('should only return the status when the payment details do not contain failure details', () => {
      const molliePayment = {
        status: PaymentStatus.expired,
        method: 'ideal',
        details: {
          consumerName: 'T. TEST',
          consumerAccount: 'NL02ABNA0123456789',
        },
      } as unknown as Payment;

      expect(getMollieFailureDetails(molliePayment)).toStrictEqual({ status: 'expired' });
    });

    it('should only return the status when the payment has no details at all', () => {
      const molliePayment = {
        status: PaymentStatus.canceled,
        method: 'paypal',
      } as unknown as Payment;

      expect(getMollieFailureDetails(molliePayment)).toStrictEqual({ status: 'canceled' });
    });
  });

  describe('Test calculateDueDate', () => {
    test('return the date which is 14 days later in format YYYY-MM-DD when the input is not defined', () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-01'));

      expect(calculateDueDate()).toEqual('2024-01-15');
    });

    test('return the date which is to day + input day in format YYYY-MM-DD when the input is defined', () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-01'));

      expect(calculateDueDate('5d')).toEqual('2024-01-06');
    });

    test('should throw error if no matches', () => {
      try {
        calculateDueDate('5');
      } catch (error: unknown) {
        expect(logger.error).toBeCalledTimes(1);
        expect(logger.error).toBeCalledWith('SCTM - calculateDueDate - Failed to calculate the due date, input: 5');

        expect(error).toBeInstanceOf(CustomError);
      }
    });
  });
});
