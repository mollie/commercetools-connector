import { Payment } from '@commercetools/platform-sdk';
import { logger } from '../utils/logger.utils';
import CustomError from '../errors/custom.error';
import { createApiRoot } from '../client/create.client';
import { PaymentUpdateAction } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/payment';

export const getPaymentByMolliePaymentId = async (molliePaymentId: string): Promise<Payment> => {
  const payments = await createApiRoot()
    .payments()
    .get({
      queryArgs: {
        where: `transactions(interactionId="${molliePaymentId}")`,
      },
    })
    .execute();

  const results = payments.body.results;
  if (results.length !== 1) {
    logger.error('There is not any assigned payment');
    throw new CustomError(400, 'Bad request: There is not any assigned payment');
  }

  logger.info(`Found payment with id ${results[0].id}`);

  return results[0];
};

export async function updatePayment(payment: Payment, updateActions: PaymentUpdateAction[]): Promise<Payment> {
  try {
    const response = await createApiRoot()
      .payments()
      .withId({ ID: payment.id })
      .post({
        body: {
          version: payment.version,
          actions: updateActions,
        },
      })
      .execute();
    const { body: paymentObject } = response;

    return paymentObject;
  } catch (error) {
    logger.error('Error in updatePayment', error);

    throw error;
  }
}
