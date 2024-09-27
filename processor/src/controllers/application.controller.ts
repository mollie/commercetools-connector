import { Request, Response } from 'express';
import { apiError } from '../api/error.api';
import { formatErrorResponse } from '../errors/mollie.error';
import { listPaymentMethods } from '../mollie/payment.mollie';
import { Locale, MethodInclude } from '@mollie/api-client';
import { logger } from '../utils/logger.utils';

export const getMethods = async (request: Request, response: Response) => {
  try {
    logger.debug('getMethods - Prepare payment methods for the custom application.');
    const methods = await listPaymentMethods({
      locale: Locale.en_US,
      include: [MethodInclude.pricing, MethodInclude.issuers],
    });

    return response.status(200).json(methods);
  } catch (error) {
    return apiError(response, formatErrorResponse(error).errors);
  }
};
