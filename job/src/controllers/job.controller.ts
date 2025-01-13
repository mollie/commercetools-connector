import { Request, Response } from 'express';

import CustomError from '../errors/custom.error';
import { getAccessToken } from '../commercetools/auth.commercetools';
import { updatePaymentExtension } from '../commercetools/extensions.commercetools';
import { logger } from '../utils/logger.utils';

/**
 * Exposed job endpoint.
 *
 * @param {Request} _request The express request
 * @param {Response} response The express response
 * @returns
 */
export const post = async (_request: Request, response: Response) => {
  try {
    logger.info('SCTM - job - starting updating access token process');

    const accessToken = await getAccessToken();
    await updatePaymentExtension(accessToken?.access_token as string);

    logger.info('SCTM - job - end process');

    response.status(200).send();
  } catch (error) {
    throw new CustomError(
      500,
      `Internal Server Error - Error retrieving all orders from the commercetools SDK`
    );
  }
};
