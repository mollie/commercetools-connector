import { describe, test, jest, expect, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { post } from '../../src/controllers/processor.controller';
import CustomError from '../../src/errors/custom.error';
import { paymentController } from '../../src/controllers/payment.controller';
import SkipError from '../../src/errors/skip.error';
import { logger } from '../../src/utils/logger.utils';

jest.mock('../../src/controllers/payment.controller', () => ({
  paymentController: jest.fn(),
}));

describe('Test processor.controller.ts', () => {
  let res: Partial<Response>;

  beforeEach(() => {
    res = {
      // @ts-expect-error: ignore type error
      status: jest.fn().mockReturnThis(),
      // @ts-expect-error: ignore type error
      send: jest.fn(),
      // @ts-expect-error: ignore type error
      json: jest.fn(),
    };
  });

  test.each([
    {
      action: 'Create',
      typeId: 'payment',
    },
    {
      action: 'Update',
      typeId: 'cart',
    },
    {
      action: 'Update',
      typeId: 'order',
    },
  ])('call $action $typeId', async ({ action, typeId }) => {
    const request = {
      body: {
        action: action,
        resource: {
          typeId: typeId,
          obj: {
            paymentMethodInfo: {
              paymentInterface: 'mollie',
              method: 'card',
            },
            amountPlanned: {
              currencyCode: 'EUR',
              centAmount: 1000,
              fractionDigits: 2,
            },
          },
        },
      },
    } as unknown as Request;

    await post(request, res as Response);
    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
  });

  test('should throw CustomError if action or resource is missing', async () => {
    const request = {
      body: {
        resource: {
          typeId: 'payment',
          obj: {
            paymentMethodInfo: {
              paymentInterface: 'mollie',
              method: 'card',
            },
            amountPlanned: {
              currencyCode: 'EUR',
              centAmount: 1000,
              fractionDigits: 2,
            },
          },
        },
      },
    } as unknown as Request;

    try {
      await post(request, res as Response);
    } catch (error: any) {
      expect(error).toBeInstanceOf(CustomError);
    }
  });

  test('should call logger debug when a SkipError is thrown', async () => {
    const request = {
      body: {
        action: 'Create',
        resource: {
          typeId: 'payment',
          obj: {
            paymentMethodInfo: {
              paymentInterface: 'mollie',
              method: 'card',
            },
            amountPlanned: {
              currencyCode: 'EUR',
              centAmount: 1000,
              fractionDigits: 2,
            },
          },
        },
      },
    } as unknown as Request;

    (paymentController as jest.Mock).mockImplementation(() => {
      throw new SkipError('Skipped');
    });

    try {
      await post(request, res as Response);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(SkipError);
      expect(logger.debug).toBeCalledTimes(1);
      expect(logger.debug).toBeCalledWith('Skip action', (error as SkipError).message);
    }
  });

  test('should call logger debug when an unexpected error was thrown', async () => {
    const request = {
      body: {
        action: 'Create',
        resource: {
          typeId: 'payment',
          obj: {
            paymentMethodInfo: {
              paymentInterface: 'mollie',
              method: 'card',
            },
            amountPlanned: {
              currencyCode: 'EUR',
              centAmount: 1000,
              fractionDigits: 2,
            },
          },
        },
      },
    } as unknown as Request;

    (paymentController as jest.Mock).mockImplementation(() => {
      throw new Error('Dummy error');
    });

    try {
      await post(request, res as Response);
    } catch (error: unknown) {
      expect(error).not.toBeInstanceOf(SkipError);
      expect(error).not.toBeInstanceOf(CustomError);
      expect(logger.debug).toBeCalledTimes(1);
      expect(logger.debug).toBeCalledWith('Unexpected error occurred when processing request', error);
    }
  });
});
