import {
  Capture,
  Method,
  MethodsListParams,
  MollieApiError,
  Payment,
  PaymentCreateParams,
  PaymentEmbed,
} from '@mollie/api-client';
import { initMollieClient, initMollieClientForApplePaySession } from '../client/mollie.client';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { ApplePaySessionRequest, CustomPayment } from '../types/mollie.types';
import { getApiKey } from '../utils/config.utils';
import { MOLLIE_VERSION_STRINGS } from '../utils/constant.utils';
import fetch from 'node-fetch';
import ApplePaySession from '@mollie/api-client/dist/types/data/applePaySession/ApplePaySession';
import { CreateParameters } from '@mollie/api-client/dist/types/binders/payments/captures/parameters';

const HEADER = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getApiKey()}`,
  versionStrings: MOLLIE_VERSION_STRINGS,
};

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
 * @return {Promise<Method[]>} A promise that resolves to the list of payment methods.
 */
export const listPaymentMethods = async (options: MethodsListParams): Promise<Method[]> => {
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
  let errorMessage;

  try {
    const response = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: HEADER,
      body: JSON.stringify(paymentParams),
    });

    const data = await response.json();

    if (response.status !== 201) {
      if (response.status === 422 || response.status === 503) {
        errorMessage = `SCTM - createPaymentWithCustomMethod - error: ${data?.detail}, field: ${data?.field}`;
      } else {
        errorMessage = 'SCTM - createPaymentWithCustomMethod - Failed to create a payment with unknown errors';
      }

      logger.error(errorMessage, {
        response: data,
      });

      throw new CustomError(400, errorMessage);
    }

    return data;
  } catch (error: unknown) {
    if (!errorMessage) {
      errorMessage = 'SCTM - createPaymentWithCustomMethod - Failed to create a payment with unknown errors';
      logger.error(errorMessage, {
        error,
      });
    }

    throw new CustomError(400, errorMessage);
  }
};

export const getAllPaymentMethods = async (options: MethodsListParams): Promise<Method[]> => {
  let errorMessage;

  try {
    const queryParams = new URLSearchParams(options as any).toString();
    const url = `https://api.mollie.com/v2/methods/all?${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: HEADER,
    });

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    if (!errorMessage) {
      errorMessage = 'SCTM - getAllPaymentMethods - Failed to get all payment methods with unknown errors';
      logger.error(errorMessage, {
        error,
      });
    }

    throw new CustomError(400, errorMessage);
  }
};

export const getApplePaySession = async (options: ApplePaySessionRequest): Promise<ApplePaySession> => {
  try {
    return await initMollieClientForApplePaySession().applePay.requestPaymentSession(options);
  } catch (error: unknown) {
    let errorMessage;
    if (error instanceof MollieApiError) {
      errorMessage = `SCTM - getApplePaySession - error: ${error.message}, field: ${error.field}`;
    } else {
      errorMessage = `SCTM - getApplePaySession - Failed to get ApplePay session with unknown errors`;
    }

    logger.error(errorMessage, {
      error,
    });
    throw new CustomError(400, errorMessage);
  }
};

export const createCapturePayment = async (options: CreateParameters): Promise<Capture | CustomError> => {
  try {
    return await initMollieClient().paymentCaptures.create(options);
  } catch (error: unknown) {
    let errorMessage;
    if (error instanceof MollieApiError) {
      errorMessage = `SCTM - createCapturePayment - error: ${error.message}, field: ${error.field}`;
    } else {
      errorMessage = `SCTM - createCapturePayment - Failed to create capture payment with unknown errors`;
    }

    logger.error(errorMessage, {
      error,
    });
    return new CustomError(400, errorMessage);
  }
};

export const releaseAuthorizationPayment = async (molliePaymentId: string): Promise<void> => {
  try {
    const response = await fetch(`https://api.mollie.com/v2/payments/${molliePaymentId}/release-authorization`, {
      method: 'POST',
      headers: HEADER,
    });

    if (response.status === 202) {
      logger.debug(
        `SCTM - releaseAuthorizationPayment - Authorization payment released successfully for payment ${molliePaymentId}`,
      );
    }
    return;
  } catch (error: unknown) {
    let errorMessage;

    if (error instanceof MollieApiError) {
      errorMessage = `SCTM - releaseAuthorizationPayment - error: ${error.message}`;
    } else {
      errorMessage = `SCTM - releaseAuthorizationPayment - Failed to release authorization payment with unknown errors`;
    }

    logger.error(errorMessage, {
      error,
    });
    throw new CustomError(400, errorMessage);
  }
};
