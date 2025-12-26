import {
  CustomFields,
  MOLLIE_SHIPPING_LINE_DESCRIPTION,
  MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
  MOLLIE_SURCHARGE_LINE_DESCRIPTION,
} from './constant.utils';
import { logger } from './logger.utils';
import { calculateDueDate, makeMollieAmount } from './mollie.utils';
import { CustomPaymentMethod, ParsedMethodsRequestType } from '../types/mollie.types';
import { Cart, CartUpdateAction, Payment, TaxCategoryResourceIdentifier } from '@commercetools/platform-sdk';
import CustomError from '../errors/custom.error';
import { MethodsListParams, PaymentCreateParams, PaymentMethod } from '@mollie/api-client';
import { convertCentToEUR, parseStringToJsonObject, removeEmptyProperties } from './app.utils';
import { addCustomLineItem, removeCustomLineItem } from '../commercetools/action.commercetools';

const extractMethodsRequest = (ctPayment: Payment): ParsedMethodsRequestType | undefined => {
  return parseStringToJsonObject(
    ctPayment?.custom?.fields?.[CustomFields.payment.request],
    CustomFields.payment.request,
    'SCTM - extractMethodsRequest',
    ctPayment.id,
  );
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

const getShippingPrice = (cart: Cart) => {
  if (!cart?.shippingInfo?.price) {
    return null;
  }

  if (cart.shippingInfo.discountedPrice) {
    return {
      centAmount: cart.shippingInfo.discountedPrice.value.centAmount,
      fractionDigits: cart.shippingInfo.discountedPrice.value.fractionDigits,
      currencyCode: cart.shippingInfo.discountedPrice.value.currencyCode,
    };
  }

  return {
    centAmount: cart.shippingInfo.price.centAmount,
    fractionDigits: cart.shippingInfo.price.fractionDigits,
    currencyCode: cart.shippingInfo.price.currencyCode,
  };
};

const createWebhookUrl = (extensionUrl: string): string => {
  return new URL(extensionUrl).origin + '/webhook';
};

const buildBillingAddress = (method: PaymentMethod | CustomPaymentMethod, paymentRequest: any): Record<string, any> => {
  const needsEmailInBillingAddress = method === CustomPaymentMethod.blik || method === PaymentMethod.przelewy24;
  const hasEmailInRequest = paymentRequest.billingEmail && !paymentRequest.billingAddress?.email;

  if (needsEmailInBillingAddress && hasEmailInRequest) {
    return {
      ...paymentRequest.billingAddress,
      email: paymentRequest.billingEmail,
    };
  }

  return paymentRequest.billingAddress ?? {};
};

const getSpecificPaymentParams = (
  method: PaymentMethod | CustomPaymentMethod,
  paymentRequest: any,
  banktransferDueDate: string,
) => {
  switch (method) {
    case PaymentMethod.applepay:
      return paymentRequest.applePayPaymentToken
        ? { applePayPaymentToken: JSON.stringify(paymentRequest.applePayPaymentToken) }
        : {};
    case PaymentMethod.banktransfer:
      return {
        dueDate: calculateDueDate(banktransferDueDate),
      };
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
    default:
      return {};
  }
};

export const createMollieCreatePaymentParams = (
  payment: Payment,
  extensionUrl: string,
  surchargeAmountInCent: number,
  cart: Cart,
  banktransferDueDate?: string,
): PaymentCreateParams => {
  const { amountPlanned, paymentMethodInfo } = payment;
  const [method, issuer] = paymentMethodInfo?.method?.split(',') ?? [null, null];

  const paymentRequest = parseStringToJsonObject(
    payment.custom?.fields?.[CustomFields.createPayment.request],
    CustomFields.createPayment.request,
    'SCTM - PAYMENT PROCESSING',
    payment.id,
  );

  const mollieLines = paymentRequest.lines ?? [];

  if (surchargeAmountInCent > 0) {
    mollieLines.push(
      createMollieLineForAdditionalAmount(
        MOLLIE_SURCHARGE_LINE_DESCRIPTION,
        surchargeAmountInCent,
        amountPlanned.fractionDigits,
        amountPlanned.currencyCode,
      ),
    );
  }

  const shippingPrice = getShippingPrice(cart);
  if (shippingPrice) {
    mollieLines.push(
      createMollieLineForAdditionalAmount(
        MOLLIE_SHIPPING_LINE_DESCRIPTION,
        shippingPrice.centAmount,
        shippingPrice.fractionDigits,
        shippingPrice.currencyCode,
      ),
    );
  }

  const createPaymentParams = {
    amount: makeMollieAmount(amountPlanned, surchargeAmountInCent),
    description: paymentRequest.description ?? '',
    redirectUrl: paymentRequest.redirectUrl ?? null,
    webhookUrl: createWebhookUrl(extensionUrl),
    billingAddress: buildBillingAddress(method as PaymentMethod | CustomPaymentMethod, paymentRequest),
    shippingAddress: paymentRequest.shippingAddress ?? {},
    locale: paymentRequest.locale ?? null,
    method: method as PaymentMethod,
    issuer: issuer ?? '',
    restrictPaymentMethodsToCountry: paymentRequest.restrictPaymentMethodsToCountry ?? null,
    metadata: paymentRequest.metadata ?? null,
    applicationFee: paymentRequest.applicationFee ?? {},
    include: paymentRequest.include ?? '',
    captureMode: paymentRequest.captureMode ?? '',
    lines: mollieLines,
    ...getSpecificPaymentParams(method as PaymentMethod, paymentRequest, banktransferDueDate ?? ''),
  };

  return removeEmptyProperties(createPaymentParams) as PaymentCreateParams;
};

export const createCartUpdateActions = (
  cart: Cart,
  ctPayment: Payment,
  surchargeAmountInCent: number,
): CartUpdateAction[] => {
  const mollieSurchargeCustomLine = cart.customLineItems.find((item) => {
    return item.key === MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM;
  });

  const updateActions: CartUpdateAction[] = [];

  if (mollieSurchargeCustomLine) {
    updateActions.push(removeCustomLineItem(mollieSurchargeCustomLine.id));
  }

  if (surchargeAmountInCent > 0) {
    const name = {
      en: MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
      de: MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
    };

    const money = {
      centAmount: surchargeAmountInCent,
      currencyCode: ctPayment.amountPlanned.currencyCode,
    };

    const slug = MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM;
    const taxCategory = cart.shippingInfo?.taxCategory?.id
      ? ({
          id: cart.shippingInfo.taxCategory?.id,
        } as TaxCategoryResourceIdentifier)
      : undefined;

    updateActions.push(addCustomLineItem(name, 1, money, slug, taxCategory));
  }

  return updateActions;
};

export const createMollieLineForAdditionalAmount = (
  description: string,
  amountInCent: number,
  fractionDigits: number,
  currency: string,
  quantity: number = 1,
  quantityUnit: string = 'pcs',
) => {
  const unitPrice = {
    currency,
    value: convertCentToEUR(amountInCent, fractionDigits).toFixed(2),
  };

  return {
    description,
    quantity,
    quantityUnit,
    unitPrice: unitPrice,
    totalAmount: unitPrice,
  };
};
