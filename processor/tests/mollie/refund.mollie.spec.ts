import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  CancelParameters,
  CreateParameters,
  GetParameters,
} from '@mollie/api-client/dist/types/src/binders/payments/refunds/parameters';
import { cancelPaymentRefund, createPaymentRefund, getPaymentRefund } from '../../src/mollie/refund.mollie';
import { MollieApiError } from '@mollie/api-client';
import CustomError from '../../src/errors/custom.error';
import { logger } from '../../src/utils/logger.utils';

const mockPaymentRefundGet = jest.fn();
const mockPaymentRefundCreate = jest.fn();
const mockPaymentRefundCancel = jest.fn();

jest.mock('../../src/client/mollie.client', () => ({
  initMollieClient: jest.fn(() => ({
    paymentRefunds: {
      get: mockPaymentRefundGet,
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
      expect(logger.error).toBeCalledWith(`SCTM - createPaymentRefund - Calling Mollie API - error: ${errorMessage}`, {
        molliePaymentId: paymentCreateRefund.paymentId,
        error: mollieApiError,
      });
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
        `SCTM - createPaymentRefund - Calling Mollie API - Failed to create refund with unknown errors`,
        {
          molliePaymentId: paymentCreateRefund.paymentId,
          error: new Error('Unknown error'),
        },
      );
    }
  });
});

describe('getPaymentRefund', () => {
  it('should call get payment refund with the correct parameters', async () => {
    const paymentGetRefundParams: GetParameters = {
      paymentId: 'tr_12345',
    };

    await getPaymentRefund('refund_id_1', paymentGetRefundParams);

    expect(mockPaymentRefundGet).toHaveBeenCalledTimes(1);
    expect(mockPaymentRefundGet).toHaveBeenCalledWith('refund_id_1', paymentGetRefundParams);
  });

  it('should be able to return a proper error message when error which is an instance of MollieApiError occurred', async () => {
    const errorMessage = 'Something wrong happened';
    const mollieApiError = new MollieApiError(errorMessage);

    (mockPaymentRefundGet as jest.Mock).mockImplementation(() => {
      throw mollieApiError;
    });

    const paymentGetRefundParams: GetParameters = {
      paymentId: 'tr_12345',
    };

    try {
      await getPaymentRefund('refund_id_1', paymentGetRefundParams);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(`SCTM - getPaymentRefund - Calling Mollie API - error: ${errorMessage}`, {
        error: mollieApiError,
        molliePaymentId: 'tr_12345',
        mollieRefundId: 'refund_id_1',
      });
    }
  });

  it('should be able to return a proper error message when error which is not an instance of MollieApiError occurred', async () => {
    const unexpectedError = new CustomError(400, 'dummy message');

    (mockPaymentRefundGet as jest.Mock).mockImplementation(() => {
      throw unexpectedError;
    });

    const paymentGetRefundParams: GetParameters = {
      paymentId: 'tr_12345',
    };

    try {
      await getPaymentRefund('refund_id_1', paymentGetRefundParams);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        'SCTM - getPaymentRefund - Calling Mollie API - Failed to cancel the refund with unknown errors',
        {
          molliePaymentId: 'tr_12345',
          mollieRefundId: 'refund_id_1',
          error: unexpectedError,
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

  it('should be able to return a proper error message when error which is an instance of MollieApiError occurred', async () => {
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
      expect(logger.error).toBeCalledWith(`SCTM - cancelPaymentRefund - Calling Mollie API - error: ${errorMessage}`, {
        molliePaymentId: paymentCancelRefund.paymentId,
        mollieRefundId: 'refund_id_1',
        error: mollieApiError,
      });
    }
  });

  it('should be able to return a proper error message when error which is not an instance of MollieApiError occurred', async () => {
    const unexpectedError = new CustomError(400, 'Unknown error');

    (mockPaymentRefundCancel as jest.Mock).mockImplementation(() => {
      throw unexpectedError;
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
        `SCTM - cancelPaymentRefund - Calling Mollie API - Failed to cancel the refund with unknown errors`,
        {
          molliePaymentId: paymentCancelRefund.paymentId,
          mollieRefundId: 'refund_id_1',
          error: new Error('Unknown error'),
        },
      );
    }
  });
});
