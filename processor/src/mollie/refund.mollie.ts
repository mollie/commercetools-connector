import {
  CancelParameters,
  CreateParameters,
} from '@mollie/api-client/dist/types/src/binders/payments/refunds/parameters';
import { initMollieClient } from '../client/mollie.client';
import { MollieApiError } from '@mollie/api-client';
import { logger } from '../utils/logger.utils';
import CustomError from '../errors/custom.error';
import Refund from '@mollie/api-client/dist/types/src/data/refunds/Refund';

export const createPaymentRefund = async (params: CreateParameters): Promise<Refund> => {
  try {
    return await initMollieClient().paymentRefunds.create(params);
  } catch (error: unknown) {
    let errorMessage;

    if (error instanceof MollieApiError) {
      errorMessage = `createMolliePaymentRefund - error: ${error.message}`;
    } else {
      errorMessage = `createMolliePaymentRefund - Calling Mollie API - Failed to cancel the refund with unknown errors`;
    }

    logger.error({
      message: errorMessage,
      error,
    });

    throw new CustomError(400, errorMessage);
  }
};

export const cancelPaymentRefund = async (refundId: string, params: CancelParameters): Promise<boolean> => {
  try {
    return await initMollieClient().paymentRefunds.cancel(refundId, params);
  } catch (error: unknown) {
    let errorMessage;

    if (error instanceof MollieApiError) {
      errorMessage = `cancelMolliePaymentRefund - error: ${error.message}`;
    } else {
      errorMessage = `cancelMollieRefund - Calling Mollie API - Failed to cancel the refund with unknown errors`;
    }

    logger.error({
      message: errorMessage,
      error,
    });

    throw new CustomError(400, errorMessage);
  }
};
