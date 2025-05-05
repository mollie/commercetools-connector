import { PaymentData } from '@mollie/api-client/dist/types/data/payments/data';

export type ParsedMethodsRequestType = {
  locale?: string;
  billingCountry?: string;
  includeWallets?: string;
  orderLineCategories?: string;
  issuers?: string;
  pricing?: string;
  sequenceType?: string;
};

export type ApplePaySessionRequest = {
  domain: string;
  validationUrl: string;
};
export enum CustomPaymentMethod {
  blik = 'blik',
}

export type CustomPayment = Readonly<
  Omit<PaymentData, 'method'> & {
    method: CustomPaymentMethod;
  }
>;

export enum SupportedPaymentMethods {
  ideal = 'ideal',
  creditcard = 'creditcard',
  bancontact = 'bancontact',
  banktransfer = 'banktransfer',
  przelewy24 = 'przelewy24',
  kbc = 'kbc',
  blik = 'blik',
  applepay = 'applepay',
  paypal = 'paypal',
  giftcard = 'giftcard',
  klarna = 'klarna',
  trustly = 'trustly',
  bancomatpay = 'bancomatpay',
  mbway = 'mbway',
  multibanco = 'multibanco',
  satispay = 'satispay',
  twint = 'twint',
  paybybank = 'paybybank',
  eps = 'eps',
  alma = 'alma',
  payconiq = 'payconiq',
}
