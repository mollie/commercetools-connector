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
import { logger } from '../utils/logger.utils';
import axios, { AxiosError } from 'axios';
import { readConfiguration } from '../utils/config.utils';
import { LIBRARY_NAME, LIBRARY_VERSION } from '../utils/constant.utils';
import { CustomPayment } from '../types/mollie.types';

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
      errorMessage = `SCTM - createMolliePayment - Failed to create payment with unknown errors`;
    }

    logger.error(errorMessage, {
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
    let errorMessage;
    if (error instanceof MollieApiError) {
      errorMessage = `SCTM - listPaymentMethods - error: ${error.message}, field: ${error.field}`;
    } else {
      errorMessage = `SCTM - listPaymentMethods - Failed to list payments with unknown errors`;
    }

    logger.error(errorMessage, {
      error,
    });

    throw new CustomError(400, errorMessage);
  }
};

export const cancelPayment = async (paymentId: string): Promise<void> => {
  try {
    await initMollieClient().payments.cancel(paymentId);
  } catch (error: unknown) {
    let errorMessage;
    if (error instanceof MollieApiError) {
      errorMessage = `SCTM - cancelPayment - error: ${error.message}, field: ${error.field}`;
    } else if (
      // TODO: This is just a temporary fix while waiting Mollie to update the Client
      // Currently this call returned with status code 202 and an empty response body
      // While the Client expecting some resource there, that's why it failed and throw exception
      error instanceof Error &&
      error.message === 'Received unexpected response from the server with resource undefined'
    ) {
      return;
    } else {
      errorMessage = `SCTM - cancelPayment - Failed to cancel payments with unknown errors`;
    }

    logger.error(errorMessage, {
      error,
    });

    throw new CustomError(400, errorMessage);
  }
};

export const createPaymentWithCustomMethod = async (paymentParams: PaymentCreateParams): Promise<CustomPayment> => {
  try {
    const { mollie } = readConfiguration();

    const headers = {
      Authorization: `Bearer ${mollie.apiKey}`,
      versionStrings: `${LIBRARY_NAME}/${LIBRARY_VERSION}`,
    };

    const response = await axios.post('https://api.mollie.com/v2/payments', paymentParams, { headers });

    return response.data;
  } catch (error: unknown) {
    let errorMessage;

    if (error instanceof AxiosError) {
      errorMessage = `SCTM - createPaymentWithCustomMethod - error: ${error.response?.data?.detail}, field: ${error.response?.data?.field}`;
    } else {
      errorMessage = 'SCTM - createPaymentWithCustomMethod - Failed to create a payment with unknown errors';
    }


    logger.error(errorMessage, {
      error,
    });

    throw new CustomError(400, errorMessage);
  }
};
