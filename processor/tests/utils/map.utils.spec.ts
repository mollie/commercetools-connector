import { describe, test, expect, it } from '@jest/globals';
import {
  createMollieCreatePaymentParams,
  mapCommercetoolsPaymentCustomFieldsToMollieListParams,
} from '../../src/utils/map.utils';
import { Payment } from '@commercetools/platform-sdk';
import { MethodsListParams, PaymentCreateParams, PaymentMethod } from '@mollie/api-client';
import { makeMollieAmount } from '../../src/utils/mollie.utils';

describe('Test map.utils.ts', () => {
  let mockCtPayment: Payment;
  let mockMolObject: MethodsListParams;
  test('call mapCommercetoolsPaymentCustomFieldsToMollieListParams()', async () => {
    mockCtPayment = {
      amountPlanned: {
        currencyCode: 'EUR',
        centAmount: 1000,
        fractionDigits: 2,
        type: 'centPrecision',
      },
      custom: {
        fields: {
          sctm_payment_methods_request: {
            sequenceType: 'oneoff',
            locale: 'de_DE',
            billingCountry: 'DE',
            resouce: 'payments',
            includeWallets: 'momo',
            orderLineCategories: 'demo,test,sandbox',
          },
        },
      },
    } as unknown as Payment;

    mockMolObject = {
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
      resource: 'payments',
      sequenceType: 'oneoff',
      locale: 'de_DE',
      billingCountry: 'DE',
      includeWallets: 'momo',
      orderLineCategories: 'demo,test,sandbox',
    } as unknown as MethodsListParams;

    const response = await mapCommercetoolsPaymentCustomFieldsToMollieListParams(mockCtPayment);

    expect(mapCommercetoolsPaymentCustomFieldsToMollieListParams).toBeDefined();
    expect(response).toBeDefined();
    expect(response).toStrictEqual(mockMolObject);
  });
});

