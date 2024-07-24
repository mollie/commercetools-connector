import { afterEach, describe, expect, jest } from '@jest/globals';
import { getPaymentByMolliePaymentId, updatePayment } from '../../src/commercetools/payment.commercetools';
import { Payment } from '@commercetools/platform-sdk';
import { createApiRoot } from '../../src/client/create.client';
import { logger } from '../../src/utils/logger.utils';
import CustomError from '../../src/errors/custom.error';
import { PaymentUpdateAction } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/payment';

const CTPayment: Payment = {
  id: '5c8b0375-305a-4f19-ae8e-07806b101999',
  version: 1,
  createdAt: '2024-07-04T14:07:35.625Z',
  lastModifiedAt: '2024-07-04T14:07:35.625Z',
  amountPlanned: {
    type: 'centPrecision',
    currencyCode: 'EUR',
    centAmount: 1000,
    fractionDigits: 2,
  },
  paymentStatus: {},
  transactions: [
    {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      type: 'Charge',
      amount: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 1000,
        fractionDigits: 2,
      },
      interactionId: 'test_id',
      state: 'Pending',
    },
  ],
  interfaceInteractions: [],
  paymentMethodInfo: {
    method: 'creditcard',
  },
};

jest.mock('../../src/client/create.client', () => ({
  createApiRoot: jest.fn(),
}));

describe('Test payment.commercetools', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getPaymentByMolliePaymentId should return the correct payment', async () => {
    const getPayments = jest.fn();

    (createApiRoot as jest.Mock).mockReturnValue({
      payments: jest.fn().mockReturnValue({
        get: getPayments,
      }),
    });

    getPayments.mockReturnValue({
      execute: jest.fn().mockReturnValue({
        body: {
          results: [CTPayment],
        },
      }),
    });

    const result = await getPaymentByMolliePaymentId(CTPayment.transactions[0].interactionId as string);

    expect(getPayments).toHaveBeenCalledTimes(1);
    expect(getPayments).toHaveBeenCalledWith({
      queryArgs: {
        where: `transactions(interactionId="${CTPayment.transactions[0].interactionId}")`,
      },
    });
    expect(result).toStrictEqual(CTPayment);
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(`Found payment with id ${CTPayment.id}`);
  });

  it('getPaymentByMolliePaymentId should throw exception', async () => {
    const getPayments = jest.fn();

    (createApiRoot as jest.Mock).mockReturnValue({
      payments: jest.fn().mockReturnValue({
        get: getPayments,
      }),
    });

    getPayments.mockReturnValue({
      execute: jest.fn().mockReturnValue({
        body: {
          results: [],
        },
      }),
    });

    try {
      await getPaymentByMolliePaymentId(CTPayment.transactions[0].interactionId as string);
    } catch (error: any) {
      expect(getPayments).toHaveBeenCalledTimes(1);
      expect(getPayments).toHaveBeenCalledWith({
        queryArgs: {
          where: `transactions(interactionId="${CTPayment.transactions[0].interactionId}")`,
        },
      });
      expect(error).toBeInstanceOf(CustomError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request: There is not any assigned payment');
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith('There is not any assigned payment');
    }
  });

  it('updatePayment should call commercetools ', async () => {
    const withId = jest.fn();
    const createPayment = jest.fn();

    (createApiRoot as jest.Mock).mockReturnValue({
      payments: jest.fn().mockReturnValue({
        withId,
      }),
    });

    withId.mockReturnValue({
      post: createPayment,
    });

    createPayment.mockReturnValue({
      execute: jest.fn().mockReturnValue({
        body: CTPayment,
      }),
    });

    const actions = [
      {
        action: 'addTransaction',
        transaction: {
          type: 'Charge',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          interactionId: 'test_id',
          state: 'Pending',
        },
      },
    ] as PaymentUpdateAction[];

    const result = await updatePayment(CTPayment, actions);

    expect(createPayment).toHaveBeenCalledTimes(1);
    expect(createPayment).toHaveBeenCalledWith({
      body: {
        version: CTPayment.version,
        actions: actions,
      },
    });
    expect(result).toStrictEqual(CTPayment);
  });

  it('updatePayment should throw exception', async () => {
    const withId = jest.fn();
    const createPayment = jest.fn();

    (createApiRoot as jest.Mock).mockReturnValue({
      payments: jest.fn().mockReturnValue({
        withId,
      }),
    });

    withId.mockReturnValue({
      post: createPayment,
    });

    createPayment.mockReturnValue({
      execute: jest.fn().mockImplementationOnce(() => {
        throw new Error('Error');
      }),
    });

    try {
      await updatePayment(CTPayment, []);
    } catch (error: any) {
      expect(withId).toHaveBeenCalledTimes(1);
      expect(withId).toHaveBeenCalledWith({ ID: CTPayment.id });
      expect(createPayment).toHaveBeenCalledTimes(1);
      expect(createPayment).toHaveBeenCalledWith({
        body: {
          version: CTPayment.version,
          actions: [],
        },
      });
      expect(error).toBeInstanceOf(CustomError);
      expect(error.message).toBe('Error');
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith('Error in updatePayment', new Error('Error'));
    }
  });
});
