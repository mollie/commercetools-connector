import { Cart, CartUpdateAction } from '@commercetools/platform-sdk';
import { createApiRoot } from '../client/create.client';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';

export const getCartFromPayment = async (paymentId: string) => {
  const carts = await createApiRoot()
    .carts()
    .get({
      queryArgs: {
        where: `paymentInfo(payments(id= "${paymentId}"))`,
      },
    })
    .execute();

  const results = carts.body.results;
  if (results.length !== 1) {
    logger.error('There is no cart which attached this target payment');

    throw new CustomError(400, 'There is no cart which attached this target payment');
  }

  logger.info(`Found cart with id ${results[0].id}`);

  return results[0];
};

export const updateCart = async (cart: Cart, updateActions: CartUpdateAction[]) => {
  const response = await createApiRoot()
    .carts()
    .withId({ ID: cart.id })
    .post({
      body: {
        version: cart.version,
        actions: updateActions,
      },
    })
    .execute();

  const { body: cartObject } = response;

  return cartObject;
};
