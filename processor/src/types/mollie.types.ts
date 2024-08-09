import { PaymentData } from '@mollie/api-client/dist/types/src/data/payments/data';

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
