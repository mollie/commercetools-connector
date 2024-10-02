import { Request, Response } from 'express';
import { apiError } from '../api/error.api';
import { formatErrorResponse } from '../errors/mollie.error';
import { getAllPaymentMethods } from '../mollie/payment.mollie';
import { List, Locale, Method, MethodInclude } from '@mollie/api-client';
import { logger } from '../utils/logger.utils';

export const getMethods = async (request: Request, response: Response) => {
  try {
    logger.debug('getMethods - Prepare payment methods for the custom application.');
    const data: List<Method> = await getAllPaymentMethods({
      locale: Locale.en_US,
      include: MethodInclude.pricing,
    });

    return response.status(200).json(data);
  } catch (error) {
    logger.error(
      `getMethods - Unexpected error occurred when preparing payment methods for the custom application`,
      error,
    );
    return apiError(response, formatErrorResponse(error).errors);
  }
};
