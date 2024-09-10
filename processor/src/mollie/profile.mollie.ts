import { initMollieClient } from '../client/mollie.client';
import { MollieApiError, Profile } from '@mollie/api-client';
import { logger } from '../utils/logger.utils';
import CustomError from '../errors/custom.error';

export const getProfile = async (): Promise<Profile> => {
  try {
    return await initMollieClient().profiles.getCurrent();
  } catch (error) {
    let errorMessage;
    if (error instanceof MollieApiError) {
      errorMessage = `SCTM - getProfile - error: ${error.message}, field: ${error.field}`;
    } else {
      errorMessage = `SCTM - getProfile - Failed to get Mollie profile with unknown errors`;
    }

    logger.error(errorMessage, {
      error,
    });
    throw new CustomError(400, errorMessage);
  }
};
