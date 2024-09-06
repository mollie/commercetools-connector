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
import { createPaymentExtension, deletePaymentExtension } from '../commercetools/extensions.commercetools';
import {
  createCustomPaymentInterfaceInteractionType,
  createCustomPaymentTransactionCancelReasonType,
  createCustomPaymentType,
} from '../commercetools/customFields.commercetools';

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

    if (resource.typeId === 'payment') {
      logger.debug('SCTM - Processor - Processing payment requests');
      data = await paymentController(action, resource);
      logger.debug('SCTM - Processor - Finish processing payment requests');
    } else {
      logger.debug(`SCTM - Processor - Internal Server Error - Resource not recognized. Allowed values are 'payment'.`);
      throw new CustomError(500, `Internal Server Error - Resource not recognized. Allowed values are 'payment'.`);
    }

    return apiSuccess(200, response, data?.actions);
  } catch (error) {
    if (error instanceof SkipError) {
      logger.debug('SCTM - Processor - Skip action', error.message);

      return apiSuccess(200, response, []);
    }
    if (error instanceof CustomError) {
      logger.debug('SCTM - Processor - Error occurred when processing request', error);

      return apiError(response, error.errors);
    }

    logger.debug('SCTM - Processor - Unexpected error occurred when processing request', error);

    return apiError(response, formatErrorResponse(error).errors);
  }
};

/**
 * Exposed service endpoint.
 * - Creates the Mollie payment extension, CustomPaymentType, CustomPaymentInterfaceInteractionType and CustomPaymentTransactionCancelReasonType.
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @returns
 */
export const installation = async (request: Request, response: Response) => {
  const { extensionUrl } = request.body;

  if (!extensionUrl) {
    logger.debug('SCTM - installation - Missing body parameters {extensionUrl}.');
    return apiError(response, formatErrorResponse(new CustomError(400, 'Missing body parameters.')).errors);
  }

  try {
    await createPaymentExtension(extensionUrl);
    await createCustomPaymentType();
    await createCustomPaymentInterfaceInteractionType();
    await createCustomPaymentTransactionCancelReasonType();
    logger.debug('SCTM - installation - Finish processing installation requests');
    return apiSuccess(200, response, []);
  } catch (error) {
    logger.debug('SCTM - installation - Unexpected error occurred when processing request', error);
    return apiError(response, formatErrorResponse(error).errors);
  }
};

export const uninstallation = async (request: Request, response: Response) => {
  try {
    deletePaymentExtension();
    return apiSuccess(200, response, []);
  } catch (error) {
    logger.debug('SCTM - uninstallation - Unexpected error occurred when processing request', error);
    return apiError(response, formatErrorResponse(error).errors);
  }
};
