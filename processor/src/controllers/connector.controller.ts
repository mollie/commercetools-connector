import { apiSuccess } from '../api/success.api';
import { logger } from '../utils/logger.utils';
import { Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { apiError } from '../api/error.api';
import { formatErrorResponse } from '../errors/mollie.error';
import { createExtensionAndCustomFields, removeExtension } from '../service/connector.service';

export const healthCheck = async (request: Request, response: Response) => {
  try {
    logger.debug('SCTM - healthCheck - The connector is running healthily.');
    return apiSuccess(200, response, []);
  } catch (error) {
    logger.error('SCTM - healthCheck - Unexpected error occurred when processing request', error);
    return apiError(response, formatErrorResponse(error).errors);
  }
};

export const install = async (request: Request, response: Response) => {
  const { extensionUrl } = request.body;

  if (!extensionUrl) {
    logger.debug('SCTM - install - Missing body parameters {extensionUrl}.');
    return apiError(response, formatErrorResponse(new CustomError(400, 'Missing body parameters.')).errors);
  }

  try {
    await createExtensionAndCustomFields(extensionUrl);
    logger.debug(
      'SCTM - install - The connector was installed successfully with required extensions and custom fields.',
    );
    return apiSuccess(200, response, []);
  } catch (error) {
    logger.error('SCTM - install - Unexpected error occurred when processing request', error);
    return apiError(response, formatErrorResponse(error).errors);
  }
};

export const uninstall = async (request: Request, response: Response) => {
  try {
    await removeExtension();
    logger.debug('SCTM - uninstall - The connector was uninstalled successfully.');
    return apiSuccess(200, response, []);
  } catch (error) {
    logger.error('SCTM - uninstallation - Unexpected error occurred when processing request', error);
    return apiError(response, formatErrorResponse(error).errors);
  }
};
