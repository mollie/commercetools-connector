import { logger } from '../utils/logger.utils';
import { Request, Response } from 'express';
import CustomError from '../errors/custom.error';
import { apiError } from '../api/error.api';
import { formatErrorResponse } from '../errors/mollie.error';
import { createExtensionAndCustomFields, removeExtension } from '../service/connector.service';
import { getProfile } from '../mollie/profile.mollie';

export const healthCheck = async (request: Request, response: Response) => {
  try {
    logger.debug('SCTM - healthCheck - The connector is running healthily.');
    return response.status(200).json('The connector is running healthily.');
  } catch (error) {
    logger.error('SCTM - healthCheck - Unexpected error occurred when processing request', error);
    return apiError(response, formatErrorResponse(error).errors);
  }
};

export const mollieStatus = async (request: Request, response: Response) => {
  try {
    logger.debug('SCTM - mollieStatus - Checking Mollie API status.');
    const profile = await getProfile();
    logger.debug('SCTM - mollieStatus - Mollie API status is functioning.');
    return response.status(200).json({
      mode: profile.mode,
      name: profile.name,
      website: profile.website,
      status: profile.status,
    });
  } catch (error) {
    logger.error('SCTM - healthCheck - Unexpected error occurred when processing request', error);
    return response.status(400).json(error).send();
  }
};

export const install = async (request: Request, response: Response) => {
  const protocol = request.secure ? 'https' : 'http';
  const extensionUrl = `${protocol}://${request.hostname}/processor`;

  if (!extensionUrl) {
    logger.debug('SCTM - install - Missing body parameters {extensionUrl}.');
    return apiError(response, formatErrorResponse(new CustomError(400, 'Missing body parameters.')).errors);
  }

  try {
    await createExtensionAndCustomFields(extensionUrl);
    logger.debug(
      'SCTM - install - The connector was installed successfully with required extensions and custom fields.',
    );
    return response
      .status(200)
      .json('The connector was installed successfully with required extensions and custom fields.');
  } catch (error) {
    logger.error('SCTM - install - Unexpected error occurred when processing request', error);
    return apiError(response, formatErrorResponse(error).errors);
  }
};

export const uninstall = async (request: Request, response: Response) => {
  try {
    await removeExtension();
    logger.debug('SCTM - uninstall - The connector was uninstalled successfully.');
    return response.status(200).json('The connector was uninstalled successfully.');
  } catch (error) {
    logger.error('SCTM - uninstallation - Unexpected error occurred when processing request', error);
    return apiError(response, formatErrorResponse(error).errors);
  }
};
