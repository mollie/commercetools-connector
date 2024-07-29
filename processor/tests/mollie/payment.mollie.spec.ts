import { jest, expect, describe, it, afterEach } from '@jest/globals';
import { cancelPayment, createMolliePayment, getPaymentById, listPaymentMethods } from '../../src/mollie/payment.mollie';
import { MollieApiError, PaymentCreateParams } from '@mollie/api-client';
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

  it('should throw MollieApiError', async () => {
    const paymentParams: PaymentCreateParams = {
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
      description: 'Test payment',
    };

    mockPaymentsCreate.mockImplementation(() => {
      throw new MollieApiError('Bad request', { statusCode: 400, field: 'Test' });
    });

    try {
      await createMolliePayment(paymentParams);
    } catch (error: any) {
      expect(error.message).toBe(`SCTM - createMolliePayment - error: Bad request, field: Test`);
      expect(error.statusCode).toBe(400);
      expect(mockPaymentsCreate).toHaveBeenCalledTimes(1);
      expect(mockPaymentsCreate).toHaveBeenCalledWith(paymentParams);
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(`SCTM - createMolliePayment - error: Bad request, field: Test`, {
        error: new MollieApiError('Bad request', { statusCode: 400, field: 'Test' }),
      });
    }
  });

  it('should throw other exception', async () => {
    const paymentParams: PaymentCreateParams = {
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
      description: 'Test payment',
    };

    mockPaymentsCreate.mockImplementation(() => {
      throw new Error('Unknown error');
    });

    try {
      await createMolliePayment(paymentParams);
    } catch (error: any) {
      expect(error.message).toBe(`SCTM - createMolliePayment - Failed to create payment with unknown errors`);
      expect(mockPaymentsCreate).toHaveBeenCalledTimes(1);
      expect(mockPaymentsCreate).toHaveBeenCalledWith(paymentParams);
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        'SCTM - createMolliePayment - Failed to create payment with unknown errors',
        {
          error: new Error('Unknown error'),
        },
      );
    }
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
  it('should return the correct list of payment methods', async () => {
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

  it('should throw MollieApiError', async () => {
    const mockOption = {
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
      resource: 'payments',
    };

    mockPaymentsList.mockImplementation(() => {
      throw new MollieApiError('Bad request', { statusCode: 400, field: 'Test' });
    });

    try {
      await listPaymentMethods(mockOption);
    } catch (error: any) {
      expect(error.message).toBe(`SCTM - listPaymentMethods - error: Bad request, field: Test`);
      expect(error.statusCode).toBe(400);
      expect(mockPaymentsList).toHaveBeenCalledTimes(1);
      expect(mockPaymentsList).toHaveBeenCalledWith(mockOption);
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith('SCTM - listPaymentMethods - error: Bad request, field: Test', {
        error: new MollieApiError('Bad request', { statusCode: 400, field: 'Test' }),
      });
    }
  });

  it('should throw throw other exception', async () => {
    const mockOption = {
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
      resource: 'payments',
    };

    mockPaymentsList.mockImplementation(() => {
      throw new Error('Unknown error');
    });

    try {
      await listPaymentMethods(mockOption);
    } catch (error: any) {
      expect(error.message).toBe(`SCTM - listPaymentMethods - Failed to list payments with unknown errors`);
      expect(error.statusCode).toBe(400);
      expect(mockPaymentsList).toHaveBeenCalledTimes(1);
      expect(mockPaymentsList).toHaveBeenCalledWith(mockOption);
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        'SCTM - listPaymentMethods - Failed to list payments with unknown errors',
        {
          error: new Error('Unknown error'),
        },
      );
    }
  });
});

describe('cancelPayment', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  it('should call cancel refund with the correct parameters', async () => {
    await cancelPayment('tr_WDqYK6vllg');

    expect(mockPaymentRefundCancel).toHaveBeenCalledTimes(1);
    expect(mockPaymentRefundCancel).toHaveBeenCalledWith('tr_WDqYK6vllg');
  });

  it('should be able to return a proper error message when error which is an instance of MollieApiError occurred', async () => {
    const errorMessage = 'Something wrong happened';
    const mollieApiError = new MollieApiError(errorMessage);

    (mockPaymentRefundCancel as jest.Mock).mockImplementation(() => {
      throw mollieApiError;
    });

    try {
      await cancelPayment('tr_WDqYK6vllg');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(`SCTM - cancelPayment - error: ${errorMessage}`,{
        error: mollieApiError,
      });
    }
  });

  it('should be able to return a proper error message when error which is not an instance of MollieApiError occurred', async () => {
    const unexpectedError = new CustomError(400, 'dummy message');

    (mockPaymentRefundCancel as jest.Mock).mockImplementation(() => {
      throw unexpectedError;
    });

    try {
      await cancelPayment('tr_WDqYK6vllg');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith({
        message: `SCTM - cancelPayment - Failed to cancel payments with unknown errors`,
        error: unexpectedError,
      });
    }
  });
});
