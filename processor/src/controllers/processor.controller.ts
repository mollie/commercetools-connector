import { apiSuccess } from '../api/success.api';
import { ControllerResponseType } from '../types/controller.types';
import { ExtensionInput } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/extension';
import { logger } from '../utils/logger.utils';
import { Request, Response } from 'express';
import { paymentController } from './payment.controller';
import CustomError from '../errors/custom.error';
import SkipError from '../errors/skip.error';
import { apiError } from '../api/error.api';
import { formatErrorResponse } from '../errors/mollie.error';

/**
 * Exposed service endpoint.
 * - Receives a POST request, parses the action and the controller
 * and returns it to the correct controller. We should be use 3. `Cart`, `Order` and `Payments`
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @returns
 */
export const post = async (request: Request, response: Response) => {
  try {
    const { action, resource }: ExtensionInput = request.body;

    if (!action || !resource) {
      throw new CustomError(400, 'Bad request - Missing body parameters.');
    }

    let data: ControllerResponseType;
    switch (resource.typeId) {
      case 'payment':
        logger.debug('SCTM - Processor - Processing payment requests');
        data = (await paymentController(action, resource)) as ControllerResponseType;
        logger.debug('SCTM - Processor - Finish processing payment requests');
        break;
      default:
        throw new CustomError(500, `Internal Server Error - Resource not recognized. Allowed values are 'payment'.`);
    }

    return apiSuccess(200, response, data?.actions);
  } catch (error) {
    if (error instanceof SkipError) {
      return apiSuccess(200, response, []);
    }
    if (error instanceof CustomError) {
      return apiError(response, error.errors);
    }

    return apiError(response, formatErrorResponse(error).errors);
  }
};
