import { describe, test, jest, expect, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { post } from '../../src/controllers/processor.controller';

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
});
