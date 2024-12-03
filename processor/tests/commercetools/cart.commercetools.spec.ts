import { getCartFromPayment, updateCart } from './../../src/commercetools/cart.commercetools';
import { afterEach, describe, expect, jest, it } from '@jest/globals';
import { Cart, CartUpdateAction } from '@commercetools/platform-sdk';
import { createApiRoot } from '../../src/client/create.client';
import { logger } from '../../src/utils/logger.utils';
import CustomError from '../../src/errors/custom.error';

const cart: Cart = {
  id: '5c8b0375-305a-4f19-ae8e-07806b101999',
  country: 'DE',
} as Cart;

jest.mock('../../src/client/create.client', () => ({
  createApiRoot: jest.fn(),
}));

describe('Test getCartFromPayment', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the correct cart', async () => {
    const getCarts = jest.fn();

    (createApiRoot as jest.Mock).mockReturnValue({
      carts: jest.fn().mockReturnValue({
        get: getCarts,
      }),
    });

    getCarts.mockReturnValue({
      execute: jest.fn().mockReturnValue({
        body: {
          results: [cart],
        },
      }),
    });

    const paymentId = 'test-payment-id';
    const result = await getCartFromPayment(paymentId);

    expect(getCarts).toHaveBeenCalledTimes(1);
    expect(getCarts).toHaveBeenCalledWith({
      queryArgs: {
        where: `paymentInfo(payments(id= "${paymentId}"))`,
      },
    });
    expect(result).toStrictEqual(cart);
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(`Found cart with id ${cart.id}`);
  });

  it('should throw exception', async () => {
    const getCarts = jest.fn();

    (createApiRoot as jest.Mock).mockReturnValue({
      carts: jest.fn().mockReturnValue({
        get: getCarts,
      }),
    });

    getCarts.mockReturnValue({
      execute: jest.fn().mockReturnValue({
        body: {
          results: [],
        },
      }),
    });

    const paymentId = 'test-payment-id';

    try {
      await getCartFromPayment(paymentId);
    } catch (error: any) {
      expect(getCarts).toHaveBeenCalledTimes(1);
      expect(getCarts).toHaveBeenCalledWith({
        queryArgs: {
          where: `paymentInfo(payments(id= "${paymentId}"))`,
        },
      });
      expect(error).toBeInstanceOf(CustomError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('There is no cart which attached this target payment');
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith('There is no cart which attached this target payment');
    }
  });
});

describe('Test updateCart', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should receive the result', async () => {
    const mockWithId = jest.fn();
    const mockPost = jest.fn();
    const cart = {
      id: 'test-123123',
      version: 1,
    } as unknown as Cart;

    (createApiRoot as jest.Mock).mockReturnValue({
      carts: jest.fn().mockReturnValue({
        withId: mockWithId,
      }),
    });

    mockWithId.mockReturnValue({
      post: mockPost,
    });

    mockPost.mockReturnValue({
      execute: jest.fn().mockReturnValue({
        body: cart,
      }),
    });

    const updateActions = [] as unknown as CartUpdateAction[];
    const updateCartResult = await updateCart(cart, updateActions);
    expect(mockWithId).toBeCalledTimes(1);
    expect(mockWithId).toBeCalledWith({
      ID: cart.id,
    });
    expect(mockPost).toBeCalledTimes(1);
    expect(mockPost).toBeCalledWith({
      body: {
        version: cart.version,
        actions: updateActions,
      },
    });
    expect(updateCartResult).toEqual(cart);
  });
});
