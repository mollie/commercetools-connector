import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  CancelParameters,
  CreateParameters,
} from '@mollie/api-client/dist/types/src/binders/payments/refunds/parameters';
import { cancelPaymentRefund, createPaymentRefund } from '../../src/mollie/refund.mollie';
import { MollieApiError } from '@mollie/api-client';
import CustomError from '../../src/errors/custom.error';
import { logger } from '../../src/utils/logger.utils';

const mockPaymentRefundCreate = jest.fn();
const mockPaymentRefundCancel = jest.fn();

jest.mock('../../src/client/mollie.client', () => ({
  initMollieClient: jest.fn(() => ({
    paymentRefunds: {
      create: mockPaymentRefundCreate,
      cancel: mockPaymentRefundCancel,
    },
  })),
}));

describe('createPaymentRefund', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  it('should call create refund with the correct parameters', async () => {
    const paymentCreateRefund: CreateParameters = {
      paymentId: 'tr_12345',
      amount: {
        currency: 'EUR',
        value: '10,00',
      },
    };

    await createPaymentRefund(paymentCreateRefund);

    expect(mockPaymentRefundCreate).toHaveBeenCalledTimes(1);
    expect(mockPaymentRefundCreate).toHaveBeenCalledWith(paymentCreateRefund);
  });

  it('with exception', async () => {
    const errorMessage = 'Something wrong happened';
    const mollieApiError = new MollieApiError(errorMessage);

    (mockPaymentRefundCreate as jest.Mock).mockImplementation(() => {
      throw mollieApiError;
    });

    const paymentCreateRefund: CreateParameters = {
      paymentId: 'tr_12345',
      amount: {
        currency: 'EUR',
        value: '10,00',
      },
    };

    try {
      await createPaymentRefund(paymentCreateRefund);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith({
        message: `createMolliePaymentRefund - error: ` + errorMessage,
        error: mollieApiError,
      });
    }
  });
});

describe('cancelPaymentRefund', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  it('should call cancel refund with the correct parameters', async () => {
    const paymentCancelRefund: CancelParameters = {
      paymentId: 'tr_12345',
    };

    await cancelPaymentRefund('refund_id_1', paymentCancelRefund);

    expect(mockPaymentRefundCancel).toHaveBeenCalledTimes(1);
    expect(mockPaymentRefundCancel).toHaveBeenCalledWith('refund_id_1', paymentCancelRefund);
  });

  it('should be able to return error message when error occurred', async () => {
    const errorMessage = 'Something wrong happened';
    const mollieApiError = new MollieApiError(errorMessage);

    (mockPaymentRefundCancel as jest.Mock).mockImplementation(() => {
      throw mollieApiError;
    });

    const paymentCancelRefund: CancelParameters = {
      paymentId: 'tr_12345',
    };

    try {
      await cancelPaymentRefund('refund_id_1', paymentCancelRefund);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith({
        message: `cancelMolliePaymentRefund - error: ` + errorMessage,
        error: mollieApiError,
      });
    }
  });
});
