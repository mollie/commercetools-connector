import { jest, expect, describe, it, afterEach } from '@jest/globals';
import { createMolliePayment, getPaymentById, listPaymentMethods } from '../../src/mollie/payment.mollie';
import { MollieApiError, PaymentCreateParams } from '@mollie/api-client';
import { logger } from '../../src/utils/logger.utils';

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
      expect(error.message).toBe(`createMolliePayment - error: Bad request, field: Test`);
      expect(error.statusCode).toBe(400);
      expect(mockPaymentsCreate).toHaveBeenCalledTimes(1);
      expect(mockPaymentsCreate).toHaveBeenCalledWith(paymentParams);
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith({
        message: `createMolliePayment - error: Bad request, field: Test`,
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
      expect(error.message).toBe(`createMolliePayment - Failed to create payment with unknown errors`);
      expect(mockPaymentsCreate).toHaveBeenCalledTimes(1);
      expect(mockPaymentsCreate).toHaveBeenCalledWith(paymentParams);
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith({
        message: `createMolliePayment - Failed to create payment with unknown errors`,
        error: new Error('Unknown error'),
      });
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
      expect(error.message).toBe(`listPaymentMethods - error: Bad request, field: Test`);
      expect(error.statusCode).toBe(400);
      expect(mockPaymentsList).toHaveBeenCalledTimes(1);
      expect(mockPaymentsList).toHaveBeenCalledWith(mockOption);
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith({
        message: `listPaymentMethods - error: Bad request, field: Test`,
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
      expect(error.message).toBe(`listPaymentMethods - Failed to list payments with unknown errors`);
      expect(error.statusCode).toBe(400);
      expect(mockPaymentsList).toHaveBeenCalledTimes(1);
      expect(mockPaymentsList).toHaveBeenCalledWith(mockOption);
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith({
        message: `listPaymentMethods - Failed to list payments with unknown errors`,
        error: new Error('Unknown error'),
      });
    }
  });
});
