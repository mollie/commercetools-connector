import { jest, expect, describe, it, test, afterEach } from '@jest/globals';
import {
  cancelPaymentRefund,
  createMolliePayment,
  getPaymentById,
  getPaymentRefund,
  listPaymentMethods,
} from '../../src/mollie/payment.mollie';
import { MollieApiError, PaymentCreateParams } from '@mollie/api-client';
import { GetParameters, CancelParameters } from '@mollie/api-client/dist/types/src/binders/payments/refunds/parameters';
import { logger } from '../../src/utils/logger.utils';
import CustomError from '../../src/errors/custom.error';

const mockPaymentsCreate = jest.fn();
const mockPaymentsGet = jest.fn();
const mockPaymentsList = jest.fn();
const mockPaymentRefundGet = jest.fn();
const mockPaymentRefundCancel = jest.fn();

jest.mock('../../src/client/mollie.client', () => ({
  initMollieClient: jest.fn(() => ({
    payments: {
      create: mockPaymentsCreate,
      get: mockPaymentsGet,
    },
    methods: {
      list: mockPaymentsList,
    },
    paymentRefunds: {
      get: mockPaymentRefundGet,
      cancel: mockPaymentRefundCancel,
    },
  })),
}));

describe('createMolliePayment', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  it('should call payments.create with the correct parameters', async () => {
    const paymentParams: PaymentCreateParams = {
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
      description: 'Test payment',
    };

    await createMolliePayment(paymentParams);

    expect(mockPaymentsCreate).toHaveBeenCalledTimes(1);
    expect(mockPaymentsCreate).toHaveBeenCalledWith(paymentParams);
  });
});

describe('getPaymentById', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  it('should call payments.get with the correct parameters', async () => {
    const paymentId = 'tr_test';
    const extraParams = { embed: ['refunds', 'chargebacks'] };

    await getPaymentById(paymentId);

    expect(mockPaymentsGet).toHaveBeenCalledTimes(1);
    expect(mockPaymentsGet).toHaveBeenCalledWith(paymentId, extraParams);
  });
});

describe('listPaymentMethods', () => {
  test('should return the correct list of payment methods', async () => {
    const mockOption = {
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
      resource: 'payments',
    };

    await listPaymentMethods(mockOption);

    expect(mockPaymentsList).toHaveBeenCalledTimes(1);
    expect(mockPaymentsList).toHaveBeenCalledWith(mockOption);
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
      expect(logger.error).toBeCalledWith({
        message: `SCTM - Calling Mollie API - getPaymentRefund - error: ` + errorMessage,
        error: mollieApiError,
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
      expect(logger.error).toBeCalledWith({
        message: `SCTM - Calling Mollie API - getPaymentRefund - Failed to cancel the refund with unknown errors`,
        error: unexpectedError,
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
      expect(logger.error).toBeCalledWith({
        message: `SCTM - Calling Mollie API - cancelPaymentRefund - error: ` + errorMessage,
        error: mollieApiError,
      });
    }
  });

  it('should be able to return a proper error message when error which is not an instance of MollieApiError occurred', async () => {
    const unexpectedError = new CustomError(400, 'dummy message');

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
      expect(logger.error).toBeCalledWith({
        message: `SCTM - Calling Mollie API - cancelPaymentRefund - Failed to cancel the refund with unknown errors`,
        error: unexpectedError,
      });
    }
  });
});
