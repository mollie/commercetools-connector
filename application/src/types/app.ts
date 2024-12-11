export type MollieMethod = {
  resource: string;
  description: string;
  id: string;
  image: {
    svg: string;
    size1x: string;
    size2x: string;
  };
  maximumAmount: {
    value: string;
    currency: string;
  };
  minimumAmount: {
    value: string;
    currency: string;
  };
  pricing: {
    value: string;
    currency: string;
  }[];
  status: string;
  _links: {
    self: {
      href: string;
      type: string;
    };
  };
};

export type CustomMethodObject = {
  id: string;
  technicalName: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  imageUrl: string;
  status: string;
  displayOrder?: number;
  pricingConstraints?: TPricingConstraintItem[];
};

export type TPricingConstraintItem = {
  id?: number | string;
  currencyCode: string;
  countryCode: string;
  minAmount: number;
  maxAmount: number;
  surchargeCost?: string;
};

export type MollieResult = {
  _embedded: {
    methods: MollieMethod[];
  };
};

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
}
