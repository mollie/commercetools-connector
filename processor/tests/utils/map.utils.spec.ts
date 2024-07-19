import { describe, test, expect, it } from '@jest/globals';
import {
  createMollieCreatePaymentParams,
  mapCommercetoolsPaymentCustomFieldsToMollieListParams,
} from '../../src/utils/map.utils';
import { Payment } from '@commercetools/platform-sdk';
import { MethodsListParams } from '@mollie/api-client';
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
  it('should able to create a mollie payment params from CommerceTools payment object', () => {
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

    const mollieCreatePaymentParams = createMollieCreatePaymentParams(CTPayment);
    const defaultWebhookEndpoint = new URL(process.env.CONNECT_SERVICE_URL ?? '').origin + '/webhook';
    const mollieAmount = makeMollieAmount(CTPayment.amountPlanned);

    expect(mollieCreatePaymentParams).toEqual({
      method: CTPayment.paymentMethodInfo.method,
      amount: {
        currency: mollieAmount.currency,
        value: mollieAmount.value,
      },
      locale: null,
      redirectUrl: null,
      webhookUrl: defaultWebhookEndpoint,
      description: '',
      applicationFee: {},
      billingAddress: {},
      issuer: '',
      metadata: null,
      profileId: null,
      restrictPaymentMethodsToCountry: null,
      shippingAddress: {},
      testmode: null,
      cardToken: '',
    });
  });

  it('should able to create a mollie payment params from CommerceTools payment object which has custom field', () => {
    const customFieldObject = {
      description: 'Test payment',
      locale: 'en_GB',
      redirectUrl: 'https://example.com/success',
      webhookUrl: 'https://example.com/webhook',
      cancelUrl: 'https://example.com/cancel',
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

    const mollieCreatePaymentParams = createMollieCreatePaymentParams(CTPayment);
    expect(mollieCreatePaymentParams).toEqual({
      method: 'creditcard',
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
      locale: customFieldObject.locale,
      redirectUrl: customFieldObject.redirectUrl,
      webhookUrl: customFieldObject.webhookUrl,
      description: customFieldObject.description,
      applicationFee: {},
      billingAddress: {},
      issuer: '',
      metadata: null,
      profileId: null,
      restrictPaymentMethodsToCountry: null,
      shippingAddress: {},
      testmode: null,
      cardToken: customFieldObject.cardToken,
    });
  });
});
