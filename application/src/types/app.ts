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
    description: string;
    fixed: {
      value: string;
      currency: string;
    };
    variable: string;
    feeRegion?: string;
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

export const GooglePay = {
  resource: 'method',
  id: 'googlepay',
  description: 'Google Pay',
  minimumAmount: {
    value: '0.01',
    currency: 'EUR',
  },
  maximumAmount: {
    value: '10000.00',
    currency: 'EUR',
  },
  image: {
    size1x:
      'https://www.mollie.com/external/icons/payment-methods/googlepay.png',
    size2x:
      'https://www.mollie.com/external/icons/payment-methods/googlepay%402x.png',
    svg: 'https://www.mollie.com/external/icons/payment-methods/googlepay.svg',
  },
  status: 'activated',
  pricing: [
    {
      description: 'American Express (intra-EEA)',
      fixed: {
        value: '0.25',
        currency: 'EUR',
      },
      variable: '2.9',
      feeRegion: 'amex-intra-eea',
    },
    {
      description: 'Commercial & non-European cards',
      fixed: {
        value: '0.25',
        currency: 'EUR',
      },
      variable: '3.25',
      feeRegion: 'other',
    },
    {
      description: 'Domestic consumer cards',
      fixed: {
        value: '0.25',
        currency: 'EUR',
      },
      variable: '1.8',
      feeRegion: 'domestic',
    },
    {
      description: 'European commercial cards',
      fixed: {
        value: '0.25',
        currency: 'EUR',
      },
      variable: '2.9',
      feeRegion: 'intra-eu-corporate',
    },
    {
      description: 'European consumer cards',
      fixed: {
        value: '0.25',
        currency: 'EUR',
      },
      variable: '1.8',
      feeRegion: 'eu-cards',
    },
    {
      description: 'Pre-authorization fees',
      fixed: {
        value: '0.00',
        currency: 'EUR',
      },
      variable: '0.12',
    },
  ],
  _links: {
    self: {
      href: 'https://api.mollie.com/v2/methods/googlepay',
      type: 'application/hal+json',
    },
  },
};

export interface CustomObjectUpdaterError {
  message: string;
}
