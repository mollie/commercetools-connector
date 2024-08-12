import { CustomFields } from './constant.utils';
import { logger } from './logger.utils';
import { calculateDueDate, makeMollieAmount } from './mollie.utils';
import { CustomPaymentMethod, ParsedMethodsRequestType } from '../types/mollie.types';
import { Payment } from '@commercetools/platform-sdk';
import CustomError from '../errors/custom.error';
import { MethodsListParams, PaymentCreateParams, PaymentMethod } from '@mollie/api-client';
import { parseStringToJsonObject, removeEmptyProperties } from './app.utils';
import { readConfiguration } from './config.utils';

const extractMethodsRequest = (ctPayment: Payment): ParsedMethodsRequestType | undefined => {
  return ctPayment?.custom?.fields?.[CustomFields.payment.request];
};

const buildMethodsListParams = (parsedMethodsRequest: ParsedMethodsRequestType): Partial<MethodsListParams> => {
  const { locale, billingCountry, includeWallets, orderLineCategories, issuers, pricing, sequenceType } =
    parsedMethodsRequest;

  const include = [issuers ? 'issuers' : '', pricing ? 'pricing' : ''].filter(Boolean).join(',');

  return {
    locale,
    billingCountry,
    includeWallets,
    sequenceType,
    orderLineCategories,
    ...(include && { include }),
  } as MethodsListParams;
};

export const mapCommercetoolsPaymentCustomFieldsToMollieListParams = async (
  ctPayment: Payment,
): Promise<MethodsListParams> => {
  try {
    const baseParams: MethodsListParams = {
      amount: makeMollieAmount(ctPayment.amountPlanned),
      resource: 'payments',
    };

    const parsedMethodsRequest = extractMethodsRequest(ctPayment);

    if (!parsedMethodsRequest) {
      logger.debug(
        'SCTM - field {custom.fields.sctm_payment_methods_request} not found. Returning default Mollie object',
        {
          ...baseParams,
          commerceToolsPaymentId: ctPayment.id,
        },
      );
      return baseParams;
    }

    return {
      ...baseParams,
      ...buildMethodsListParams(parsedMethodsRequest),
    };
  } catch (error: unknown) {
    logger.error(
      `SCTM - PARSING ERROR - field {custom.fields.sctm_payment_methods_request}, CommerceTools Payment ID: ${ctPayment.id}`,
      {
        commerceToolsPaymentId: ctPayment.id,
        error,
      },
    );
    throw new CustomError(400, 'SCTM - PARSING ERROR - field {custom.fields.sctm_payment_methods_request}');
  }
};

const getSpecificPaymentParams = (method: PaymentMethod | CustomPaymentMethod, paymentRequest: any) => {
  switch (method) {
    case PaymentMethod.applepay:
      return { applePayPaymentToken: paymentRequest.applePayPaymentToken ?? '' };
    case PaymentMethod.banktransfer:
      return {
        dueDate: calculateDueDate(readConfiguration().mollie.bankTransferDueDate),
      };
    case PaymentMethod.przelewy24:
      return { billingEmail: paymentRequest.billingEmail ?? '' };
    case PaymentMethod.paypal:
      return {
        sessionId: paymentRequest.sessionId ?? '',
        digitalGoods: paymentRequest.digitalGoods ?? '',
      };
    case PaymentMethod.giftcard:
      return {
        voucherNumber: paymentRequest.voucherNumber ?? '',
        voucherPin: paymentRequest.voucherPin ?? '',
      };
    case PaymentMethod.creditcard:
      return { cardToken: paymentRequest.cardToken ?? '' };
    case CustomPaymentMethod.blik:
      return {
        billingEmail: paymentRequest.billingEmail ?? '',
      };
    default:
      return {};
  }
};

export const createMollieCreatePaymentParams = (payment: Payment, extensionUrl: string): PaymentCreateParams => {
  const { amountPlanned, paymentMethodInfo } = payment;

  const [method, issuer] = paymentMethodInfo?.method?.split(',') ?? [null, null];
  const paymentRequest = parseStringToJsonObject(
    payment.custom?.fields?.[CustomFields.createPayment.request],
    CustomFields.createPayment.request,
    'SCTM - PAYMENT PROCESSING',
    payment.id,
  );

  const defaultWebhookEndpoint = new URL(extensionUrl).origin + '/webhook';

  const createPaymentParams = {
    amount: makeMollieAmount(amountPlanned),
    description: paymentRequest.description ?? '',
    redirectUrl: paymentRequest.redirectUrl ?? null,
    webhookUrl: defaultWebhookEndpoint,
    billingAddress: paymentRequest.billingAddress ?? {},
    shippingAddress: paymentRequest.shippingAddress ?? {},
    locale: paymentRequest.locale ?? null,
    method: method as PaymentMethod,
    issuer: issuer ?? '',
    restrictPaymentMethodsToCountry: paymentRequest.restrictPaymentMethodsToCountry ?? null,
    metadata: paymentRequest.metadata ?? null,
    applicationFee: paymentRequest.applicationFee ?? {},
    include: paymentRequest.include ?? '',
    captureMode: paymentRequest.captureMode ?? '',
    ...getSpecificPaymentParams(method as PaymentMethod, paymentRequest),
  };

  return removeEmptyProperties(createPaymentParams) as PaymentCreateParams;
};
