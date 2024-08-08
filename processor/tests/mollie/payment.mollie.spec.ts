import { jest, expect, describe, it, afterEach } from '@jest/globals';
import {
  cancelPayment,
  createMolliePayment,
  createPaymentWithCustomMethod,
  getPaymentById,
  listPaymentMethods,
} from '../../src/mollie/payment.mollie';
import { MollieApiError, PaymentCreateParams } from '@mollie/api-client';
import { logger } from '../../src/utils/logger.utils';
import CustomError from '../../src/errors/custom.error';
import { VERSION_STRING } from '../../src/utils/constant.utils';
import { getApiKey } from '../../src/utils/config.utils';
import fetch from 'node-fetch';

const mockPaymentsCreate = jest.fn();
const mockPaymentsGet = jest.fn();
const mockPaymentsList = jest.fn();
const mockPaymentCancel = jest.fn();

jest.mock('../../src/client/mollie.client', () => ({
  initMollieClient: jest.fn(() => ({
    payments: {
      create: mockPaymentsCreate,
      get: mockPaymentsGet,
      cancel: mockPaymentCancel,
    },
    methods: {
      list: mockPaymentsList,
    },
  })),
}));

// @ts-expect-error: Mock fetch globally
fetch = jest.fn() as jest.Mock;

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

describe('createPaymentWithCustomMethod', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  it('should call fetch with the correct parameters', async () => {
    const paymentParams: PaymentCreateParams = {
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
      description: 'Test payment',
    };

    const createPaymentEndpoint = 'https://api.mollie.com/v2/payments';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
      versionStrings: `${VERSION_STRING}`,
    };

    (fetch as unknown as jest.Mock).mockImplementation(async () =>
      Promise.resolve({
        json: () => Promise.resolve({ data: [] }),
        headers: new Headers(),
        ok: true,
        redirected: false,
        status: 201,
        statusText: 'OK',
        url: '',
      }),
    );

    await createPaymentWithCustomMethod(paymentParams);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(createPaymentEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentParams),
    });
  });

  it('should log error if Mollie API returns an error', async () => {
    const paymentParams: PaymentCreateParams = {
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
      description: 'Test payment',
    };

    const createPaymentEndpoint = 'https://api.mollie.com/v2/payments';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
      versionStrings: `${VERSION_STRING}`,
    };

    const response = {
      data: {
        detail: 'Something went wrong',
        field: 'amount',
      },
    };

    const errorMessage = `SCTM - createPaymentWithCustomMethod - error: ${response.data.detail}, field: ${response.data.field}`;

    (fetch as unknown as jest.Mock).mockImplementation(async () =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            detail: 'Something went wrong',
            field: 'amount',
          }),
        headers: new Headers(),
        ok: false,
        redirected: false,
        status: 422,
        statusText: 'OK',
        url: '',
      }),
    );

    try {
      await createPaymentWithCustomMethod(paymentParams);
    } catch (error: unknown) {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(createPaymentEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentParams),
      });

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(errorMessage, {
        response: {
          detail: 'Something went wrong',
          field: 'amount',
        },
      });

      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).statusCode).toBe(400);
      expect((error as CustomError).message).toBe(errorMessage);
    }
  });

  it('should throw a general error when the request failed with status neither 422 nor 503', async () => {
    const paymentParams: PaymentCreateParams = {
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
      description: 'Test payment',
    };

    const createPaymentEndpoint = 'https://api.mollie.com/v2/payments';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
      versionStrings: `${VERSION_STRING}`,
    };

    const response = {
      detail: 'Something went wrong',
      field: 'amount',
      extra: 'testing',
      title: 'mollie',
    };

    const errorMessage = 'SCTM - createPaymentWithCustomMethod - Failed to create a payment with unknown errors';

    (fetch as unknown as jest.Mock).mockImplementation(async () =>
      Promise.resolve({
        json: () => Promise.resolve(response),
        headers: new Headers(),
        ok: false,
        redirected: false,
        status: 500,
        statusText: 'Failed',
        url: '',
      }),
    );

    try {
      await createPaymentWithCustomMethod(paymentParams);
    } catch (error: any) {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(createPaymentEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentParams),
      });

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(errorMessage, { response: response });

      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).statusCode).toBe(400);
      expect((error as CustomError).message).toBe(errorMessage);
    }
  });

  it('should throw a general error when the an exception is thrown somewhere in the process', async () => {
    const paymentParams: PaymentCreateParams = {
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
      description: 'Test payment',
    };

    const createPaymentEndpoint = 'https://api.mollie.com/v2/payments';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
      versionStrings: `${VERSION_STRING}`,
    };

    const errorMessage = 'SCTM - createPaymentWithCustomMethod - Failed to create a payment with unknown errors';

    const generalError = new Error('General error');

    (fetch as unknown as jest.Mock).mockImplementation(async () => {
      throw generalError;
    });

    try {
      await createPaymentWithCustomMethod(paymentParams);
    } catch (error: any) {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(createPaymentEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentParams),
      });

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(errorMessage, { error: generalError });

      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).statusCode).toBe(400);
      expect((error as CustomError).message).toBe(errorMessage);
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

  it('should call cancel payment with the correct parameters', async () => {
    await cancelPayment('tr_WDqYK6vllg');

    expect(mockPaymentCancel).toHaveBeenCalledTimes(1);
    expect(mockPaymentCancel).toHaveBeenCalledWith('tr_WDqYK6vllg');
  });

  it('should be able to return a proper error message when error is an instance of MollieApiError occurred', async () => {
    const errorMessage = 'Something wrong happened';
    const mollieApiError = new MollieApiError(errorMessage, { field: 'paymentId' });

    (mockPaymentCancel as jest.Mock).mockImplementation(() => {
      throw mollieApiError;
    });

    try {
      await cancelPayment('tr_WDqYK6vllg');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(`SCTM - cancelPayment - error: ${errorMessage}, field: paymentId`, {
        error: mollieApiError,
      });
    }
  });

  it('should be able to return a proper error message when error is not an instance of MollieApiError occurred', async () => {
    const unexpectedError = new CustomError(400, 'dummy message');

    (mockPaymentCancel as jest.Mock).mockImplementation(() => {
      throw unexpectedError;
    });

    try {
      await cancelPayment('tr_WDqYK6vllg');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith('SCTM - cancelPayment - Failed to cancel payments with unknown errors', {
        error: unexpectedError,
      });
    }
  });

  // TODO: Relate to Mollie Client issue
  it('should not throw any error or terminate the process if the Mollie API returns an unexpected error with specific message', async () => {
    const unexpectedError = new Error('Received unexpected response from the server with resource undefined');

    (mockPaymentCancel as jest.Mock).mockImplementation(() => {
      throw unexpectedError;
    });

    const response = await cancelPayment('tr_WDqYK6vllg');
    expect(response).toBe(undefined);
    expect(logger.error).toBeCalledTimes(0);
  });
});
