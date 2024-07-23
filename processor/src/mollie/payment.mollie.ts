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
import { GetParameters, CancelParameters } from '@mollie/api-client/dist/types/src/binders/payments/refunds/parameters';
import { logger } from '../utils/logger.utils';

const prefixErrorMessage = `SCTM - Calling Mollie API`;

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
      errorMessage = `${prefixErrorMessage} - createMolliePayment - error: ${error.message}, field: ${error.field}`;
    } else {
      errorMessage = `${prefixErrorMessage} - createMolliePayment - Failed to create payment with unknown errors`;
    }

    logger.error({
      message: errorMessage,
      error,
    });

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
      errorMessage = `${prefixErrorMessage} - getPaymentRefund - error: ${error.message}`;
    } else {
      errorMessage = `${prefixErrorMessage} - getPaymentRefund - Failed to cancel the refund with unknown errors`;
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
      errorMessage = `${prefixErrorMessage} - cancelPaymentRefund - error: ${error.message}`;
    } else {
      errorMessage = `${prefixErrorMessage} - cancelPaymentRefund - Failed to cancel the refund with unknown errors`;
    }

    logger.error({
      message: errorMessage,
      error,
    });

    throw new CustomError(400, errorMessage);
  }
};
