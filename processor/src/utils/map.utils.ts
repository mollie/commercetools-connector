import { CustomFields } from './constant.utils';
import { logger } from './logger.utils';
import { makeMollieAmount } from './mollie.utils';
import { ParsedMethodsRequestType } from '../types/mollie.types';
import { Payment } from '@commercetools/platform-sdk';
import CustomError from '../errors/custom.error';
import { PaymentCreateParams, MethodsListParams, PaymentMethod } from '@mollie/api-client';

/**
 * Extracts method list parameters from a Commercetools Payment object and returns a Promise resolving to a MethodsListParams object.
 *
 * @param {Payment} ctPayment - The Commercetools Payment object from which to extract the method list parameters.
 * @return {Promise<MethodsListParams>} A Promise resolving to a MethodsListParams object containing the extracted method list parameters.
 * @throws {CustomError} If there is an error parsing the payment methods request field.
 */
export const mapCommercetoolsPaymentCustomFieldsToMollieListParams = async (
  ctPayment: Payment,
): Promise<MethodsListParams> => {
  try {
    const mObject: MethodsListParams = {
      amount: makeMollieAmount(ctPayment.amountPlanned),
      resource: 'payments',
    };

    const parsedMethodsRequest = ctPayment?.custom?.fields?.[CustomFields.payment.request];

    if (!parsedMethodsRequest) {
      logger.debug(
        'SCTM - field {custom.fields.sctm_payment_methods_request} not found. Returning default Mollie object',
        mObject,
      );
      return mObject;
    }

    const {
      locale,
      billingCountry,
      includeWallets,
      orderLineCategories,
      issuers,
      pricing,
      sequenceType,
    }: ParsedMethodsRequestType = parsedMethodsRequest;

    const include = issuers || pricing ? `${issuers ? 'issuers,' : ''}${pricing ? 'pricing' : ''}` : undefined;

    Object.assign(
      mObject,
      locale && { locale: locale },
      include && { include: include },
      includeWallets && { includeWallets: includeWallets },
      billingCountry && { billingCountry: billingCountry },
      sequenceType && { sequenceType: sequenceType },
      orderLineCategories && { orderLineCategories: orderLineCategories },
    );

    return Promise.resolve(mObject);
  } catch (error: unknown) {
    logger.error('SCTM - PARSING ERROR - field {custom.fields.sctm_payment_methods_request}');
    return Promise.reject(
      new CustomError(400, 'SCTM - PARSING ERROR - field {custom.fields.sctm_payment_methods_request}'),
    );
  }
};

/**
 * Creates Mollie Payment parameters based on the CommerceTools Payment object.
 *
 * @param {Payment} payment - The CommerceTools Payment object to extract payment parameters from.
 * @return {PaymentCreateParams} - The payment parameters for creating a payment.
 */
export const createMollieCreatePaymentParams = (payment: Payment): PaymentCreateParams => {
  const { amountPlanned, paymentMethodInfo, custom } = payment;

  const [method, issuer] = paymentMethodInfo?.method?.split(',') ?? [null, null];

  const requestCustomField = custom?.fields?.[CustomFields.createPayment.request];

  const paymentRequest = requestCustomField ? JSON.parse(requestCustomField) : {};

  const defaultWebhookEndpoint = new URL(process.env.CONNECT_SERVICE_URL ?? '').origin + '/webhook';

  let specificParam;
  switch (method) {
    case PaymentMethod.creditcard:
      specificParam = {
        cardToken: paymentRequest.cardToken ?? '',
      };
      break;
    default:
      break;
  }

  const molliePaymentParams: PaymentCreateParams = {
    description: paymentRequest.description ?? '',
    amount: makeMollieAmount(amountPlanned),
    redirectUrl: paymentRequest.redirectUrl ?? null,
    webhookUrl: paymentRequest.webhookUrl ?? defaultWebhookEndpoint,
    billingAddress: paymentRequest.billingAddress ?? {},
    shippingAddress: paymentRequest.shippingAddress ?? {},
    locale: paymentRequest.locale ?? null,
    method: method as PaymentMethod,
    issuer: issuer ?? '',
    restrictPaymentMethodsToCountry: paymentRequest.restrictPaymentMethodsToCountry ?? null,
    metadata: paymentRequest.metadata ?? null,
    // captureMode: paymentRequest.captureMode ?? null, PICT-204 is on hold
    // captureDelay: paymentRequest.captureMode ?? null, PICT-204 is on hold
    applicationFee: paymentRequest.applicationFee ?? {},
    profileId: paymentRequest.profileId ?? null,
    testmode: paymentRequest.testmode ?? null,
    ...specificParam,
  };

  return molliePaymentParams;
};
