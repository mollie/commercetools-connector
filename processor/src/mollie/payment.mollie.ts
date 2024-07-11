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

/**
 * Creates a Mollie payment using the provided payment parameters.
 *
 * @param {PaymentCreateParams} paymentParams - The parameters for creating the payment.
 * @return {Promise<Payment>} A promise that resolves to the created Payment object.
 */
export const createMolliePayment = async (paymentParams: PaymentCreateParams): Promise<Payment> => {
  return await initMollieClient().payments.create(paymentParams);
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
