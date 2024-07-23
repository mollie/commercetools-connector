import { jest, expect, describe, it, test, afterEach } from '@jest/globals';
import { createMolliePayment, getPaymentById, listPaymentMethods } from '../../src/mollie/payment.mollie';
import { PaymentCreateParams } from '@mollie/api-client';;

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
