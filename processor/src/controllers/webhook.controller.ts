import CustomError from '../errors/custom.error';
import { handlePaymentWebhook } from '../service/payment.service';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.utils';
import { isPayment } from '../utils/mollie.utils';
import { WebhookRequest } from '../types/commercetools.types';

/**
 * Exposed event POST endpoint.
 * Receives the Pub/Sub message and works with it
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @param {NextFunction} next
 * @returns
 */
export const post = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.body as unknown as WebhookRequest;
    if (!isPayment(id)) {
      logger.warn(`Webhook with id ${id} is not a payment event.`);

      response.status(200).send();

      return;
    }

    await handlePaymentWebhook(id);

    logger.info(`Webhook with id ${id} is handled successfully.`);

    response.status(200).send();
  } catch (error) {
    logger.error(`Error processing webhook event`, error);

    if (error instanceof Error) {
      next(new CustomError(400, error.message));
    } else {
      next(error);
    }
  }
};
