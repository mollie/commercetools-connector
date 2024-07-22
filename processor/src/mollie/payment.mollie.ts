import {
  List,
  Method,
  MethodsListParams,
  MollieApiError,
  Payment,
  PaymentCreateParams,
  PaymentEmbed,
} from '@mollie/api-client';
import { initMollieClient } from '../client/mollie.client';
import CustomError from '../errors/custom.error';
import { CancelParameters } from '@mollie/api-client/dist/types/src/binders/payments/refunds/parameters';
import { logger } from '../utils/logger.utils';

/**
 * Creates a Mollie payment using the provided payment parameters.
 *
 * @param {PaymentCreateParams} paymentParams - The parameters for creating the payment.
 * @return {Promise<Payment>} A promise that resolves to the created Payment object.
 */
export const createMolliePayment = async (paymentParams: PaymentCreateParams): Promise<Payment> => {
  try {
    return await initMollieClient().payments.create(paymentParams);
  } catch (error: unknown) {
    let errorMessage;

    if (error instanceof MollieApiError) {
      errorMessage = `SCTM - createMolliePayment - error: ${error.message}, field: ${error.field}`;
    } else {
      errorMessage = 'SCTM - createMolliePayment - Failed to create payment with unknown errors';
    }

    throw new CustomError(400, errorMessage);
  }
};

/**
 * Retrieves a Mollie payment by its ID.
 *
 * @param {string} paymentId - The ID of the payment to retrieve.
 * @return {Promise<Payment>} A promise that resolves to the retrieved Payment object.
 */
export const getPaymentById = async (paymentId: string): Promise<Payment> => {
  return await initMollieClient().payments.get(paymentId, { embed: [PaymentEmbed.refunds, PaymentEmbed.chargebacks] });
};

/**
 * Retrieves a list of payment methods using the provided options.
 *
 * @param {MethodsListParams} options - The parameters for listing payment methods.
 * @return {Promise<List<Method>>} A promise that resolves to the list of payment methods.
 */
export const listPaymentMethods = async (options: MethodsListParams): Promise<List<Method>> => {
  try {
    return await initMollieClient().methods.list(options);
  } catch (error: unknown) {
    if (error instanceof MollieApiError) {
      throw new CustomError(error.statusCode ?? 400, error.message);
    }

    return {} as List<Method>;
  }
};

export const cancelPaymentRefund = async (refundId: string, params: CancelParameters): Promise<boolean> => {
  try {
    return await initMollieClient().paymentRefunds.cancel(refundId, params);
  } catch (error: unknown) {
    let errorMessage;
    if (error instanceof MollieApiError) {
      errorMessage = `SCTM - cancelPaymentRefund - error: ${error.message}`;
    } else {
      errorMessage = 'SCTM - cancelPaymentRefund - Failed to cancel the refund with unknown errors';
    }

    logger.error(errorMessage);

    throw new CustomError(400, errorMessage);
  }
};