describe('createMollieCreatePaymentParams', () => {
  it('should able to create a mollie payment params from CommerceTools payment object for with method as creditcard', async () => {
    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 1000,
        fractionDigits: 2,
      },
      paymentStatus: {},
      transactions: [],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'creditcard',
      },
    };
    const extensionUrl = 'https://example.com/webhook';

    const mollieCreatePaymentParams = createMollieCreatePaymentParams(CTPayment, extensionUrl);
    const mollieAmount = makeMollieAmount(CTPayment.amountPlanned);

    expect(mollieCreatePaymentParams).toEqual({
      method: CTPayment.paymentMethodInfo.method,
      amount: {
        currency: mollieAmount.currency,
        value: mollieAmount.value,
      },
      webhookUrl: extensionUrl,
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as creditcard which has custom field', async () => {
    const customFieldObject = {
      description: 'Test payment',
      locale: 'en_GB',
      redirectUrl: 'https://example.com/success',
      webhookUrl: 'https://example.com/webhook',
      cardToken: 'card_token_12345',
    };

    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 1000,
        fractionDigits: 2,
      },
      paymentStatus: {},
      transactions: [],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'creditcard',
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm_payment',
        },
        fields: {
          sctm_create_payment_request: JSON.stringify(customFieldObject),
        },
      },
    };
    const extensionUrl = 'https://example.com/webhook';

    const mollieCreatePaymentParams = createMollieCreatePaymentParams(CTPayment, extensionUrl);

    expect(mollieCreatePaymentParams).toEqual({
      method: 'creditcard',
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
      locale: customFieldObject.locale,
      redirectUrl: customFieldObject.redirectUrl,
      webhookUrl: extensionUrl, // Always use our default webhook endpoint
      description: customFieldObject.description,
      cardToken: customFieldObject.cardToken,
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as ideal', async () => {
    const customFieldObject = {
      description: 'Test payment',
      locale: 'en_GB',
      redirectUrl: 'https://example.com/success',
      include: {
        'details.qrCode': {
          width: 100,
          height: 100,
          src: 'qr_code_url',
        },
      },
    };

    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 1000,
        fractionDigits: 2,
      },
      paymentStatus: {},
      transactions: [],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: PaymentMethod.ideal + ',ideal_TEST',
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm_payment',
        },
        fields: {
          sctm_create_payment_request: JSON.stringify(customFieldObject),
        },
      },
    };
    const extensionUrl = 'https://example.com/webhook';

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(CTPayment, extensionUrl);
    expect(mollieCreatePaymentParams).toEqual({
      method: PaymentMethod.ideal,
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
      locale: customFieldObject.locale,
      redirectUrl: customFieldObject.redirectUrl,
      webhookUrl: extensionUrl,
      description: customFieldObject.description,
      issuer: 'ideal_TEST',
      include: customFieldObject.include,
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as bancontact', async () => {
    const customFieldObject = {
      description: 'Test payment',
      locale: 'en_GB',
      redirectUrl: 'https://example.com/success',
      webhookUrl: 'https://example.com/webhook',
      include: {
        'details.qrCode': {
          width: 100,
          height: 100,
          src: 'qr_code_url',
        },
      },
    };

    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 1000,
        fractionDigits: 2,
      },
      paymentStatus: {},
      transactions: [],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: PaymentMethod.bancontact,
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm_payment',
        },
        fields: {
          sctm_create_payment_request: JSON.stringify(customFieldObject),
        },
      },
    };
    const extensionUrl = 'https://example.com/webhook';

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(CTPayment, extensionUrl);
    expect(mollieCreatePaymentParams).toEqual({
      method: PaymentMethod.bancontact,
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
      locale: customFieldObject.locale,
      redirectUrl: customFieldObject.redirectUrl,
      webhookUrl: extensionUrl,
      description: customFieldObject.description,
      include: customFieldObject.include,
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as banktransfer', async () => {
    const customFieldObject = {
      description: 'Test payment',
      locale: 'en_GB',
      redirectUrl: 'https://example.com/success',
      webhookUrl: 'https://example.com/webhook',
      dueDate: '2024-01-01',
      billingEmail: 'test@mollie.com',
    };

    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 1000,
        fractionDigits: 2,
      },
      paymentStatus: {},
      transactions: [],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: PaymentMethod.banktransfer,
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm_payment',
        },
        fields: {
          sctm_create_payment_request: JSON.stringify(customFieldObject),
        },
      },
    };
    const extensionUrl = 'https://example.com/webhook';

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(CTPayment, extensionUrl);
    expect(mollieCreatePaymentParams).toEqual({
      method: PaymentMethod.banktransfer,
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
      locale: customFieldObject.locale,
      redirectUrl: customFieldObject.redirectUrl,
      webhookUrl: extensionUrl,
      description: customFieldObject.description,
      dueDate: customFieldObject.dueDate,
      billingEmail: customFieldObject.billingEmail,
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as przelewy24', async () => {
    const customFieldObject = {
      description: 'Test payment',
      locale: 'en_GB',
      redirectUrl: 'https://example.com/success',
      webhookUrl: 'https://example.com/webhook',
      billingEmail: 'test@mollie.com',
    };

    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 1000,
        fractionDigits: 2,
      },
      paymentStatus: {},
      transactions: [],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: PaymentMethod.przelewy24,
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm_payment',
        },
        fields: {
          sctm_create_payment_request: JSON.stringify(customFieldObject),
        },
      },
    };
    const extensionUrl = 'https://example.com/webhook';

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(CTPayment, extensionUrl);
    expect(mollieCreatePaymentParams).toEqual({
      method: PaymentMethod.przelewy24,
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
      locale: customFieldObject.locale,
      redirectUrl: customFieldObject.redirectUrl,
      webhookUrl: extensionUrl,
      description: customFieldObject.description,
      billingEmail: customFieldObject.billingEmail,
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as kbc', async () => {
    const customFieldObject = {
      description: 'Test payment',
      locale: 'en_GB',
      redirectUrl: 'https://example.com/success',
      webhookUrl: 'https://example.com/webhook',
    };

    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 1000,
        fractionDigits: 2,
      },
      paymentStatus: {},
      transactions: [],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: PaymentMethod.kbc,
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm_payment',
        },
        fields: {
          sctm_create_payment_request: JSON.stringify(customFieldObject),
        },
      },
    };
    const extensionUrl = 'https://example.com/webhook';

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(CTPayment, extensionUrl);
    expect(mollieCreatePaymentParams).toEqual({
      method: PaymentMethod.kbc,
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
      locale: customFieldObject.locale,
      redirectUrl: customFieldObject.redirectUrl,
      webhookUrl: extensionUrl,
      description: customFieldObject.description,
    });
  });

  // it('should able to create a mollie payment params from CommerceTools payment object with method as blik', () => {
  //   const customFieldObject = {
  //     description: 'Test payment',
  //     locale: 'en_GB',
  //     redirectUrl: 'https://example.com/success',
  //     webhookUrl: 'https://example.com/webhook',
  //   };

  //   const CTPayment: Payment = {
  //     id: '5c8b0375-305a-4f19-ae8e-07806b101999',
  //     version: 1,
  //     createdAt: '2024-07-04T14:07:35.625Z',
  //     lastModifiedAt: '2024-07-04T14:07:35.625Z',
  //     amountPlanned: {
  //       type: 'centPrecision',
  //       currencyCode: 'EUR',
  //       centAmount: 1000,
  //       fractionDigits: 2,
  //     },
  //     paymentStatus: {},
  //     transactions: [],
  //     interfaceInteractions: [],
  //     paymentMethodInfo: {
  //       method: PaymentMethod.przelewy24,
  //     },
  //     custom: {
  //       type: {
  //         typeId: 'type',
  //         id: 'sctm_payment',
  //       },
  //       fields: {
  //         sctm_create_payment_request: JSON.stringify(customFieldObject),
  //       },
  //     },
  //   };

  //   const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(CTPayment);
  //   expect(mollieCreatePaymentParams).toEqual({
  //     method: PaymentMethod.bl,
  //     amount: {
  //       currency: 'EUR',
  //       value: '10.00',
  //     },
  //     locale: customFieldObject.locale,
  //     redirectUrl: customFieldObject.redirectUrl,
  //     webhookUrl: customFieldObject.webhookUrl,
  //     description: customFieldObject.description,
  //   });
  // });

  it('should able to create a mollie payment params from CommerceTools payment object with method as applepay', async () => {
    const customFieldObject = {
      description: 'Test payment',
      locale: 'en_GB',
      redirectUrl: 'https://example.com/success',
      webhookUrl: 'https://example.com/webhook',
      applePayPaymentToken: '{"paymentData": {"version": "EC_v1", "data": "vK3BbrCbI/...."}}',
    };

    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 1000,
        fractionDigits: 2,
      },
      paymentStatus: {},
      transactions: [],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: PaymentMethod.applepay,
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm_payment',
        },
        fields: {
          sctm_create_payment_request: JSON.stringify(customFieldObject),
        },
      },
    };
    const extensionUrl = 'https://example.com/webhook';

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(CTPayment, extensionUrl);
    expect(mollieCreatePaymentParams).toEqual({
      method: PaymentMethod.applepay,
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
      locale: customFieldObject.locale,
      redirectUrl: customFieldObject.redirectUrl,
      webhookUrl: extensionUrl,
      description: customFieldObject.description,
      applePayPaymentToken: customFieldObject.applePayPaymentToken,
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as paypal', async () => {
    const customFieldObject = {
      description: 'Test payment',
      locale: 'en_GB',
      redirectUrl: 'https://example.com/success',
      webhookUrl: 'https://example.com/webhook',
      sessionId: '12345',
      digitalGoods: true,
    };

    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 1000,
        fractionDigits: 2,
      },
      paymentStatus: {},
      transactions: [],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: PaymentMethod.paypal,
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm_payment',
        },
        fields: {
          sctm_create_payment_request: JSON.stringify(customFieldObject),
        },
      },
    };
    const extensionUrl = 'https://example.com/webhook';

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(CTPayment, extensionUrl);
    expect(mollieCreatePaymentParams).toEqual({
      method: PaymentMethod.paypal,
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
      locale: customFieldObject.locale,
      redirectUrl: customFieldObject.redirectUrl,
      webhookUrl: extensionUrl,
      description: customFieldObject.description,
      sessionId: customFieldObject.sessionId,
      digitalGoods: customFieldObject.digitalGoods,
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as giftcard', async () => {
    const customFieldObject = {
      description: 'Test payment',
      locale: 'en_GB',
      redirectUrl: 'https://example.com/success',
      webhookUrl: 'https://example.com/webhook',
      voucherNumber: '12345',
      voucherPin: '9999',
    };

    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 1000,
        fractionDigits: 2,
      },
      paymentStatus: {},
      transactions: [],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: PaymentMethod.giftcard,
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm_payment',
        },
        fields: {
          sctm_create_payment_request: JSON.stringify(customFieldObject),
        },
      },
    };
    const extensionUrl = 'https://example.com/webhook';

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(CTPayment, extensionUrl);
    expect(mollieCreatePaymentParams).toEqual({
      method: PaymentMethod.giftcard,
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
      locale: customFieldObject.locale,
      redirectUrl: customFieldObject.redirectUrl,
      webhookUrl: extensionUrl,
      description: customFieldObject.description,
      voucherNumber: customFieldObject.voucherNumber,
      voucherPin: customFieldObject.voucherPin,
    });
  });
});
