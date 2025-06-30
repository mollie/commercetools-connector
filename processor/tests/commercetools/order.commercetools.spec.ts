import { afterEach, describe, expect, jest } from '@jest/globals';
import { getOrderByPaymentId } from '../../src/commercetools/order.commercetools';
import { createApiRoot } from '../../src/client/create.client';
import { logger } from '../../src/utils/logger.utils';
import CustomError from '../../src/errors/custom.error';
import { Order } from '@commercetools/connect-payments-sdk';

const mockOrder: Order = {
  id: 'order-123',
  version: 1,
  createdAt: '2024-04-28T10:00:00.000Z',
  lastModifiedAt: '2024-04-28T10:00:00.000Z',
  totalPrice: {
    type: 'centPrecision',
    currencyCode: 'EUR',
    centAmount: 2500,
    fractionDigits: 2,
  },
  orderState: 'Open',
  lineItems: [],
  customLineItems: [],
  paymentInfo: {
    payments: [
      {
        typeId: 'payment',
        id: 'payment-123',
      },
    ],
  },
  // Added missing required properties
  shippingMode: 'Single',
  shipping: [],
  refusedGifts: [],
  origin: 'Customer',
  syncInfo: [],
};

// Mock the createApiRoot module
jest.mock('../../src/client/create.client', () => ({
  createApiRoot: jest.fn(),
}));

describe('Test order.commercetools', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getOrderByPaymentId should return the correct order when exactly one order is found', async () => {
    // Set up the mock for createApiRoot
    const getOrders = jest.fn();

    (createApiRoot as jest.Mock).mockReturnValue({
      orders: jest.fn().mockReturnValue({
        get: getOrders,
      }),
    });

    // Mock the successful response with exactly one order
    getOrders.mockReturnValue({
      execute: jest.fn().mockReturnValue({
        body: {
          results: [mockOrder],
        },
      }),
    });

    // Call the function under test
    const result = await getOrderByPaymentId('payment-123');

    // Verify the function was called with the right arguments
    expect(getOrders).toHaveBeenCalledTimes(1);
    expect(getOrders).toHaveBeenCalledWith({
      queryArgs: {
        where: 'paymentInfo(payments(typeId = "payment" and id = "payment-123"))',
      },
    });

    // Verify the result and logging
    expect(result).toStrictEqual(mockOrder);
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(`Found order with id ${mockOrder.id}`);
  });

  it('getOrderByPaymentId should throw an error when no orders are found', async () => {
    // Set up the mock for createApiRoot
    const getOrders = jest.fn();

    (createApiRoot as jest.Mock).mockReturnValue({
      orders: jest.fn().mockReturnValue({
        get: getOrders,
      }),
    });

    // Mock the response with no orders
    getOrders.mockReturnValue({
      execute: jest.fn().mockReturnValue({
        body: {
          results: [],
        },
      }),
    });

    // Verify the function throws the expected error
    await expect(getOrderByPaymentId('payment-123')).rejects.toThrow(
      new CustomError(400, `Cannot get order by payment ID payment-123`),
    );

    // Verify the API was called with the right arguments
    expect(getOrders).toHaveBeenCalledTimes(1);
    expect(getOrders).toHaveBeenCalledWith({
      queryArgs: {
        where: 'paymentInfo(payments(typeId = "payment" and id = "payment-123"))',
      },
    });

    // Verify error was logged properly
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      'getOrderByPaymentId',
      expect.objectContaining({
        message: `Cannot get order by payment ID payment-123`,
        statusCode: 400,
      }),
    );
  });

  it('getOrderByPaymentId should throw an error when multiple orders are found', async () => {
    // Set up the mock for createApiRoot
    const getOrders = jest.fn();

    (createApiRoot as jest.Mock).mockReturnValue({
      orders: jest.fn().mockReturnValue({
        get: getOrders,
      }),
    });

    // Mock the response with multiple orders
    getOrders.mockReturnValue({
      execute: jest.fn().mockReturnValue({
        body: {
          results: [mockOrder, { ...mockOrder, id: 'order-456' }],
        },
      }),
    });

    // Verify the function throws the expected error
    await expect(getOrderByPaymentId('payment-123')).rejects.toThrow(
      new CustomError(400, `Cannot get order by payment ID payment-123`),
    );

    // Verify the API was called with the right arguments
    expect(getOrders).toHaveBeenCalledTimes(1);
    expect(getOrders).toHaveBeenCalledWith({
      queryArgs: {
        where: 'paymentInfo(payments(typeId = "payment" and id = "payment-123"))',
      },
    });

    // Verify error was logged properly
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      'getOrderByPaymentId',
      expect.objectContaining({
        message: `Cannot get order by payment ID payment-123`,
        statusCode: 400,
      }),
    );
  });

  it('getOrderByPaymentId should propagate commercetools API errors', async () => {
    // Set up the mock for createApiRoot
    const getOrders = jest.fn();

    (createApiRoot as jest.Mock).mockReturnValue({
      orders: jest.fn().mockReturnValue({
        get: getOrders,
      }),
    });

    // Mock an API error
    const apiError = new Error('Commercetools API error');
    getOrders.mockReturnValue({
      execute: jest.fn().mockImplementation(() => {
        throw apiError;
      }),
    });

    // Verify the function propagates the error
    await expect(getOrderByPaymentId('payment-123')).rejects.toThrow('Commercetools API error');

    // Verify the API was called with the right arguments
    expect(getOrders).toHaveBeenCalledTimes(1);
    expect(getOrders).toHaveBeenCalledWith({
      queryArgs: {
        where: 'paymentInfo(payments(typeId = "payment" and id = "payment-123"))',
      },
    });
  });
});
