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
      expect(logger.error).toBeCalledWith(
        `SCTM - createMolliePaymentRefund - Calling Mollie API - error: ${errorMessage}`,
        {
          paymentId: paymentCreateRefund.paymentId,
          error: mollieApiError,
        },
      );
    }
  });

  it('with unknown exception', async () => {
    (mockPaymentRefundCreate as jest.Mock).mockImplementation(() => {
      throw new Error('Unknown error');
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
      expect(logger.error).toBeCalledWith(
        `SCTM - createMolliePaymentRefund - Calling Mollie API - Failed to create refund with unknown errors`,
        {
          paymentId: paymentCreateRefund.paymentId,
          error: new Error('Unknown error'),
        },
      );
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
      expect(logger.error).toBeCalledWith(
        `SCTM - cancelMolliePaymentRefund - Calling Mollie API - error: ${errorMessage}`,
        {
          molliePaymentId: paymentCancelRefund.paymentId,
          mollieRefundId: 'refund_id_1',
          error: mollieApiError,
        },
      );
    }
  });

  it('should be able to return error message when unknown error occurred', async () => {
    (mockPaymentRefundCancel as jest.Mock).mockImplementation(() => {
      throw new Error('Unknown error');
    });

    const paymentCancelRefund: CancelParameters = {
      paymentId: 'tr_12345',
    };

    try {
      await cancelPaymentRefund('refund_id_1', paymentCancelRefund);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        `SCTM - cancelMolliePaymentRefund - Calling Mollie API - Failed to cancel the refund with unknown errors`,
        {
          molliePaymentId: paymentCancelRefund.paymentId,
          mollieRefundId: 'refund_id_1',
          error: new Error('Unknown error'),
        },
      );
    }
  });
});
