import { describe, test, expect, it, jest } from '@jest/globals';
import {
  createCartUpdateActions,
  createMollieCreatePaymentParams,
  createMollieLineForAdditionalAmount,
  mapCommercetoolsPaymentCustomFieldsToMollieListParams,
} from '../../src/utils/map.utils';
import { Cart, Payment } from '@commercetools/platform-sdk';
import { MethodsListParams, PaymentCreateParams, PaymentMethod } from '@mollie/api-client';
import {
  MOLLIE_SHIPPING_LINE_DESCRIPTION,
  MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
  MOLLIE_SURCHARGE_LINE_DESCRIPTION,
} from '../../src/utils/constant.utils';
import { calculateDueDate, makeMollieAmount } from '../../src/utils/mollie.utils';
import { CustomPaymentMethod } from '../../src/types/mollie.types';

jest.mock('../../src/utils/mollie.utils.ts', () => ({
  // @ts-expect-error ignore type error
  ...jest.requireActual('../../src/utils/mollie.utils.ts'),
  // __esModule: true,
  calculateDueDate: jest.fn(),
}));

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
          sctm_payment_methods_request: JSON.stringify({
            sequenceType: 'oneoff',
            locale: 'de_DE',
            billingCountry: 'DE',
            resouce: 'payments',
            includeWallets: 'applepay',
            orderLineCategories: 'demo,test,sandbox',
          }),
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
      includeWallets: 'applepay',
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
    const cart = {
      id: 'cart-test-id',
    } as Cart;

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

    const mollieCreatePaymentParams = createMollieCreatePaymentParams(CTPayment, extensionUrl, 0, cart);
    const mollieAmount = makeMollieAmount(CTPayment.amountPlanned);

    expect(mollieCreatePaymentParams).toEqual({
      method: CTPayment.paymentMethodInfo.method,
      amount: {
        currency: mollieAmount.currency,
        value: mollieAmount.value,
      },
      webhookUrl: extensionUrl,
      lines: [],
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object for with method as creditcard and surcharge amount is not 0', async () => {
    const cart = {
      id: 'cart-test-id',
    } as Cart;

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

    const surchargeAmountInCent = 1000;

    const mollieCreatePaymentParams = createMollieCreatePaymentParams(
      CTPayment,
      extensionUrl,
      surchargeAmountInCent,
      cart,
    );
    const mollieAmount = {
      currency: CTPayment.amountPlanned.currencyCode,
      value: '20.00',
    };

    expect(mollieCreatePaymentParams).toEqual({
      method: CTPayment.paymentMethodInfo.method,
      amount: mollieAmount,
      webhookUrl: extensionUrl,
      lines: [
        {
          description: MOLLIE_SURCHARGE_LINE_DESCRIPTION,
          quantity: 1,
          quantityUnit: 'pcs',
          unitPrice: {
            currency: CTPayment.amountPlanned.currencyCode,
            value: '10.00',
          },
          totalAmount: {
            currency: CTPayment.amountPlanned.currencyCode,
            value: '10.00',
          },
        },
      ],
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as creditcard which has custom field', async () => {
    const cart = {
      id: 'cart-test-id',
    } as Cart;

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

    const mollieCreatePaymentParams = createMollieCreatePaymentParams(CTPayment, extensionUrl, 0, cart);

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
      lines: [],
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as ideal', async () => {
    const cart = {
      id: 'cart-test-id',
    } as Cart;

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

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(
      CTPayment,
      extensionUrl,
      0,
      cart,
    );
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
      lines: [],
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as bancontact', async () => {
    const cart = {
      id: 'cart-test-id',
    } as Cart;

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

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(
      CTPayment,
      extensionUrl,
      0,
      cart,
    );
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
      lines: [],
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as banktransfer', async () => {
    const cart = {
      id: 'cart-test-id',
    } as Cart;

    const customFieldObject = {
      description: 'Test payment',
      locale: 'en_GB',
      redirectUrl: 'https://example.com/success',
      webhookUrl: 'https://example.com/webhook',
      billingAddress: {
        email: 'test@mollie.com',
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

    const dueDate = '2024-01-01';
    (calculateDueDate as jest.Mock).mockReturnValueOnce(dueDate);

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(
      CTPayment,
      extensionUrl,
      0,
      cart,
    );

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
      billingAddress: customFieldObject.billingAddress,
      dueDate,
      lines: [],
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as przelewy24', async () => {
    const cart = {
      id: 'cart-test-id',
    } as Cart;

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

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(
      CTPayment,
      extensionUrl,
      0,
      cart,
    );
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
      billingAddress: {
        email: customFieldObject.billingEmail,
      },
      lines: [],
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as kbc', async () => {
    const cart = {
      id: 'cart-test-id',
    } as Cart;

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

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(
      CTPayment,
      extensionUrl,
      0,
      cart,
    );
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
      lines: [],
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as blik', () => {
    const cart = {
      id: 'cart-test-id',
    } as Cart;

    const customFieldObject = {
      description: 'Test payment',
      locale: 'en_GB',
      redirectUrl: 'https://example.com/success',
      webhookUrl: 'https://example.com/webhook',
      billingEmail: 'n.tran@shopmacher.de',
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
        method: CustomPaymentMethod.blik,
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

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(
      CTPayment,
      extensionUrl,
      0,
      cart,
    );
    expect(mollieCreatePaymentParams).toEqual({
      method: CustomPaymentMethod.blik,
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
      locale: customFieldObject.locale,
      redirectUrl: customFieldObject.redirectUrl,
      webhookUrl: customFieldObject.webhookUrl,
      description: customFieldObject.description,
      billingAddress: {
        email: customFieldObject.billingEmail,
      },
      lines: [],
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as applepay', async () => {
    const cart = {
      id: 'cart-test-id',
    } as Cart;

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

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(
      CTPayment,
      extensionUrl,
      0,
      cart,
    );
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
      applePayPaymentToken: JSON.stringify(customFieldObject.applePayPaymentToken),
      lines: [],
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as paypal', async () => {
    const cart = {
      id: 'cart-test-id',
    } as Cart;

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

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(
      CTPayment,
      extensionUrl,
      0,
      cart,
    );
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
      lines: [],
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as giftcard', async () => {
    const cart = {
      id: 'cart-test-id',
    } as Cart;

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

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(
      CTPayment,
      extensionUrl,
      0,
      cart,
    );
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
      lines: [],
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object including lineItems', async () => {
    const cart = {
      id: 'cart-test-id',
    } as Cart;

    const customFieldObject = {
      description: 'Test payment',
      locale: 'en_GB',
      redirectUrl: 'https://example.com/success',
      webhookUrl: 'https://example.com/webhook',
      lines: [
        {
          description: 'Item 1',
          quantity: 1,
          quantityUnit: 'pcs',
          unitPrice: { currency: 'EUR', value: '10.00' },
          totalAmount: { currency: 'EUR', value: '10.00' },
          sku: 'TEST1',
          imageUrl: 'https://example.com/image1.jpg',
          productUrl: 'https://example.com/product1',
        },
        {
          description: 'Item 2',
          quantity: 1,
          quantityUnit: 'pcs',
          unitPrice: { currency: 'EUR', value: '10.00' },
          totalAmount: { currency: 'EUR', value: '10.00' },
          sku: 'TEST2',
          imageUrl: 'https://example.com/image2.jpg',
          productUrl: 'https://example.com/product2',
        },
      ],
    };

    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 2000,
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

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(
      CTPayment,
      extensionUrl,
      0,
      cart,
    );
    expect(mollieCreatePaymentParams).toEqual({
      method: PaymentMethod.paypal,
      amount: {
        currency: 'EUR',
        value: '20.00',
      },
      locale: customFieldObject.locale,
      redirectUrl: customFieldObject.redirectUrl,
      webhookUrl: extensionUrl,
      description: customFieldObject.description,
      lines: customFieldObject.lines,
    });
  });

  it('should be able to create mollie payment params including billing email address with payment przelewy24', async () => {
    const cart = {
      id: 'cart-test-id',
      shippingInfo: {},
    } as Cart;

    const customFieldObject = {
      description: 'Test payment',
      locale: 'en_GB',
      redirectUrl: 'https://example.com/success',
      webhookUrl: 'https://example.com/webhook',
      billingEmail: 'dummy@gmail.com',
    };

    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 2000,
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

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(
      CTPayment,
      extensionUrl,
      0,
      cart,
    );

    expect(mollieCreatePaymentParams).toEqual({
      method: PaymentMethod.przelewy24,
      amount: {
        currency: 'EUR',
        value: '20.00',
      },
      locale: customFieldObject.locale,
      redirectUrl: customFieldObject.redirectUrl,
      webhookUrl: extensionUrl,
      description: customFieldObject.description,
      billingAddress: {
        email: customFieldObject.billingEmail,
      },
      lines: [],
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object including a line item for shipping amount', async () => {
    const cart = {
      id: 'cart-test-id',
      shippingInfo: {
        price: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 5000,
          fractionDigits: 2,
        },
      },
    } as Cart;

    const customFieldObject = {
      description: 'Test payment',
      locale: 'en_GB',
      redirectUrl: 'https://example.com/success',
      webhookUrl: 'https://example.com/webhook',
      lines: [
        {
          description: 'Item 1',
          quantity: 1,
          quantityUnit: 'pcs',
          unitPrice: { currency: 'EUR', value: '10.00' },
          totalAmount: { currency: 'EUR', value: '10.00' },
          sku: 'TEST1',
          imageUrl: 'https://example.com/image1.jpg',
          productUrl: 'https://example.com/product1',
        },
        {
          description: 'Item 2',
          quantity: 1,
          quantityUnit: 'pcs',
          unitPrice: { currency: 'EUR', value: '10.00' },
          totalAmount: { currency: 'EUR', value: '10.00' },
          sku: 'TEST2',
          imageUrl: 'https://example.com/image2.jpg',
          productUrl: 'https://example.com/product2',
        },
      ],
    };

    const mollieLines = Object.assign([], customFieldObject.lines as Array<any>);
    mollieLines.push({
      description: MOLLIE_SHIPPING_LINE_DESCRIPTION,
      quantity: 1,
      quantityUnit: 'pcs',
      unitPrice: {
        currency: 'EUR',
        value: '50.00',
      },
      totalAmount: {
        currency: 'EUR',
        value: '50.00',
      },
    });

    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 2000,
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

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(
      CTPayment,
      extensionUrl,
      0,
      cart,
    );
    expect(mollieCreatePaymentParams).toEqual({
      method: PaymentMethod.paypal,
      amount: {
        currency: 'EUR',
        value: '20.00',
      },
      locale: customFieldObject.locale,
      redirectUrl: customFieldObject.redirectUrl,
      webhookUrl: extensionUrl,
      description: customFieldObject.description,
      lines: mollieLines,
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object including a line item with discounted price for shipping amount', async () => {
    const cart = {
      id: 'cart-test-id',
      shippingInfo: {
        price: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 5000,
          fractionDigits: 2,
        },
        discountedPrice: {
          value: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 2000,
            fractionDigits: 2,
          },
        },
      },
    } as Cart;

    const customFieldObject = {
      description: 'Test payment',
      locale: 'en_GB',
      redirectUrl: 'https://example.com/success',
      webhookUrl: 'https://example.com/webhook',
      lines: [
        {
          description: 'Item 1',
          quantity: 1,
          quantityUnit: 'pcs',
          unitPrice: { currency: 'EUR', value: '10.00' },
          totalAmount: { currency: 'EUR', value: '10.00' },
          sku: 'TEST1',
          imageUrl: 'https://example.com/image1.jpg',
          productUrl: 'https://example.com/product1',
        },
        {
          description: 'Item 2',
          quantity: 1,
          quantityUnit: 'pcs',
          unitPrice: { currency: 'EUR', value: '10.00' },
          totalAmount: { currency: 'EUR', value: '10.00' },
          sku: 'TEST2',
          imageUrl: 'https://example.com/image2.jpg',
          productUrl: 'https://example.com/product2',
        },
      ],
    };

    const mollieLines = Object.assign([], customFieldObject.lines as Array<any>);
    mollieLines.push({
      description: MOLLIE_SHIPPING_LINE_DESCRIPTION,
      quantity: 1,
      quantityUnit: 'pcs',
      unitPrice: {
        currency: 'EUR',
        value: '20.00',
      },
      totalAmount: {
        currency: 'EUR',
        value: '20.00',
      },
    });

    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 2000,
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

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(
      CTPayment,
      extensionUrl,
      0,
      cart,
    );
    expect(mollieCreatePaymentParams).toEqual({
      method: PaymentMethod.paypal,
      amount: {
        currency: 'EUR',
        value: '20.00',
      },
      locale: customFieldObject.locale,
      redirectUrl: customFieldObject.redirectUrl,
      webhookUrl: extensionUrl,
      description: customFieldObject.description,
      lines: mollieLines,
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object with method as klarna', async () => {
    const cart = {
      id: 'cart-test-id',
    } as Cart;

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
        method: PaymentMethod.klarna,
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

    const mollieCreatePaymentParams: PaymentCreateParams = createMollieCreatePaymentParams(
      CTPayment,
      extensionUrl,
      0,
      cart,
    );

    expect(mollieCreatePaymentParams).toEqual({
      method: PaymentMethod.klarna,
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
      locale: customFieldObject.locale,
      redirectUrl: customFieldObject.redirectUrl,
      webhookUrl: extensionUrl,
      description: customFieldObject.description,
      lines: [],
    });
  });
});

describe('Test createCartUpdateActions', () => {
  it('should able to create cart update actions including only insert new custom line item', async () => {
    const cart = {
      customLineItems: [],
      shippingInfo: {
        taxCategory: {
          id: '123',
        },
      },
    } as unknown as Cart;
    const ctPayment = {
      amountPlanned: {
        centAmount: 10000,
        fractionDigits: 2,
        currencyCode: 'EUR',
      },
    } as Payment;
    const surchargeAmountInCent = 10;

    const expectedResult = [
      {
        action: 'addCustomLineItem',
        name: {
          en: MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
          de: MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
        },
        quantity: 1,
        slug: MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
        money: {
          centAmount: surchargeAmountInCent,
          currencyCode: ctPayment.amountPlanned.currencyCode,
        },
        taxCategory: {
          id: cart.shippingInfo?.taxCategory?.id,
        },
      },
    ];

    expect(createCartUpdateActions(cart, ctPayment, surchargeAmountInCent)).toEqual(expectedResult);
  });

  it('should able to create cart update actions including remove the existing custom line item and insert new custom line item', async () => {
    const mollieSurchargeCustomLine = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      key: MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
    };

    const cart = {
      customLineItems: [mollieSurchargeCustomLine],
      shippingInfo: {
        taxCategory: {
          id: '123',
        },
      },
    } as unknown as Cart;
    const ctPayment = {
      amountPlanned: {
        centAmount: 10000,
        fractionDigits: 2,
        currencyCode: 'EUR',
      },
    } as Payment;
    const surchargeAmountInCent = 10;

    const expectedResult = [
      {
        action: 'removeCustomLineItem',
        customLineItemId: mollieSurchargeCustomLine.id,
      },
      {
        action: 'addCustomLineItem',
        name: {
          en: MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
          de: MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
        },
        quantity: 1,
        slug: MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
        money: {
          centAmount: surchargeAmountInCent,
          // centAmount: surchargeAmount,
          currencyCode: ctPayment.amountPlanned.currencyCode,
        },
        taxCategory: {
          id: cart.shippingInfo?.taxCategory?.id,
        },
      },
    ];

    expect(createCartUpdateActions(cart, ctPayment, surchargeAmountInCent)).toEqual(expectedResult);
  });
});

describe('Test createMollieLineForAdditionalAmount', () => {
  it('should return a Mollie line for the surcharge amount', () => {
    const surchargeAmountInCent = 1020;
    const fractionDigits = 2;
    const currency = 'EUR';

    const expected = {
      description: MOLLIE_SURCHARGE_LINE_DESCRIPTION,
      quantity: 1,
      quantityUnit: 'pcs',
      unitPrice: {
        currency,
        value: '10.20',
      },
      totalAmount: {
        currency,
        value: '10.20',
      },
    };

    expect(
      createMollieLineForAdditionalAmount(
        MOLLIE_SURCHARGE_LINE_DESCRIPTION,
        surchargeAmountInCent,
        fractionDigits,
        currency,
      ),
    ).toStrictEqual(expected);
  });
});
