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
