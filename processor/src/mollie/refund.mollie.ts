import {
  CancelParameters,
  CreateParameters,
  GetParameters,
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
      errorMessage = `SCTM - createMolliePaymentRefund - Calling Mollie API - error: ${error.message}`;
    } else {
      errorMessage = `SCTM - createMolliePaymentRefund - Calling Mollie API - Failed to create refund with unknown errors`;
    }

    logger.error(errorMessage, {
      paymentId: params.paymentId,
      error,
    });

    throw new CustomError(400, errorMessage);
  }
};

/**
 * Retrieves a payment refund from the Mollie API.
 *
 * @param {string} refundId - The ID of the refund.
 * @param {GetParameters} params - The parameters for the refund.
 * @return {Promise<PaymentRefund>} A promise that resolves to the payment refund.
 * @throws {CustomError} If there is an error retrieving the refund.
 */
export const getPaymentRefund = async (refundId: string, params: GetParameters) => {
  try {
    return await initMollieClient().paymentRefunds.get(refundId, params);
  } catch (error: unknown) {
    let errorMessage;

    if (error instanceof MollieApiError) {
      errorMessage = `getPaymentRefund - error: ${error.message}`;
    } else {
      errorMessage = `getPaymentRefund - Failed to cancel the refund with unknown errors`;
    }

    logger.error({
      message: errorMessage,
      error,
    });

    throw new CustomError(400, errorMessage);
  }
};

/**
 * Cancels a payment refund by its ID using the provided parameters.
 *
 * @param {string} refundId - The ID of the payment refund to cancel.
 * @param {CancelParameters} params - The parameters for cancelling the payment refund.
 * @return {Promise<boolean>} A promise that resolves to true if the payment refund is successfully cancelled, or rejects with an error.
 * @throws {CustomError} If there is an error cancelling the payment refund.
 */
export const cancelPaymentRefund = async (refundId: string, params: CancelParameters): Promise<boolean> => {
  try {
    return await initMollieClient().paymentRefunds.cancel(refundId, params);
  } catch (error: unknown) {
    let errorMessage;

    if (error instanceof MollieApiError) {
      errorMessage = `cancelPaymentRefund - error: ${error.message}`;
    } else {
      errorMessage = `cancelPaymentRefund - Failed to cancel the refund with unknown errors`;
    }

    logger.error(errorMessage, {
      mollieRefundId: refundId,
      molliePaymentId: params.paymentId,
      error,
    });

    throw new CustomError(400, errorMessage);
  }
};
