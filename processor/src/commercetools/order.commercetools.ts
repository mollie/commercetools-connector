import { Order } from '@commercetools/platform-sdk';
import { logger } from '../utils/logger.utils';
import CustomError from '../errors/custom.error';
import { createApiRoot } from '../client/create.client';

export const getOrderByPaymentId = async (paymentId: string): Promise<Order> => {
  const response = await createApiRoot()
    .orders()
    .get({
      queryArgs: {
        where: `paymentInfo(payments(typeId = "payment" and id = "${paymentId}"))`,
      },
    })
    .execute();

  const orders = response.body.results;
  if (orders.length !== 1) {
    const error = new CustomError(400, `Cannot get order by payment ID ${paymentId}`);
    logger.error('getOrderByPaymentId', error);
    throw error;
  }

  logger.info(`Found order with id ${orders[0].id}`);

  return orders[0];
};
