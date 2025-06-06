import {
  handleCapturePayment,
  getCreatePaymentUpdateAction,
  getPaymentCancelActions,
  getRefundStatusUpdateActions,
  handleCancelPayment,
  handleGetApplePaySession,
  handleCreatePayment,
  handleCreateRefund,
  handleListPaymentMethodsByPayment,
  handlePaymentCancelRefund,
  handlePaymentWebhook,
} from './../../src/service/payment.service';
import {
  getMethodConfigObjects,
  getSingleMethodConfigObject,
} from './../../src/commercetools/customObjects.commercetools';
import { afterEach, beforeEach, describe, expect, it, jest, test } from '@jest/globals';
import { Cart, CustomFields, Payment } from '@commercetools/platform-sdk';
import { ControllerResponseType } from '../../src/types/controller.types';
import {
  CancelStatusText,
  ConnectorActions,
  CustomFields as CustomFieldName,
  MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
} from '../../src/utils/constant.utils';
import { Payment as molliePayment, PaymentStatus, Refund, RefundStatus } from '@mollie/api-client';
import {
  ChangeTransactionState,
  CTTransaction,
  CTTransactionState,
  CTTransactionType,
  mollieRefundToCTStatusMap,
} from '../../src/types/commercetools.types';
import {
  cancelPayment,
  getApplePaySession,
  createMolliePayment,
  getPaymentById,
  listPaymentMethods,
  createCapturePayment,
  releaseAuthorizationPayment,
} from '../../src/mollie/payment.mollie';
import { cancelPaymentRefund, createPaymentRefund, getPaymentRefund } from '../../src/mollie/refund.mollie';
import CustomError from '../../src/errors/custom.error';
import { logger } from '../../src/utils/logger.utils';
import { getPaymentByMolliePaymentId, updatePayment } from '../../src/commercetools/payment.commercetools';
import { getPaymentExtension } from '../../src/commercetools/extensions.commercetools';
import { createCartUpdateActions, createMollieCreatePaymentParams } from '../../src/utils/map.utils';
import { changeTransactionState } from '../../src/commercetools/action.commercetools';
import { makeCTMoney, shouldRefundStatusUpdate } from '../../src/utils/mollie.utils';
import { getCartFromPayment, updateCart } from '../../src/commercetools/cart.commercetools';
import { calculateTotalSurchargeAmount } from '../../src/utils/app.utils';
import { removeCartMollieCustomLineItem } from '../../src/service/cart.service';
import { CreateParameters } from '@mollie/api-client/dist/types/binders/payments/refunds/parameters';
import { CreateParameters as CreateCaptureParameters } from '@mollie/api-client/dist/types/binders/payments/captures/parameters';

const uuid = '5c8b0375-305a-4f19-ae8e-07806b101999';
jest.mock('uuid', () => ({
  v4: () => uuid,
}));

jest.mock('../../src/commercetools/extensions.commercetools', () => ({
  getPaymentExtension: jest.fn(),
}));

jest.mock('../../src/commercetools/payment.commercetools', () => ({
  getPaymentByMolliePaymentId: jest.fn(),
  updatePayment: jest.fn(),
}));

jest.mock('../../src/commercetools/cart.commercetools', () => ({
  getCartFromPayment: jest.fn(),
  updateCart: jest.fn(),
}));

jest.mock('../../src/commercetools/customObjects.commercetools', () => ({
  getMethodConfigObjects: jest.fn(),
  getSingleMethodConfigObject: jest.fn(),
}));

jest.mock('../../src/service/payment.service.ts', () => ({
  ...(jest.requireActual('../../src/service/payment.service.ts') as object),
  getCreatePaymentUpdateAction: jest.fn(),
  getPaymentCancelActions: jest.fn(),
}));

jest.mock('../../src/mollie/payment.mollie', () => ({
  listPaymentMethods: jest.fn(),
  createMolliePayment: jest.fn(),
  getPaymentById: jest.fn(),
  getPaymentRefund: jest.fn(),
  cancelPayment: jest.fn(),
  getApplePaySession: jest.fn(),
  createPaymentWithCustomMethod: jest.fn(),
  createCapturePayment: jest.fn(),
  releaseAuthorizationPayment: jest.fn(),
}));

jest.mock('../../src/mollie/refund.mollie', () => ({
  cancelPaymentRefund: jest.fn(),
  getPaymentRefund: jest.fn(),
  createPaymentRefund: jest.fn(),
}));

jest.mock('../../src/utils/map.utils.ts', () => ({
  ...(jest.requireActual('../../src/utils/map.utils.ts') as object),
  createMollieCreatePaymentParams: jest.fn(),
}));

jest.mock('../../src/commercetools/action.commercetools', () => ({
  ...(jest.requireActual('../../src/commercetools/action.commercetools') as object),
  changeTransactionState: jest.fn(),
}));

jest.mock('../../src/utils/mollie.utils', () => ({
  ...(jest.requireActual('../../src/utils/mollie.utils') as object),
  makeCTMoney: jest.fn(),
  shouldRefundStatusUpdate: jest.fn(),
}));

describe('Test listPaymentMethodsByPayment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  let mockResource: Payment;

  test('call listPaymentMethodsByPayment with valid object reference', async () => {
    (listPaymentMethods as jest.Mock).mockReturnValueOnce([
      {
        resource: 'method',
        id: 'paypal',
        description: 'PayPal',
        minimumAmount: { value: '0.01', currency: 'EUR' },
        maximumAmount: null,
        image: {
          size1x: 'https://www.mollie.com/external/icons/payment-methods/paypal.png',
          size2x: 'https://www.mollie.com/external/icons/payment-methods/paypal%402x.png',
          svg: 'https://www.mollie.com/external/icons/payment-methods/paypal.svg',
        },
        status: 'activated',
        _links: {
          self: {
            href: 'https://api.mollie.com/v2/methods/paypal',
            type: 'application/hal+json',
          },
        },
      },
      {
        resource: 'method',
        id: 'giftcard',
        description: 'Geschenkkarten',
        minimumAmount: { value: '0.01', currency: 'EUR' },
        maximumAmount: null,
        image: {
          size1x: 'https://www.mollie.com/external/icons/payment-methods/giftcard.png',
          size2x: 'https://www.mollie.com/external/icons/payment-methods/giftcard%402x.png',
          svg: 'https://www.mollie.com/external/icons/payment-methods/giftcard.svg',
        },
        status: 'activated',
        _links: {
          self: {
            href: 'https://api.mollie.com/v2/methods/giftcard',
            type: 'application/hal+json',
          },
        },
      },
      {
        resource: 'method',
        id: 'bancontact',
        description: 'Bancontact',
        minimumAmount: { value: '0.01', currency: 'EUR' },
        maximumAmount: null,
        image: {
          size1x: 'https://www.mollie.com/external/icons/payment-methods/paypal.png',
          size2x: 'https://www.mollie.com/external/icons/payment-methods/paypal%402x.png',
          svg: 'https://www.mollie.com/external/icons/payment-methods/paypal.svg',
        },
        status: 'activated',
        _links: {
          self: {
            href: 'https://api.mollie.com/v2/methods/paypal',
            type: 'application/hal+json',
          },
        },
      },
      {
        resource: 'method',
        id: 'banktransfer',
        description: 'banktransfer',
        minimumAmount: { value: '0.01', currency: 'EUR' },
        maximumAmount: null,
        image: {
          size1x: 'https://www.mollie.com/external/icons/payment-methods/paypal.png',
          size2x: 'https://www.mollie.com/external/icons/payment-methods/paypal%402x.png',
          svg: 'https://www.mollie.com/external/icons/payment-methods/paypal.svg',
        },
        status: 'activated',
        _links: {
          self: {
            href: 'https://api.mollie.com/v2/methods/paypal',
            type: 'application/hal+json',
          },
        },
      },
    ]);

    (getMethodConfigObjects as jest.Mock).mockReturnValueOnce([
      {
        id: 'e561ae8b-5d55-4659-b4a7-3bf13a177eaf',
        version: 2,
        versionModifiedAt: '2024-10-15T10:04:28.910Z',
        createdAt: '2024-10-15T04:32:39.858Z',
        lastModifiedAt: '2024-10-15T10:04:28.910Z',
        lastModifiedBy: '',
        createdBy: '',
        container: 'sctm-app-methods',
        key: 'paypal',
        value: {
          id: 'paypal',
          name: {
            'en-GB': 'PayPal',
          },
          description: {
            'en-GB': '',
          },
          imageUrl: 'https://www.mollie.com/external/icons/payment-methods/applepay.svg',
          status: 'Active',
          displayOrder: 0,
          pricingConstraints: [
            {
              currencyCode: 'EUR',
              countryCode: 'DE',
              minAmount: 1000,
              maxAmount: 3000,
              surchargeCost: '2%',
            },
          ],
        },
      },
      {
        id: 'a8cfe2c6-c40e-4611-900d-faf3a0fc517c',
        version: 1,
        versionModifiedAt: '2024-10-15T04:32:39.962Z',
        createdAt: '2024-10-15T04:32:39.962Z',
        lastModifiedAt: '2024-10-15T04:32:39.962Z',
        lastModifiedBy: '',
        createdBy: '',
        container: 'sctm-app-methods',
        key: 'bancontact',
        value: {
          id: 'bancontact',
          name: {
            'en-GB': 'bancontact',
          },
          description: {
            'en-GB': '',
          },
          imageUrl: 'https://www.mollie.com/external/icons/payment-methods/bancontact.svg',
          status: 'Active',
          displayOrder: 0,
          pricingConstraints: [
            {
              currencyCode: 'EUR',
              countryCode: 'DE',
              minAmount: 1000,
              maxAmount: 44000,
              surchargeCost: '2%',
            },
          ],
        },
      },
      {
        id: '5ca6f09f-2e10-4d0e-8397-467925a28568',
        version: 3,
        versionModifiedAt: '2024-10-15T10:05:33.573Z',
        createdAt: '2024-10-15T04:32:39.923Z',
        lastModifiedAt: '2024-10-15T10:05:33.573Z',
        lastModifiedBy: '',
        createdBy: '',
        container: 'sctm-app-methods',
        key: 'banktransfer',
        value: {
          id: 'banktransfer',
          name: {
            'en-GB': 'Bank Transfer',
          },
          description: {
            'en-GB': '',
          },
          imageUrl: 'https://www.mollie.com/external/icons/payment-methods/banktransfer.svg',
          status: 'Active',
          displayOrder: 0,
          pricingConstraints: [
            {
              currencyCode: 'EUR',
              countryCode: 'DE',
              minAmount: 1000,
              surchargeCost: '2%',
            },
          ],
        },
      },
    ]);

    mockResource = {
      id: 'RANDOMID_12345',
      paymentMethodInfo: {
        paymentInterface: 'mollie',
        method: 'card',
      },
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 500000,
        fractionDigits: 2,
      },
      custom: {
        fields: {
          sctm_payment_methods_request: JSON.stringify({
            locale: 'de_DE',
            billingCountry: 'DE',
          }),
        },
      } as unknown as CustomFields,
    } as unknown as Payment;

    const response = await handleListPaymentMethodsByPayment(mockResource);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    expect(response?.actions?.length).toBeGreaterThan(0);
    expect(response?.actions?.[0]?.action).toBe('setCustomField');
    expect((response?.actions?.[1] as any)?.value).toBe(
      JSON.stringify({
        count: 2,
        methods: [
          {
            id: 'bancontact',
            name: {
              'en-GB': 'bancontact',
            },
            description: {
              'en-GB': '',
            },
            image: 'https://www.mollie.com/external/icons/payment-methods/bancontact.svg',
            order: 0,
          },
          {
            id: 'banktransfer',
            name: {
              'en-GB': 'Bank Transfer',
            },
            description: {
              'en-GB': '',
            },
            image: 'https://www.mollie.com/external/icons/payment-methods/banktransfer.svg',
            order: 0,
          },
        ],
      }),
    );
  });

  test('call listPaymentMethodsByPayment with no object reference', async () => {
    (listPaymentMethods as jest.Mock).mockReturnValueOnce([]);

    (getMethodConfigObjects as jest.Mock).mockReturnValueOnce([
      {
        id: 'e561ae8b-5d55-4659-b4a7-3bf13a177eaf',
        version: 2,
        versionModifiedAt: '2024-10-15T10:04:28.910Z',
        createdAt: '2024-10-15T04:32:39.858Z',
        lastModifiedAt: '2024-10-15T10:04:28.910Z',
        lastModifiedBy: '',
        createdBy: '',
        container: 'sctm-app-methods',
        key: 'paypal',
        value: {
          id: 'paypal',
          name: {
            'en-GB': 'PayPal',
          },
          description: {
            'en-GB': '',
          },
          imageUrl: 'https://www.mollie.com/external/icons/payment-methods/applepay.svg',
          status: 'Active',
          displayOrder: 0,
          pricingConstraints: [
            {
              currencyCode: 'EUR',
              countryCode: 'DE',
              minAmount: 1000,
              maxAmount: 3000,
              surchargeCost: '2%',
            },
          ],
        },
      },
      {
        id: 'a8cfe2c6-c40e-4611-900d-faf3a0fc517c',
        version: 1,
        versionModifiedAt: '2024-10-15T04:32:39.962Z',
        createdAt: '2024-10-15T04:32:39.962Z',
        lastModifiedAt: '2024-10-15T04:32:39.962Z',
        lastModifiedBy: '',
        createdBy: '',
        container: 'sctm-app-methods',
        key: 'bancontact',
        value: {
          id: 'bancontact',
          name: {
            'en-GB': 'bancontact',
          },
          description: {
            'en-GB': '',
          },
          imageUrl: 'https://www.mollie.com/external/icons/payment-methods/bancontact.svg',
          status: 'Active',
          displayOrder: 0,
          pricingConstraints: [
            {
              currencyCode: 'EUR',
              countryCode: 'DE',
              minAmount: 1000,
              maxAmount: 44000,
              surchargeCost: '2%',
            },
          ],
          banktransferDueDate: '14d',
        },
      },
      {
        id: '5ca6f09f-2e10-4d0e-8397-467925a28568',
        version: 3,
        versionModifiedAt: '2024-10-15T10:05:33.573Z',
        createdAt: '2024-10-15T04:32:39.923Z',
        lastModifiedAt: '2024-10-15T10:05:33.573Z',
        lastModifiedBy: '',
        createdBy: '',
        container: 'sctm-app-methods',
        key: 'banktransfer',
        value: {
          id: 'banktransfer',
          name: {
            'en-GB': 'Bank Transfer',
          },
          description: {
            'en-GB': '',
          },
          imageUrl: 'https://www.mollie.com/external/icons/payment-methods/banktransfer.svg',
          status: 'Active',
          displayOrder: 0,
          pricingConstraints: [
            {
              currencyCode: 'EUR',
              countryCode: 'DE',
              minAmount: 1000,
              maxAmount: 300000,
              surchargeCost: '2%',
            },
          ],
        },
      },
    ]);

    mockResource = {
      typeId: 'payment',
      paymentMethodInfo: {
        paymentInterface: 'mollie',
        method: 'card',
      },
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 1000,
        fractionDigits: 2,
      },
      custom: {
        fields: {
          sctm_payment_methods_request: JSON.stringify({
            locale: 'de_DE',
            billingCountry: 'DE',
          }),
        },
      } as unknown as CustomFields,
    } as unknown as Payment;

    const response: ControllerResponseType = await handleListPaymentMethodsByPayment(mockResource);

    expect(response).toBeDefined();
    expect(response?.statusCode).toBe(200);
    expect(response?.actions?.length).toBeGreaterThan(0);
    expect(response?.actions?.[0]?.action).toBe('setCustomField');
  });

  test('call listPaymentMethodsByPayment with failure result', async () => {
    mockResource = {
      id: 'RANDOMID_12345',
      paymentMethodInfo: {
        paymentInterface: 'mollie',
        method: 'card',
      },
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'VND',
        centAmount: 1000,
        fractionDigits: 2,
      },
      custom: {
        fields: {
          sctm_payment_methods_request: JSON.stringify({
            locale: 'de_DE',
            billingCountry: 'DE',
          }),
        },
      } as unknown as CustomFields,
    } as unknown as Payment;

    const response = await handleListPaymentMethodsByPayment(mockResource);

    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    expect(response?.actions?.length).toEqual(0);
    expect(response?.actions?.[0]?.action).toBe(undefined);
    expect(JSON.stringify(response)).not.toContain('count');
  });

  test('call listPaymentMethodsByPayment with billingCountry', async () => {
    mockResource = {
      id: 'RANDOMID_12345',
      paymentMethodInfo: {
        paymentInterface: 'mollie',
        method: 'card',
      },
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'VND',
        centAmount: 1000,
        fractionDigits: 2,
      },
      custom: {
        fields: {
          sctm_payment_methods_request: JSON.stringify({
            locale: 'de_DE',
          }),
        },
      } as unknown as CustomFields,
    } as unknown as Payment;

    try {
      await handleListPaymentMethodsByPayment(mockResource);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).message).toBe('billingCountry is not provided.');
      expect((error as CustomError).statusCode).toBe(400);
    }
  });

  test('call listPaymentMethodsByPayment with cardComponent deactivated', async () => {
    (listPaymentMethods as jest.Mock).mockReturnValueOnce([
      {
        resource: 'method',
        id: 'creditcard',
        description: 'creditcard',
        minimumAmount: { value: '0.01', currency: 'EUR' },
        maximumAmount: null,
        image: {
          size1x: 'https://www.mollie.com/external/icons/payment-methods/creditcard.png',
          size2x: 'https://www.mollie.com/external/icons/payment-methods/creditcard%402x.png',
          svg: 'https://www.mollie.com/external/icons/payment-methods/creditcard.svg',
        },
        status: 'activated',
        _links: {
          self: {
            href: 'https://api.mollie.com/v2/methods/creditcard',
            type: 'application/hal+json',
          },
        },
      },
      {
        resource: 'method',
        id: 'giftcard',
        description: 'Geschenkkarten',
        minimumAmount: { value: '0.01', currency: 'EUR' },
        maximumAmount: null,
        image: {
          size1x: 'https://www.mollie.com/external/icons/payment-methods/giftcard.png',
          size2x: 'https://www.mollie.com/external/icons/payment-methods/giftcard%402x.png',
          svg: 'https://www.mollie.com/external/icons/payment-methods/giftcard.svg',
        },
        status: 'activated',
        _links: {
          self: {
            href: 'https://api.mollie.com/v2/methods/giftcard',
            type: 'application/hal+json',
          },
        },
      },
    ]);

    (getMethodConfigObjects as jest.Mock).mockReturnValueOnce([
      {
        id: 'e561ae8b-5d55-4659-b4a7-3bf13a177eaf',
        version: 2,
        versionModifiedAt: '2024-10-15T10:04:28.910Z',
        createdAt: '2024-10-15T04:32:39.858Z',
        lastModifiedAt: '2024-10-15T10:04:28.910Z',
        lastModifiedBy: '',
        createdBy: '',
        container: 'sctm-app-methods',
        key: 'paypal',
        value: {
          id: 'paypal',
          name: {
            'en-GB': 'PayPal',
          },
          description: {
            'en-GB': '',
          },
          imageUrl: 'https://www.mollie.com/external/icons/payment-methods/applepay.svg',
          status: 'Active',
          displayOrder: 0,
          pricingConstraints: [
            {
              currencyCode: 'EUR',
              countryCode: 'DE',
              minAmount: 1000,
              maxAmount: 3000,
              surchargeCost: '2%',
            },
          ],
        },
      },
      {
        id: 'a8cfe2c6-c40e-4611-900d-faf3a0fc517c',
        version: 1,
        versionModifiedAt: '2024-10-15T04:32:39.962Z',
        createdAt: '2024-10-15T04:32:39.962Z',
        lastModifiedAt: '2024-10-15T04:32:39.962Z',
        lastModifiedBy: '',
        createdBy: '',
        container: 'sctm-app-methods',
        key: 'creditcard',
        value: {
          id: 'creditcard',
          name: {
            'en-GB': 'creditcard',
          },
          description: {
            'en-GB': '',
          },
          imageUrl: 'https://www.mollie.com/external/icons/payment-methods/bancontact.svg',
          status: 'Active',
          displayOrder: 0,
          pricingConstraints: [
            {
              currencyCode: 'EUR',
              countryCode: 'DE',
              minAmount: 0,
              maxAmount: 100000,
              surchargeCost: '2%',
            },
          ],
        },
      },
      {
        id: '5ca6f09f-2e10-4d0e-8397-467925a28568',
        version: 3,
        versionModifiedAt: '2024-10-15T10:05:33.573Z',
        createdAt: '2024-10-15T04:32:39.923Z',
        lastModifiedAt: '2024-10-15T10:05:33.573Z',
        lastModifiedBy: '',
        createdBy: '',
        container: 'sctm-app-methods',
        key: 'banktransfer',
        value: {
          id: 'banktransfer',
          name: {
            'en-GB': 'Bank Transfer',
          },
          description: {
            'en-GB': '',
          },
          imageUrl: 'https://www.mollie.com/external/icons/payment-methods/banktransfer.svg',
          status: 'Active',
          displayOrder: 0,
          pricingConstraints: [
            {
              currencyCode: 'EUR',
              countryCode: 'DE',
              minAmount: 1000,
              maxAmount: 300000,
              surchargeCost: '2%',
            },
          ],
        },
      },
    ]);

    const cart = {
      id: 'cart-id',
      country: 'DE',
    };

    (getCartFromPayment as jest.Mock).mockReturnValue(cart);

    mockResource = {
      id: 'RANDOMID_12345',
      paymentMethodInfo: {
        paymentInterface: 'mollie',
        method: 'card',
      },
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 200000,
        fractionDigits: 2,
      },
      custom: {
        fields: {
          sctm_payment_methods_request: JSON.stringify({
            locale: 'de_DE',
            billingCountry: 'DE',
          }),
        },
      } as unknown as CustomFields,
    } as unknown as Payment;

    const response = await handleListPaymentMethodsByPayment(mockResource);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    expect(response?.actions?.length).toBeGreaterThan(0);
    expect(response?.actions?.[0]?.action).toBe('setCustomField');
    expect(response?.actions?.[0]).toEqual({
      action: 'setCustomField',
      name: 'sctm_mollie_profile_id',
      value: '',
    });
    expect(JSON.stringify(response)).toContain('creditcard');
  });

  test('call listPaymentMethodsByPayment with cardComponent activated', async () => {
    (listPaymentMethods as jest.Mock).mockReturnValueOnce([
      {
        resource: 'method',
        id: 'creditcard',
        description: 'creditcard',
        minimumAmount: { value: '0.01', currency: 'EUR' },
        maximumAmount: null,
        image: {
          size1x: 'https://www.mollie.com/external/icons/payment-methods/creditcard.png',
          size2x: 'https://www.mollie.com/external/icons/payment-methods/creditcard%402x.png',
          svg: 'https://www.mollie.com/external/icons/payment-methods/creditcard.svg',
        },
        status: 'activated',
        _links: {
          self: {
            href: 'https://api.mollie.com/v2/methods/creditcard',
            type: 'application/hal+json',
          },
        },
      },
      {
        resource: 'method',
        id: 'giftcard',
        description: 'Geschenkkarten',
        minimumAmount: { value: '0.01', currency: 'EUR' },
        maximumAmount: null,
        image: {
          size1x: 'https://www.mollie.com/external/icons/payment-methods/giftcard.png',
          size2x: 'https://www.mollie.com/external/icons/payment-methods/giftcard%402x.png',
          svg: 'https://www.mollie.com/external/icons/payment-methods/giftcard.svg',
        },
        status: 'activated',
        _links: {
          self: {
            href: 'https://api.mollie.com/v2/methods/giftcard',
            type: 'application/hal+json',
          },
        },
      },
    ]);

    (getMethodConfigObjects as jest.Mock).mockReturnValueOnce([
      {
        id: 'e561ae8b-5d55-4659-b4a7-3bf13a177eaf',
        version: 2,
        versionModifiedAt: '2024-10-15T10:04:28.910Z',
        createdAt: '2024-10-15T04:32:39.858Z',
        lastModifiedAt: '2024-10-15T10:04:28.910Z',
        lastModifiedBy: '',
        createdBy: '',
        container: 'sctm-app-methods',
        key: 'creditcard',
        value: {
          id: 'creditcard',
          name: {
            'en-GB': 'creditcard',
          },
          description: {
            'en-GB': '',
          },
          imageUrl: 'https://www.mollie.com/external/icons/payment-methods/applepay.svg',
          status: 'Active',
          displayOrder: 0,
          pricingConstraints: [
            {
              currencyCode: 'EUR',
              countryCode: 'DE',
              minAmount: 0,
              maxAmount: 3000,
              surchargeCost: '2%',
            },
          ],
          displayCardComponent: true,
        },
      },
      {
        id: 'a8cfe2c6-c40e-4611-900d-faf3a0fc517c',
        version: 1,
        versionModifiedAt: '2024-10-15T04:32:39.962Z',
        createdAt: '2024-10-15T04:32:39.962Z',
        lastModifiedAt: '2024-10-15T04:32:39.962Z',
        lastModifiedBy: '',
        createdBy: '',
        container: 'sctm-app-methods',
        key: 'bancontact',
        value: {
          id: 'bancontact',
          name: {
            'en-GB': 'bancontact',
          },
          description: {
            'en-GB': '',
          },
          imageUrl: 'https://www.mollie.com/external/icons/payment-methods/bancontact.svg',
          status: 'Active',
          displayOrder: 0,
          pricingConstraints: [
            {
              currencyCode: 'EUR',
              countryCode: 'DE',
              minAmount: 1000,
              maxAmount: 44000,
              surchargeCost: '2%',
            },
          ],
        },
      },
      {
        id: '5ca6f09f-2e10-4d0e-8397-467925a28568',
        version: 3,
        versionModifiedAt: '2024-10-15T10:05:33.573Z',
        createdAt: '2024-10-15T04:32:39.923Z',
        lastModifiedAt: '2024-10-15T10:05:33.573Z',
        lastModifiedBy: '',
        createdBy: '',
        container: 'sctm-app-methods',
        key: 'banktransfer',
        value: {
          id: 'banktransfer',
          name: {
            'en-GB': 'Bank Transfer',
          },
          description: {
            'en-GB': '',
          },
          imageUrl: 'https://www.mollie.com/external/icons/payment-methods/banktransfer.svg',
          status: 'Active',
          displayOrder: 0,
          pricingConstraints: [
            {
              currencyCode: 'EUR',
              countryCode: 'DE',
              minAmount: 1000,
              maxAmount: 300000,
              surchargeCost: '2%',
            },
          ],
        },
      },
    ]);

    (getCartFromPayment as jest.Mock).mockReturnValue({
      id: 'cart-id',
      country: 'DE',
    } as Cart);

    mockResource = {
      id: 'RANDOMID_12345',
      paymentMethodInfo: {
        paymentInterface: 'mollie',
        method: 'card',
      },
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 1000,
        fractionDigits: 2,
      },
      custom: {
        fields: {
          sctm_payment_methods_request: JSON.stringify({
            locale: 'de_DE',
            billingCountry: 'DE',
          }),
        },
      } as unknown as CustomFields,
    } as unknown as Payment;

    process.env.MOLLIE_CARD_COMPONENT = '1';

    const response = await handleListPaymentMethodsByPayment(mockResource);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    expect(response?.actions?.length).toBeGreaterThan(0);
    expect(response?.actions?.[0]?.action).toBe('setCustomField');
    expect(response?.actions?.[0]).toEqual({
      action: 'setCustomField',
      name: 'sctm_mollie_profile_id',
      value: process.env.MOLLIE_PROFILE_ID,
    });
    expect(JSON.stringify(response)).toContain('creditcard');
  });
});

describe('Test getCreatePaymentUpdateAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return an error if there is no valid transaction found', () => {
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
      transactions: [
        {
          id: '5c8b0375-305a-4f19-ae8e-07806b101999',
          type: 'Chargeback',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Initial',
        },
        {
          id: '5c8b0375-305a-4f19-ae8e-07806b101999',
          type: 'Refund',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Initial',
        },
      ],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'creditcard',
      },
    };

    const molliePayment: molliePayment = {
      amount: { currency: 'USD', value: '10.00' },
    } as molliePayment;

    (getCreatePaymentUpdateAction as jest.Mock).mockImplementationOnce(() => {
      const paymentService = jest.requireActual(
        '../../src/service/payment.service.ts',
      ) as typeof import('../../src/service/payment.service');
      return paymentService.getCreatePaymentUpdateAction(molliePayment, CTPayment, 0);
    });

    getCreatePaymentUpdateAction(molliePayment, CTPayment, 0).catch((error) => {
      expect(error).toEqual({
        status: 400,
        title: 'Cannot find original transaction',
        field: 'Payment.transactions',
      });
    });
  });

  test('should return an array of actions', async () => {
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
      transactions: [
        {
          id: '5c8b0375-305a-4f19-ae8e-07806b101999',
          type: 'Authorization',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Initial',
        },
      ],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'creditcard',
      },
    };

    const molliePayment: molliePayment = {
      resource: 'payment',
      id: 'tr_7UhSN1zuXS',
      amount: { currency: 'USD', value: '10.00' },
      createdAt: '2024-07-05T04:24:12+00:00',
      _links: {
        checkout: {
          href: 'https://api.mollie.com/v2/payments/tr_7UhSN1zuXS',
          type: 'https://api.mollie.com/v2/payments/tr_7UhSN1zuXS',
        },
        documentation: {
          href: 'https://api.mollie.com/v2/payments/tr_7UhSN1zuXS',
          type: 'https://api.mollie.com/v2/payments/tr_7UhSN1zuXS',
        },
      },
    } as molliePayment;

    (getCreatePaymentUpdateAction as jest.Mock).mockImplementationOnce(() => {
      const paymentService = jest.requireActual(
        '../../src/service/payment.service.ts',
      ) as typeof import('../../src/service/payment.service');
      return paymentService.getCreatePaymentUpdateAction(molliePayment, CTPayment, 0);
    });

    (changeTransactionState as jest.Mock).mockReturnValueOnce({
      action: 'changeTransactionState',
      state: 'Pending',
      transactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
    });

    const actual = await getCreatePaymentUpdateAction(molliePayment, CTPayment, 0);
    expect(actual).toHaveLength(4);

    expect(actual[0]).toEqual({
      action: 'addInterfaceInteraction',
      type: {
        key: 'sctm_interface_interaction_type',
      },
      fields: {
        sctm_id: uuid,
        sctm_action_type: ConnectorActions.CreatePayment,
        sctm_created_at: molliePayment.createdAt,
        sctm_request: JSON.stringify({
          transactionId: CTPayment.transactions[0].id,
          paymentMethod: CTPayment.paymentMethodInfo.method,
        }),
        sctm_response: JSON.stringify({
          molliePaymentId: molliePayment.id,
          checkoutUrl: molliePayment._links.checkout?.href,
          transactionId: CTPayment.transactions[0].id,
        }),
      },
    });

    expect(actual[1]).toEqual({
      action: 'changeTransactionInteractionId',
      transactionId: CTPayment.transactions[0].id,
      interactionId: molliePayment.id,
    });

    expect(actual[2]).toEqual({
      action: 'changeTransactionTimestamp',
      transactionId: CTPayment.transactions[0].id,
      timestamp: molliePayment.createdAt,
    });

    expect(actual[3]).toEqual({
      action: 'changeTransactionState',
      transactionId: CTPayment.transactions[0].id,
      state: CTTransactionState.Pending,
    });
  });

  test('should return an array of actions included setTransactionCustomField when surcharge amount is not 0', async () => {
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
      transactions: [
        {
          id: '5c8b0375-305a-4f19-ae8e-07806b101999',
          type: 'Authorization',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Initial',
        },
      ],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'creditcard',
      },
    };

    const molliePayment: molliePayment = {
      resource: 'payment',
      id: 'tr_7UhSN1zuXS',
      amount: { currency: 'USD', value: '10.00' },
      createdAt: '2024-07-05T04:24:12+00:00',
      _links: {
        checkout: {
          href: 'https://api.mollie.com/v2/payments/tr_7UhSN1zuXS',
          type: 'https://api.mollie.com/v2/payments/tr_7UhSN1zuXS',
        },
        documentation: {
          href: 'https://api.mollie.com/v2/payments/tr_7UhSN1zuXS',
          type: 'https://api.mollie.com/v2/payments/tr_7UhSN1zuXS',
        },
      },
    } as molliePayment;

    (getCreatePaymentUpdateAction as jest.Mock).mockImplementationOnce(() => {
      const paymentService = jest.requireActual(
        '../../src/service/payment.service.ts',
      ) as typeof import('../../src/service/payment.service');
      return paymentService.getCreatePaymentUpdateAction(molliePayment, CTPayment, 1000);
    });

    (changeTransactionState as jest.Mock).mockReturnValueOnce({
      action: 'changeTransactionState',
      state: 'Pending',
      transactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
    });

    const actual = await getCreatePaymentUpdateAction(molliePayment, CTPayment, 1000);
    expect(actual).toHaveLength(5);

    expect(actual[0]).toEqual({
      action: 'addInterfaceInteraction',
      type: {
        key: 'sctm_interface_interaction_type',
      },
      fields: {
        sctm_id: uuid,
        sctm_action_type: ConnectorActions.CreatePayment,
        sctm_created_at: molliePayment.createdAt,
        sctm_request: JSON.stringify({
          transactionId: CTPayment.transactions[0].id,
          paymentMethod: CTPayment.paymentMethodInfo.method,
        }),
        sctm_response: JSON.stringify({
          molliePaymentId: molliePayment.id,
          checkoutUrl: molliePayment._links.checkout?.href,
          transactionId: CTPayment.transactions[0].id,
        }),
      },
    });

    expect(actual[1]).toEqual({
      action: 'changeTransactionInteractionId',
      transactionId: CTPayment.transactions[0].id,
      interactionId: molliePayment.id,
    });

    expect(actual[2]).toEqual({
      action: 'changeTransactionTimestamp',
      transactionId: CTPayment.transactions[0].id,
      timestamp: molliePayment.createdAt,
    });

    expect(actual[3]).toEqual({
      action: 'changeTransactionState',
      transactionId: CTPayment.transactions[0].id,
      state: CTTransactionState.Pending,
    });

    expect(actual[4]).toEqual({
      action: 'setTransactionCustomType',
      type: {
        key: CustomFieldName.transactions.defaultCustomTypeKey,
      },
      fields: {
        surchargeAmountInCent: 1000,
      },
      transactionId: CTPayment.transactions[0].id,
    });
  });
});

describe('Test handleCreatePayment', () => {
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
    transactions: [
      {
        id: '5c8b0375-305a-4f19-ae8e-07806b101999',
        type: 'Authorization',
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 1000,
          fractionDigits: 2,
        },
        state: 'Initial',
      },
    ],
    interfaceInteractions: [],
    paymentMethodInfo: {
      method: 'creditcard',
    },
    custom: {
      type: {
        typeId: 'type',
        id: 'test',
      },
      fields: {
        sctm_payment_methods_request: JSON.stringify({
          billingCountry: 'DE',
        }),
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return status code and array of actions', async () => {
    const molliePayment: molliePayment = {
      resource: 'payment',
      id: 'tr_7UhSN1zuXS',
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
      description: 'Order #12345',
      redirectUrl: 'https://webshop.example.org/order/12345/',
      webhookUrl: 'https://webshop.example.org/payments/webhook/',
      metadata: '{"order_id":12345}',
      profileId: 'pfl_QkEhN94Ba',
      status: PaymentStatus.open,
      isCancelable: false,
      createdAt: '2024-03-20T09:13:37+00:00',
      expiresAt: '2024-03-20T09:28:37+00:00',
      _links: {
        self: {
          href: '...',
          type: 'application/hal+json',
        },
        checkout: {
          href: 'https://www.mollie.com/checkout/select-method/7UhSN1zuXS',
          type: 'text/html',
        },
        documentation: {
          href: '...',
          type: 'text/html',
        },
      },
    } as molliePayment;

    const customLineItem = {
      id: 'custom-line',
      key: MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
    };

    const mockedCart = {
      id: 'mocked-cart',
      customLineItems: [customLineItem],
    } as Cart;

    const methodConfig = {
      value: {
        pricingConstraints: [
          {
            currencyCode: CTPayment.amountPlanned.currencyCode,
            countryCode: JSON.parse(CTPayment.custom?.fields?.sctm_payment_methods_request).billingCountry,
            surchargeCost: {
              percentageAmount: 2,
              fixedAmount: 10,
            },
          },
        ],
      },
    };

    const appUtils = require('../../src/utils/app.utils');

    jest.spyOn(appUtils, 'calculateTotalSurchargeAmount');

    const mapUtils = require('../../src/utils/map.utils');

    jest.spyOn(mapUtils, 'createCartUpdateActions');

    (getCartFromPayment as jest.Mock).mockReturnValue(mockedCart);
    (getSingleMethodConfigObject as jest.Mock).mockReturnValueOnce(methodConfig);
    (createMolliePayment as jest.Mock).mockReturnValueOnce(molliePayment);
    (getPaymentExtension as jest.Mock).mockReturnValueOnce({
      destination: {
        url: 'https://example.com',
      },
    });

    (createMollieCreatePaymentParams as jest.Mock).mockReturnValueOnce({
      method: 'creditcard',
    });

    (changeTransactionState as jest.Mock).mockReturnValueOnce({
      action: 'changeTransactionState',
      state: 'Pending',
      transactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
    });

    (updateCart as jest.Mock).mockReturnValue(mockedCart);

    const totalSurchargeAmount = 1020;

    const actual = await handleCreatePayment(CTPayment);

    const expectedCartUpdateActions = [
      {
        action: 'removeCustomLineItem',
        customLineItemId: customLineItem.id,
      },
      {
        action: 'addCustomLineItem',
        name: {
          de: MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
          en: MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
        },
        quantity: 1,
        money: {
          centAmount: totalSurchargeAmount,
          currencyCode: CTPayment.amountPlanned.currencyCode,
        },
        slug: MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
      },
    ];

    expect(getSingleMethodConfigObject).toHaveBeenCalledWith(CTPayment.paymentMethodInfo.method);
    expect(calculateTotalSurchargeAmount).toHaveBeenCalledTimes(1);
    expect(calculateTotalSurchargeAmount).toHaveBeenCalledWith(
      CTPayment,
      methodConfig.value.pricingConstraints[0].surchargeCost,
    );
    expect(calculateTotalSurchargeAmount).toHaveReturnedWith(
      totalSurchargeAmount / Math.pow(10, CTPayment.amountPlanned.fractionDigits),
    );

    expect(createCartUpdateActions).toHaveBeenCalledTimes(1);
    expect(createCartUpdateActions).toHaveBeenCalledWith(mockedCart, CTPayment, totalSurchargeAmount);
    expect(createCartUpdateActions).toHaveReturnedWith(expectedCartUpdateActions);

    const ctActions = [
      {
        action: 'addInterfaceInteraction',
        type: { key: 'sctm_interface_interaction_type' },
        fields: {
          sctm_id: '5c8b0375-305a-4f19-ae8e-07806b101999',
          sctm_action_type: 'createPayment',
          sctm_created_at: '2024-03-20T09:13:37+00:00',
          sctm_request: '{"transactionId":"5c8b0375-305a-4f19-ae8e-07806b101999","paymentMethod":"creditcard"}',
          sctm_response:
            '{"molliePaymentId":"tr_7UhSN1zuXS","checkoutUrl":"https://www.mollie.com/checkout/select-method/7UhSN1zuXS","transactionId":"5c8b0375-305a-4f19-ae8e-07806b101999"}',
        },
      },
      {
        action: 'changeTransactionInteractionId',
        transactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
        interactionId: 'tr_7UhSN1zuXS',
      },
      {
        action: 'changeTransactionTimestamp',
        transactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
        timestamp: '2024-03-20T09:13:37+00:00',
      },
      {
        action: 'changeTransactionState',
        transactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
        state: 'Pending',
      },
      {
        action: 'setTransactionCustomType',
        type: {
          key: CustomFieldName.transactions.defaultCustomTypeKey,
        },
        fields: {
          surchargeAmountInCent: 1020,
        },
        transactionId: CTPayment.transactions[0].id,
      },
    ];

    expect(actual).toEqual({
      statusCode: 201,
      actions: ctActions,
    });
  });
});

describe('Test handleCreateRefund', () => {
  it('should return status code and array of actions (1 success charge transaction)', async () => {
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
      transactions: [
        {
          id: uuid,
          type: 'Charge',
          interactionId: 'tr_123123',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Success',
        },
        {
          id: 'test_refund',
          type: 'Refund',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Initial',
        },
      ],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'creditcard',
      },
    };

    (changeTransactionState as jest.Mock).mockReturnValueOnce({
      action: 'changeTransactionState',
      state: 'Pending',
      transactionId: 'test_refund',
    });

    (createPaymentRefund as jest.Mock).mockReturnValue({
      id: 'fake_refund_id',
    });

    const paymentCreateRefundParams: CreateParameters = {
      paymentId: 'tr_123123',
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
    };

    const result = await handleCreateRefund(CTPayment);

    expect(createPaymentRefund).toBeCalledTimes(1);
    expect(createPaymentRefund).toBeCalledWith(paymentCreateRefundParams);
    expect(result.statusCode).toBe(201);
    expect(result.actions).toStrictEqual([
      {
        action: 'setTransactionCustomType',
        type: {
          key: CustomFieldName.transactions.defaultCustomTypeKey,
        },
        transactionId: 'test_refund',
        fields: {
          [CustomFieldName.transactions.fields.molliePaymentIdToRefund.name]: 'tr_123123',
        },
      },
      {
        action: 'changeTransactionInteractionId',
        transactionId: 'test_refund',
        interactionId: 'fake_refund_id',
      },
      {
        action: 'changeTransactionState',
        transactionId: 'test_refund',
        state: 'Pending',
      },
    ]);
  });

  it('should return status code and array of actions (more than 1 success charge transaction, with Mollie payment that need to be refunded is not specified)', async () => {
    const targetedMolliePaymentId = 'tr_123456';

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
      transactions: [
        {
          id: uuid,
          timestamp: '2024-06-24T08:28:43.474Z',
          type: 'Charge',
          interactionId: 'tr_123123',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Success',
        },
        {
          id: 'test-123',
          timestamp: '2024-06-24T08:30:43.474Z',
          type: 'Charge',
          interactionId: targetedMolliePaymentId,
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Success',
        },
        {
          id: 'test_refund',
          type: 'Refund',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Initial',
        },
      ],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'creditcard',
      },
    };

    (changeTransactionState as jest.Mock).mockReturnValueOnce({
      action: 'changeTransactionState',
      state: 'Pending',
      transactionId: 'test_refund',
    });

    (createPaymentRefund as jest.Mock).mockReturnValue({
      id: 'fake_refund_id',
    });

    const paymentCreateRefundParams: CreateParameters = {
      paymentId: targetedMolliePaymentId,
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
    };

    const result = await handleCreateRefund(CTPayment);

    expect(createPaymentRefund).toBeCalledTimes(1);
    expect(createPaymentRefund).toBeCalledWith(paymentCreateRefundParams);
    expect(result.statusCode).toBe(201);
    expect(result.actions).toStrictEqual([
      {
        action: 'setTransactionCustomType',
        type: {
          key: CustomFieldName.transactions.defaultCustomTypeKey,
        },
        transactionId: 'test_refund',
        fields: {
          [CustomFieldName.transactions.fields.molliePaymentIdToRefund.name]: targetedMolliePaymentId,
        },
      },
      {
        action: 'changeTransactionInteractionId',
        transactionId: 'test_refund',
        interactionId: 'fake_refund_id',
      },
      {
        action: 'changeTransactionState',
        transactionId: 'test_refund',
        state: 'Pending',
      },
    ]);
  });

  it('should return status code and array of actions (more than 1 success charge transaction, with Mollie payment that need to be refunded is specified)', async () => {
    const targetedMolliePaymentId = 'tr_123123';

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
      transactions: [
        {
          id: uuid,
          type: 'Charge',
          interactionId: targetedMolliePaymentId,
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Success',
        },
        {
          id: 'test-123',
          type: 'Charge',
          interactionId: 'tr_123456',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Success',
        },
        {
          id: 'test_refund',
          type: 'Refund',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Initial',
          custom: {
            type: {
              typeId: 'type',
              id: 'custom-type-id',
            },
            fields: {
              [CustomFieldName.transactions.fields.molliePaymentIdToRefund.name]: targetedMolliePaymentId,
            },
          },
        },
      ],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'creditcard',
      },
    };

    (changeTransactionState as jest.Mock).mockReturnValueOnce({
      action: 'changeTransactionState',
      state: 'Pending',
      transactionId: 'test_refund',
    });

    (createPaymentRefund as jest.Mock).mockReturnValue({
      id: 'fake_refund_id',
    });

    const paymentCreateRefundParams: CreateParameters = {
      paymentId: targetedMolliePaymentId,
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
    };

    const result = await handleCreateRefund(CTPayment);

    expect(createPaymentRefund).toBeCalledTimes(1);
    expect(createPaymentRefund).toBeCalledWith(paymentCreateRefundParams);
    expect(result.statusCode).toBe(201);
    expect(result.actions).toStrictEqual([
      {
        action: 'changeTransactionInteractionId',
        transactionId: 'test_refund',
        interactionId: 'fake_refund_id',
      },
      {
        action: 'changeTransactionState',
        transactionId: 'test_refund',
        state: 'Pending',
      },
    ]);
  });
});

describe('Test getPaymentCancelActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return an array of actions', async () => {
    const customFieldValue = {
      reasonText: 'dummy1',
      test: 'test123',
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
      transactions: [
        {
          id: '5c8b0375-305a-4f19-ae8e-07806b101999',
          type: 'Refund',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Pending',
        },
        {
          id: '5c8b0375-305a-4f19-ae8e-07806b101929',
          type: 'CancelAuthorization',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Initial',
          custom: {
            type: {
              typeId: 'type',
              id: 'sctm_payment_cancel_reason',
            },
            fields: {
              reasonText: customFieldValue.reasonText,
            },
          },
        },
      ],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'creditcard',
      },
    };

    (getPaymentCancelActions as jest.Mock).mockImplementationOnce(() => {
      const paymentService = jest.requireActual(
        '../../src/service/payment.service.ts',
      ) as typeof import('../../src/service/payment.service.ts');
      return paymentService.getPaymentCancelActions(CTPayment.transactions[0], CTPayment.transactions[1]);
    });

    (changeTransactionState as jest.Mock).mockReturnValueOnce({
      action: 'changeTransactionState',
      state: 'Failure',
      transactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
    });
    (changeTransactionState as jest.Mock).mockReturnValueOnce({
      action: 'changeTransactionState',
      state: 'Success',
      transactionId: '5c8b0375-305a-4f19-ae8e-07806b101929',
    });

    const actual = getPaymentCancelActions(CTPayment.transactions[0], CTPayment.transactions[1]);
    expect(actual).toHaveLength(3);

    expect(actual[0]).toEqual({
      action: 'changeTransactionState',
      transactionId: CTPayment.transactions[0].id,
      state: CTTransactionState.Failure,
    });

    expect(actual[1]).toEqual({
      action: 'changeTransactionState',
      transactionId: CTPayment.transactions[1].id,
      state: CTTransactionState.Success,
    });

    expect(actual[2]).toEqual({
      action: 'setTransactionCustomType',
      type: {
        key: CustomFieldName.transactions.defaultCustomTypeKey,
      },
      transactionId: CTPayment.transactions[0].id,
      fields: {
        reasonText: customFieldValue.reasonText,
        statusText: CancelStatusText,
      },
    });
  });
});

describe('Test handlePaymentCancelRefund', () => {
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
    transactions: [
      {
        id: '5c8b0375-305a-4f19-ae8e-07806b101999',
        type: 'Charge',
        interactionId: 'tr_123123',
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 1000,
          fractionDigits: 2,
        },
        state: 'Success',
      },
      {
        id: '5c8b0375-305a-4f19-ae8e-07806b102000',
        type: 'Refund',
        interactionId: 're_4qqhO89gsT',
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 1000,
          fractionDigits: 2,
        },
        state: 'Pending',
      },
      {
        id: '5c8b0375-305a-4f19-ae8e-07806b102000',
        type: 'CancelAuthorization',
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 1000,
          fractionDigits: 2,
        },
        state: 'Initial',
        custom: {
          type: {
            typeId: 'type',
            id: 'sctm_payment_cancel_reason',
          },
          fields: {
            reasonText: 'dummy reason',
          },
        },
      },
    ],
    interfaceInteractions: [],
    paymentMethodInfo: {
      method: 'creditcard',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error if the Mollie Refund status is not queued nor pending', async () => {
    const mollieRefund: Refund = {
      resource: 'refund',
      id: CTPayment.transactions[1].interactionId,
      description: 'Order',
      amount: {
        currency: 'EUR',
        value: '5.95',
      },
      status: 'failed',
      metadata: '{"bookkeeping_id":12345}',
      paymentId: 'tr_7UhSN1zuXS',
      createdAt: '2023-03-14T17:09:02.0Z',
      _links: {
        self: {
          href: '...',
          type: 'application/hal+json',
        },
        payment: {
          href: 'https://api.mollie.com/v2/payments/tr_7UhSN1zuXS',
          type: 'application/hal+json',
        },
        documentation: {
          href: '...',
          type: 'text/html',
        },
      },
    } as Refund;

    (getPaymentRefund as jest.Mock).mockReturnValueOnce(mollieRefund);

    try {
      await handlePaymentCancelRefund(CTPayment);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        `SCTM - handleCancelRefund - Mollie refund status must be queued or pending, refund ID: ${mollieRefund.id}`,
      );
    }
  });

  it('should return status code and array of actions (interactionId is not defined in the Initial CancelAuthorization transaction)', async () => {
    const mollieRefund: Refund = {
      resource: 'refund',
      id: CTPayment.transactions[1].interactionId,
      description: 'Order',
      amount: {
        currency: 'EUR',
        value: '5.95',
      },
      status: 'pending',
      metadata: '{"bookkeeping_id":12345}',
      paymentId: 'tr_7UhSN1zuXS',
      createdAt: '2023-03-14T17:09:02.0Z',
      _links: {
        self: {
          href: '...',
          type: 'application/hal+json',
        },
        payment: {
          href: 'https://api.mollie.com/v2/payments/tr_7UhSN1zuXS',
          type: 'application/hal+json',
        },
        documentation: {
          href: '...',
          type: 'text/html',
        },
      },
    } as Refund;

    (getPaymentRefund as jest.Mock).mockReturnValueOnce(mollieRefund);

    (cancelPaymentRefund as jest.Mock).mockReturnValueOnce(true);

    (getPaymentCancelActions as jest.Mock).mockReturnValueOnce([]);

    await handlePaymentCancelRefund(CTPayment);

    expect(getPaymentRefund).toBeCalledTimes(1);
    expect(getPaymentRefund).toBeCalledWith(mollieRefund.id, {
      paymentId: CTPayment.transactions[0].interactionId,
    });
    expect(cancelPaymentRefund).toBeCalledTimes(1);
    expect(cancelPaymentRefund).toBeCalledWith(mollieRefund.id, {
      paymentId: CTPayment.transactions[0].interactionId,
    });
  });

  it('should return status code and array of actions (interactionId is defined in the Initial CancelAuthorization transaction)', async () => {
    const CTPaymentMocked: Payment = {
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
      transactions: [
        {
          id: '5c8b0375-305a-4f19-ae8e-07806b101992',
          type: 'Charge',
          interactionId: 'tr_test',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Success',
        },
        {
          id: '5c8b0375-305a-4f19-ae8e-07806b101999',
          type: 'Charge',
          interactionId: 'tr_123123',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Success',
        },
        {
          id: '5c8b0375-305a-4f19-ae8e-07806b102011',
          type: 'Refund',
          interactionId: 're_TEST',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Pending',
        },
        {
          id: '5c8b0375-305a-4f19-ae8e-07806b102000',
          type: 'Refund',
          interactionId: 're_4qqhO89gsT',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Pending',
          custom: {
            type: {
              typeId: 'type',
              id: 'custom-type',
            },
            fields: {
              [CustomFieldName.transactions.fields.molliePaymentIdToRefund.name]: 'tr_123123',
            },
          },
        },
        {
          id: '5c8b0375-305a-4f19-ae8e-07806b102000',
          type: 'CancelAuthorization',
          interactionId: 're_4qqhO89gsT',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Initial',
          custom: {
            type: {
              typeId: 'type',
              id: 'sctm_payment_cancel_reason',
            },
            fields: {
              reasonText: 'dummy reason',
            },
          },
        },
      ],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'creditcard',
      },
    };

    const mollieRefund: Refund = {
      resource: 'refund',
      id: CTPaymentMocked.transactions[3].interactionId,
      description: 'Order',
      amount: {
        currency: 'EUR',
        value: '5.95',
      },
      status: 'pending',
      metadata: '{"bookkeeping_id":12345}',
      paymentId: 'tr_7UhSN1zuXS',
      createdAt: '2023-03-14T17:09:02.0Z',
      _links: {
        self: {
          href: '...',
          type: 'application/hal+json',
        },
        payment: {
          href: 'https://api.mollie.com/v2/payments/tr_7UhSN1zuXS',
          type: 'application/hal+json',
        },
        documentation: {
          href: '...',
          type: 'text/html',
        },
      },
    } as Refund;

    (getPaymentRefund as jest.Mock).mockReturnValueOnce(mollieRefund);

    (cancelPaymentRefund as jest.Mock).mockReturnValueOnce(true);

    (getPaymentCancelActions as jest.Mock).mockReturnValueOnce([]);

    await handlePaymentCancelRefund(CTPaymentMocked);

    expect(getPaymentRefund).toBeCalledTimes(1);
    expect(getPaymentRefund).toBeCalledWith(CTPaymentMocked.transactions[3].interactionId, {
      paymentId: CTPaymentMocked.transactions[1].interactionId,
    });
    expect(cancelPaymentRefund).toBeCalledTimes(1);
    expect(cancelPaymentRefund).toBeCalledWith(CTPaymentMocked.transactions[3].interactionId, {
      paymentId: CTPaymentMocked.transactions[1].interactionId,
    });
  });

  it('should throw error if valid Success Charge transaction was not found (interactionId is defined in the Initial CancelAuthorization transaction)', async () => {
    const CTPaymentMocked: Payment = {
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
      transactions: [
        {
          id: '5c8b0375-305a-4f19-ae8e-07806b101992',
          type: 'Charge',
          interactionId: 'tr_test123123',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Success',
        },
        {
          id: '5c8b0375-305a-4f19-ae8e-07806b101999',
          type: 'Charge',
          interactionId: 'tr_dummy',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Success',
        },
        {
          id: '5c8b0375-305a-4f19-ae8e-07806b102011',
          type: 'Refund',
          interactionId: 're_TEST',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Pending',
        },
        {
          id: '5c8b0375-305a-4f19-ae8e-07806b102000',
          type: 'Refund',
          interactionId: 're_4qqhO89gsT',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Pending',
          custom: {
            type: {
              typeId: 'type',
              id: 'custom-type',
            },
            fields: {
              [CustomFieldName.transactions.fields.molliePaymentIdToRefund.name]: 'tr_123123',
            },
          },
        },
        {
          id: '5c8b0375-305a-4f19-ae8e-07806b102000',
          type: 'CancelAuthorization',
          interactionId: 're_4qqhO89gsT',
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
          state: 'Initial',
          custom: {
            type: {
              typeId: 'type',
              id: 'sctm_payment_cancel_reason',
            },
            fields: {
              reasonText: 'dummy reason',
            },
          },
        },
      ],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'creditcard',
      },
    };

    const mollieRefund: Refund = {
      resource: 'refund',
      id: CTPaymentMocked.transactions[3].interactionId,
      description: 'Order',
      amount: {
        currency: 'EUR',
        value: '5.95',
      },
      status: 'pending',
      metadata: '{"bookkeeping_id":12345}',
      paymentId: 'tr_7UhSN1zuXS',
      createdAt: '2023-03-14T17:09:02.0Z',
      _links: {
        self: {
          href: '...',
          type: 'application/hal+json',
        },
        payment: {
          href: 'https://api.mollie.com/v2/payments/tr_7UhSN1zuXS',
          type: 'application/hal+json',
        },
        documentation: {
          href: '...',
          type: 'text/html',
        },
      },
    } as Refund;

    (getPaymentRefund as jest.Mock).mockReturnValueOnce(mollieRefund);

    (cancelPaymentRefund as jest.Mock).mockReturnValueOnce(true);

    (getPaymentCancelActions as jest.Mock).mockReturnValueOnce([]);

    try {
      await handlePaymentCancelRefund(CTPaymentMocked);
    } catch (error: any) {
      expect(getPaymentRefund).toBeCalledTimes(0);
      expect(cancelPaymentRefund).toBeCalledTimes(0);

      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).message).toBe(
        'SCTM - handlePaymentCancelRefund - Cannot find the valid Success Charge transaction.',
      );
    }
  });
});

describe('Test handlePaymentWebhook', () => {
  it('should handle with no action', async () => {
    const fakePaymentId = 'tr_XXXX';
    (getPaymentById as jest.Mock).mockReturnValue({
      id: fakePaymentId,
      status: 'open',
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
    });
    (getPaymentByMolliePaymentId as jest.Mock).mockReturnValue({
      transactions: [
        {
          interactionId: fakePaymentId,
          state: 'Initial',
        },
      ],
    });
    await handlePaymentWebhook(fakePaymentId);
    expect(logger.debug).toBeCalledTimes(2);
    expect(logger.debug).toBeCalledWith(`SCTM - handlePaymentWebhook - paymentId:${fakePaymentId}`);
    expect(logger.debug).toBeCalledWith(`handlePaymentWebhook - No actions needed`);
  });

  it('should return false if the targeted status is canceled and commercetools pendingChargeTransaction is not found', async () => {
    const fakePaymentId = 'tr_XXXX';
    (getPaymentById as jest.Mock).mockReturnValue({
      id: fakePaymentId,
      status: 'canceled',
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
      captureMode: 'manual',
    });
    const ctPayment = {
      id: 'payment-id',
      transactions: [],
    };
    (getPaymentByMolliePaymentId as jest.Mock).mockReturnValue(ctPayment);

    (changeTransactionState as jest.Mock).mockReturnValueOnce({
      action: 'changeTransactionState',
      transactionId: '12345',
      state: 'Failure',
    });
    (changeTransactionState as jest.Mock).mockReturnValueOnce({
      action: 'changeTransactionState',
      transactionId: '12346',
      state: 'Success',
    });

    const result = await handlePaymentWebhook(fakePaymentId);

    expect(result).toBe(false);
    expect(logger.warn).toBeCalledTimes(1);
    expect(logger.warn).toBeCalledWith(
      `SCTM - handlePaymentWebhook - Pending Charge transaction or Initial CancelAuthorization transaction is not found, CommerceTools Payment ID: ${ctPayment.id}`,
    );
  });

  it('should return false if the targeted status is canceled and commercetools initialCancelAuthorizationTransaction is not found', async () => {
    const fakePaymentId = 'tr_XXXX';
    (getPaymentById as jest.Mock).mockReturnValue({
      id: fakePaymentId,
      status: 'canceled',
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
      captureMode: 'manual',
    });
    const ctPayment = {
      id: 'payment-id',
      transactions: [],
    };
    (getPaymentByMolliePaymentId as jest.Mock).mockReturnValue(ctPayment);
    const result = await handlePaymentWebhook(fakePaymentId);

    expect(result).toBe(false);
    expect(logger.warn).toBeCalledTimes(1);
    expect(logger.warn).toBeCalledWith(
      `SCTM - handlePaymentWebhook - Pending Charge transaction or Initial CancelAuthorization transaction is not found, CommerceTools Payment ID: ${ctPayment.id}`,
    );
  });

  it('should return true and perform update with specific actions if the targeted status is canceled', async () => {
    const cartService = require('../../src/service/cart.service');

    jest.spyOn(cartService, 'removeCartMollieCustomLineItem');

    const fakePaymentId = 'tr_XXXX';
    (getPaymentById as jest.Mock).mockReturnValue({
      id: fakePaymentId,
      status: 'canceled',
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
      captureMode: 'manual',
    });
    const ctPayment = {
      id: 'payment-id',
      transactions: [
        {
          id: '12345',
          type: 'Charge',
          state: 'Pending',
        },
        {
          id: '12346',
          type: 'CancelAuthorization',
          state: 'Initial',
          custom: {
            type: {
              typeId: 'type',
              id: 'sctm_payment_cancel_reason',
            },
            fields: {
              reasonText: 'Dummy reason',
            },
          },
        },
      ],
    };
    (getPaymentByMolliePaymentId as jest.Mock).mockReturnValue(ctPayment);
    const result = await handlePaymentWebhook(fakePaymentId);

    expect(result).toBe(true);
    expect(logger.warn).toBeCalledTimes(0);

    const actions = [
      {
        action: 'changeTransactionState',
        transactionId: ctPayment.transactions[0].id,
        state: 'Failure',
      },
      {
        action: 'changeTransactionState',
        transactionId: ctPayment.transactions[1].id,
        state: 'Success',
      },
      {
        action: 'setTransactionCustomType',
        type: {
          key: CustomFieldName.transactions.defaultCustomTypeKey,
        },
        fields: {
          reasonText: ctPayment.transactions[1].custom?.fields.reasonText,
          statusText: CancelStatusText,
        },
        transactionId: ctPayment.transactions[0].id,
      },
    ];

    expect(logger.info).toBeCalledWith(`handlePaymentWebhook - actions:${JSON.stringify(actions)}`);

    expect(updatePayment).toBeCalledTimes(1);
    expect(updatePayment).toBeCalledWith(ctPayment, actions);

    expect(removeCartMollieCustomLineItem).toBeCalledTimes(1);
  });

  it('should handle for manual capture payment', async () => {
    const fakePaymentId = 'tr_XXXX';
    (getPaymentById as jest.Mock).mockReturnValue({
      id: fakePaymentId,
      status: 'authorized',
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
      captureMode: 'manual',
    });
    const ctPayment = {
      transactions: [],
    };
    (getPaymentByMolliePaymentId as jest.Mock).mockReturnValue(ctPayment);
    (makeCTMoney as jest.Mock).mockReturnValueOnce({
      centAmount: 1000,
      currencyCode: 'EUR',
      fractionDigits: 2,
      type: 'centPrecision',
    });
    await handlePaymentWebhook(fakePaymentId);
    expect(updatePayment as jest.Mock).toBeCalledTimes(1);
    expect(updatePayment as jest.Mock).toBeCalledWith(ctPayment, [
      {
        action: 'addTransaction',
        transaction: {
          amount: { centAmount: 1000, currencyCode: 'EUR', fractionDigits: 2, type: 'centPrecision' },
          interactionId: 'tr_XXXX',
          state: 'Success',
          type: 'Authorization',
        },
      },
    ]);
  });

  it('should handle with add action', async () => {
    const fakePaymentId = 'tr_XXXX';
    (getPaymentById as jest.Mock).mockReturnValue({
      id: fakePaymentId,
      status: 'open',
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
    });
    const ctPayment = {
      transactions: [],
    };
    (getPaymentByMolliePaymentId as jest.Mock).mockReturnValue(ctPayment);
    (makeCTMoney as jest.Mock).mockReturnValueOnce({
      centAmount: 1000,
      currencyCode: 'EUR',
      fractionDigits: 2,
      type: 'centPrecision',
    });
    await handlePaymentWebhook(fakePaymentId);
    expect(updatePayment as jest.Mock).toBeCalledTimes(1);
    expect(updatePayment as jest.Mock).toBeCalledWith(ctPayment, [
      {
        action: 'addTransaction',
        transaction: {
          amount: { centAmount: 1000, currencyCode: 'EUR', fractionDigits: 2, type: 'centPrecision' },
          interactionId: 'tr_XXXX',
          state: 'Initial',
          type: 'Charge',
        },
      },
    ]);
  });

  it('should handle with update action', async () => {
    const fakePaymentId = 'tr_XXXX';
    (getPaymentById as jest.Mock).mockReturnValue({
      id: fakePaymentId,
      status: 'paid',
      amount: {
        currency: 'EUR',
        value: '10.00',
      },
    });
    const ctPayment = {
      transactions: [
        {
          id: 'test',
          interactionId: fakePaymentId,
          state: 'Initial',
        },
      ],
    };
    (getPaymentByMolliePaymentId as jest.Mock).mockReturnValue(ctPayment);
    (changeTransactionState as jest.Mock).mockReturnValueOnce({
      action: 'changeTransactionState',
      state: 'Success',
      transactionId: 'test',
    });
    await handlePaymentWebhook(fakePaymentId);
    expect(updatePayment as jest.Mock).toBeCalledTimes(1);
    expect(updatePayment as jest.Mock).toBeCalledWith(ctPayment, [
      {
        action: 'changeTransactionState',
        transactionId: 'test',
        state: 'Success',
      },
    ]);
  });
});

describe('Test handleCancelPayment', () => {
  const customFieldReason = {
    reasonText: 'Cancel payment reason',
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
    transactions: [
      {
        id: '5c8b0375-305a-4f19-ae8e-07806b101999',
        type: 'Charge',
        interactionId: 'tr_123123',
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 1000,
          fractionDigits: 2,
        },
        state: 'Success',
      },
      {
        id: '5c8b0375-305a-4f19-ae8e-07806b101999',
        type: 'Authorization',
        interactionId: 'tr_123123',
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 1000,
          fractionDigits: 2,
        },
        state: 'Success',
      },
      {
        id: '5c8b0375-305a-4f19-ae8e-07806b102000',
        type: 'CancelAuthorization',
        interactionId: 're_4qqhO89gsT',
        amount: {
          type: 'centPrecision',
          currencyCode: 'EUR',
          centAmount: 1000,
          fractionDigits: 2,
        },
        state: 'Initial',
        custom: {
          type: {
            typeId: 'type',
            id: 'sctm_payment_cancel_reason',
          },
          fields: {
            reasonText: customFieldReason.reasonText,
          },
        },
      },
    ],
    interfaceInteractions: [],
    paymentMethodInfo: {
      method: 'creditcard',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if the Mollie Payment is not cancelable', async () => {
    const molliePayment: molliePayment = {
      resource: 'payment',
      id: 'tr_7UhSN1zuXS',
      mode: 'live',
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
      description: 'Order #12345',
      sequenceType: 'oneoff',
      redirectUrl: 'https://webshop.example.org/order/12345/',
      webhookUrl: 'https://webshop.example.org/payments/webhook/',
      metadata: '{"order_id":12345}',
      profileId: 'pfl_QkEhN94Ba',
      status: 'open',
      isCancelable: false,
      createdAt: '2024-03-20T09:13:37+00:00',
      expiresAt: '2024-03-20T09:28:37+00:00',
      _links: {
        checkout: {
          href: 'https://www.mollie.com/checkout/select-method/7UhSN1zuXS',
          type: 'text/html',
        },
      },
    } as molliePayment;

    (getPaymentById as jest.Mock).mockReturnValueOnce(molliePayment);

    try {
      await handleCancelPayment(CTPayment);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).statusCode).toBe(400);
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        `SCTM - handleCancelPayment - Payment is not cancelable, Mollie Payment ID: ${molliePayment.id}`,
        {
          molliePaymentId: molliePayment.id,
          commerceToolsPaymentId: CTPayment.id,
        },
      );
    }
  });

  it('should return status code and array of actions', async () => {
    const cartService = require('../../src/service/cart.service');

    jest.spyOn(cartService, 'removeCartMollieCustomLineItem');

    const molliePayment: molliePayment = {
      resource: 'payment',
      id: 'tr_7UhSN1zuXS',
      mode: 'live',
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
      description: 'Order #12345',
      sequenceType: 'oneoff',
      redirectUrl: 'https://webshop.example.org/order/12345/',
      webhookUrl: 'https://webshop.example.org/payments/webhook/',
      metadata: '{"order_id":12345}',
      profileId: 'pfl_QkEhN94Ba',
      status: 'open',
      isCancelable: true,
      createdAt: '2024-03-20T09:13:37+00:00',
      expiresAt: '2024-03-20T09:28:37+00:00',
      _links: {
        checkout: {
          href: 'https://www.mollie.com/checkout/select-method/7UhSN1zuXS',
          type: 'text/html',
        },
      },
    } as molliePayment;

    (getPaymentById as jest.Mock).mockReturnValueOnce(molliePayment);

    (cancelPayment as jest.Mock).mockReturnValueOnce(molliePayment);

    const actual = await handleCancelPayment(CTPayment);

    expect(getPaymentById).toBeCalledTimes(1);
    expect(getPaymentById).toBeCalledWith(CTPayment.transactions[0].interactionId);
    expect(cancelPayment).toBeCalledTimes(1);
    expect(cancelPayment).toBeCalledWith(molliePayment.id);

    expect(removeCartMollieCustomLineItem).toBeCalledTimes(1);

    expect(actual).toEqual({
      statusCode: 200,
      actions: [],
    });
  });

  it('should return status code for release klarna authorization payment', async () => {
    const cartService = require('../../src/service/cart.service');

    jest.spyOn(cartService, 'removeCartMollieCustomLineItem');

    const molliePayment: molliePayment = {
      resource: 'payment',
      id: 'tr_7UhSN1zuXS',
      mode: 'live',
      amount: {
        value: '10.00',
        currency: 'EUR',
      },
      description: 'Order #12345',
      sequenceType: 'oneoff',
      redirectUrl: 'https://webshop.example.org/order/12345/',
      webhookUrl: 'https://webshop.example.org/payments/webhook/',
      metadata: '{"order_id":12345}',
      profileId: 'pfl_QkEhN94Ba',
      status: 'authorized',
      method: 'klarna',
      createdAt: '2024-03-20T09:13:37+00:00',
      expiresAt: '2024-03-20T09:28:37+00:00',
      _links: {
        checkout: {
          href: 'https://www.mollie.com/checkout/select-method/7UhSN1zuXS',
          type: 'text/html',
        },
      },
    } as molliePayment;

    (getPaymentById as jest.Mock).mockReturnValueOnce(molliePayment);

    (releaseAuthorizationPayment as jest.Mock).mockReturnValueOnce(molliePayment);

    const actual = await handleCancelPayment(CTPayment);

    expect(getPaymentById).toBeCalledTimes(1);
    expect(getPaymentById).toBeCalledWith(CTPayment.transactions[0].interactionId);
    expect(releaseAuthorizationPayment).toBeCalledTimes(1);
    expect(releaseAuthorizationPayment).toBeCalledWith(molliePayment.id);

    expect(actual).toEqual({
      statusCode: 200,
      actions: [],
    });
  });
});

describe('Test handleGetApplePaySession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle with update action', async () => {
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
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'applepay',
      },
      transactions: [],
      custom: {
        type: {
          typeId: 'type',
          key: 'sctm-payment-custom-type',
        },
        fields: {
          sctm_apple_pay_session_request: JSON.stringify({
            domain: 'pay.mywebshop.com',
            validationUrl: 'https://apple-pay-gateway-cert.apple.com/paymentservices/paymentSession',
          }),
        },
      } as unknown as CustomFields,
    };

    (getApplePaySession as jest.Mock).mockImplementationOnce(() => {
      return {
        domain: 'pay.mywebshop.com',
        validationUrl: 'https://apple-pay-gateway-cert.apple.com/paymentservices/paymentSession',
      };
    });
    const response = await handleGetApplePaySession(CTPayment);

    expect(response.statusCode).toBe(200);
    expect(response.actions).toEqual([
      {
        action: 'setCustomField',
        name: 'sctm_apple_pay_session_response',
        value:
          '{"domain":"pay.mywebshop.com","validationUrl":"https://apple-pay-gateway-cert.apple.com/paymentservices/paymentSession"}',
      },
      {
        action: 'setCustomField',
        name: 'sctm_apple_pay_session_request',
        value: '',
      },
    ]);
  });

  describe('Test getRefundStatusUpdateActions', () => {
    const mockChangeTransactionState = changeTransactionState as jest.MockedFunction<typeof changeTransactionState>;
    const mockShouldRefundStatusUpdate = shouldRefundStatusUpdate as jest.MockedFunction<
      typeof shouldRefundStatusUpdate
    >;
    const mockMakeCTMoney = makeCTMoney as jest.MockedFunction<typeof makeCTMoney>;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update transaction state if matching transaction found and should update', () => {
      const ctTransactions: CTTransaction[] = [
        {
          id: '1',
          type: CTTransactionType.Refund,
          interactionId: 'refund1',
          state: CTTransactionState.Initial,
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
        },
      ];
      const mollieRefunds: Refund[] = [
        { id: 'refund1', status: RefundStatus.pending, amount: { currency: 'EUR', value: '10.00' } } as Refund,
      ];

      mockShouldRefundStatusUpdate.mockReturnValue(true);
      mockChangeTransactionState.mockReturnValue({ action: 'changeTransactionState' } as ChangeTransactionState);

      const result = getRefundStatusUpdateActions(ctTransactions, mollieRefunds);

      expect(result).toEqual([{ action: 'changeTransactionState' }]);
      expect(mockShouldRefundStatusUpdate).toHaveBeenCalledWith('pending', CTTransactionState.Initial);
      expect(mockChangeTransactionState).toHaveBeenCalledWith('1', mollieRefundToCTStatusMap['pending']);
    });

    it('should not update transaction state if matching transaction found but should not update', () => {
      const ctTransactions: CTTransaction[] = [
        {
          id: '1',
          type: CTTransactionType.Refund,
          interactionId: 'refund1',
          state: CTTransactionState.Initial,
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
        },
      ];
      const mollieRefunds: Refund[] = [
        { id: 'refund1', status: RefundStatus.pending, amount: { currency: 'EUR', value: '10.00' } } as Refund,
      ];

      mockShouldRefundStatusUpdate.mockReturnValue(false);

      const result = getRefundStatusUpdateActions(ctTransactions, mollieRefunds);

      expect(result).toEqual([]);
      expect(mockShouldRefundStatusUpdate).toHaveBeenCalledWith('pending', CTTransactionState.Initial);
      expect(mockChangeTransactionState).not.toHaveBeenCalled();
    });

    it('should add a new transaction if no matching transaction is found', () => {
      const ctTransactions: CTTransaction[] = [];
      const mollieRefunds: Refund[] = [
        { id: 'refund1', status: RefundStatus.pending, amount: { currency: 'EUR', value: '10.00' } } as Refund,
      ];

      mockMakeCTMoney.mockReturnValue({ currencyCode: 'EUR', centAmount: 1000 });

      const result = getRefundStatusUpdateActions(ctTransactions, mollieRefunds);

      expect(result).toEqual([
        {
          action: 'addTransaction',
          transaction: {
            type: CTTransactionType.Refund,
            amount: { currencyCode: 'EUR', centAmount: 1000 },
            interactionId: 'refund1',
            state: mollieRefundToCTStatusMap['pending'],
          },
        },
      ]);
      expect(mockMakeCTMoney).toHaveBeenCalledWith({ currency: 'EUR', value: '10.00' });
    });

    it('should handle multiple refunds and transactions correctly', () => {
      const ctTransactions: CTTransaction[] = [
        {
          id: '1',
          type: CTTransactionType.Refund,
          interactionId: 'refund1',
          state: CTTransactionState.Initial,
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 1000,
            fractionDigits: 2,
          },
        },
        {
          id: '2',
          type: CTTransactionType.Refund,
          interactionId: 'refund2',
          state: CTTransactionState.Initial,
          amount: {
            type: 'centPrecision',
            currencyCode: 'EUR',
            centAmount: 2000,
            fractionDigits: 2,
          },
        },
      ];
      const mollieRefunds: Refund[] = [
        { id: 'refund1', status: RefundStatus.pending, amount: { currency: 'EUR', value: '10.00' } } as Refund,
        { id: 'refund3', status: RefundStatus.refunded, amount: { currency: 'EUR', value: '20.00' } } as Refund,
      ];

      mockShouldRefundStatusUpdate.mockImplementation(
        (mollieStatus, ctState) => mollieStatus === 'pending' && ctState === CTTransactionState.Initial,
      );
      mockChangeTransactionState.mockReturnValue({
        action: 'changeTransactionState',
        state: mollieRefundToCTStatusMap['pending'],
        transactionId: '1',
      } as ChangeTransactionState);
      mockMakeCTMoney.mockImplementation((amount) => ({
        currencyCode: amount.currency,
        centAmount: Number(amount.value) * 100,
      }));

      const result = getRefundStatusUpdateActions(ctTransactions, mollieRefunds);

      expect(result).toEqual([
        {
          action: 'changeTransactionState',
          state: mollieRefundToCTStatusMap['pending'],
          transactionId: '1',
        },
        {
          action: 'addTransaction',
          transaction: {
            type: CTTransactionType.Refund,
            amount: { currencyCode: 'EUR', centAmount: 2000 },
            interactionId: 'refund3',
            state: 'Success',
          },
        },
      ]);
      expect(mockChangeTransactionState).toHaveBeenCalledWith('1', mollieRefundToCTStatusMap['pending']);
      expect(mockMakeCTMoney).toHaveBeenCalledWith({ currency: 'EUR', value: '20.00' });
    });
  });

  describe('Test handleCapturePayment', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return status code and array of actions', async () => {
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
        transactions: [
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101999',
            type: 'Charge',
            amount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 1000,
              fractionDigits: 2,
            },
            state: 'Pending',
            interactionId: 'tr_7UhSN1zuXS',
            custom: {
              fields: {
                [CustomFieldName.transactions.fields.shouldCapturePayment.name]: true,
              },
            } as unknown as CustomFields,
          },
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101299',
            type: 'Authorization',
            amount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 1000,
              fractionDigits: 2,
            },
            state: 'Success',
            interactionId: 'tr_7UhSN1zuXS',
          },
        ],
        interfaceInteractions: [],
        paymentMethodInfo: {
          method: 'creditcard',
        },
      };

      const molliePayment: molliePayment = {
        resource: 'payment',
        id: 'tr_7UhSN1zuXS',
        mode: 'live',
        amount: {
          value: '10.00',
          currency: 'EUR',
        },
        description: 'Order #12345',
        sequenceType: 'oneoff',
        redirectUrl: 'https://webshop.example.org/order/12345/',
        webhookUrl: 'https://webshop.example.org/payments/webhook/',
        metadata: '{"order_id":12345}',
        profileId: 'pfl_QkEhN94Ba',
        captureMode: 'manual',
        status: 'authorized',
        isCancelable: true,
        createdAt: '2024-03-20T09:13:37+00:00',
        expiresAt: '2024-03-20T09:28:37+00:00',
        _links: {
          checkout: {
            href: 'https://www.mollie.com/checkout/select-method/7UhSN1zuXS',
            type: 'text/html',
          },
        },
      } as molliePayment;

      const createCaptureParams: CreateCaptureParameters = {
        paymentId: molliePayment.id,
        amount: molliePayment.amount,
        description: '',
      };

      const ctActions = [
        {
          action: 'changeTransactionState',
          state: 'Success',
          transactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
        },
      ];

      (getPaymentById as jest.Mock).mockReturnValueOnce(molliePayment);

      (createCapturePayment as jest.Mock).mockReturnValueOnce({
        resource: 'capture',
        id: 'cpt_EfcGLXjfSJLFcKJPwhg4J',
        mode: 'test',
        amount: {
          value: '116.99',
          currency: 'EUR',
        },
        status: 'pending',
        createdAt: '2025-02-17T04:50:18+00:00',
        description: 'Test capture api',
        paymentId: 'tr_hveLpm4TrJ',
        _links: {
          self: {
            href: 'https://api.mollie.com/v2/payments/tr_hveLpm4TrJ/captures/cpt_EfcGLXjfSJLFcKJPwhg4J',
            type: 'application/hal+json',
          },
          payment: {
            href: 'https://api.mollie.com/v2/payments/tr_hveLpm4TrJ',
            type: 'application/hal+json',
          },
          documentation: {
            href: 'https://docs.mollie.com/reference/v2/captures-api/create-capture',
            type: 'text/html',
          },
        },
      });

      (changeTransactionState as jest.Mock).mockReturnValueOnce(ctActions[0]);

      const actual = await handleCapturePayment(CTPayment);

      expect(getPaymentById).toBeCalledTimes(1);
      expect(getPaymentById).toBeCalledWith(CTPayment.transactions[0].interactionId);
      expect(createCapturePayment).toBeCalledTimes(1);
      expect(createCapturePayment).toBeCalledWith(createCaptureParams);

      expect(actual).toEqual({
        statusCode: 200,
        actions: ctActions,
      });
      expect(logger.debug).toBeCalledTimes(1);
    });

    test('should throw error when no pending charge transaction found ', async () => {
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
        transactions: [
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101299',
            type: 'Athorization',
            amount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 1000,
              fractionDigits: 2,
            },
            state: 'Success',
            interactionId: 'tr_7UhSN1zuXS',
          },
        ],
        interfaceInteractions: [],
        paymentMethodInfo: {
          method: 'creditcard',
        },
      };

      await expect(handleCapturePayment(CTPayment)).rejects.toThrow(
        new CustomError(400, 'SCTM - handleCapturePayment - Pending charge transaction is not found.'),
      );
      expect(logger.error).toBeCalledTimes(1);
    });

    test('should update transaction status to success when mollie payment already paid ', async () => {
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
        transactions: [
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101999',
            type: 'Charge',
            amount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 1000,
              fractionDigits: 2,
            },
            state: 'Pending',
            interactionId: 'tr_7UhSN1zuXS',
            custom: {
              fields: {
                [CustomFieldName.transactions.fields.shouldCapturePayment.name]: true,
              },
            } as unknown as CustomFields,
          },
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101299',
            type: 'Athorization',
            amount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 1000,
              fractionDigits: 2,
            },
            state: 'Success',
            interactionId: 'tr_7UhSN1zuXS',
          },
        ],
        interfaceInteractions: [],
        paymentMethodInfo: {
          method: 'creditcard',
        },
      };

      const molliePayment: molliePayment = {
        resource: 'payment',
        id: 'tr_7UhSN1zuXS',
        mode: 'live',
        amount: {
          value: '10.00',
          currency: 'EUR',
        },
        description: 'Order #12345',
        sequenceType: 'oneoff',
        redirectUrl: 'https://webshop.example.org/order/12345/',
        webhookUrl: 'https://webshop.example.org/payments/webhook/',
        metadata: '{"order_id":12345}',
        profileId: 'pfl_QkEhN94Ba',
        captureMode: 'manual',
        status: 'paid',
        isCancelable: true,
        createdAt: '2024-03-20T09:13:37+00:00',
        expiresAt: '2024-03-20T09:28:37+00:00',
        _links: {
          checkout: {
            href: 'https://www.mollie.com/checkout/select-method/7UhSN1zuXS',
            type: 'text/html',
          },
        },
      } as molliePayment;

      (getPaymentById as jest.Mock).mockReturnValueOnce(molliePayment);

      (changeTransactionState as jest.Mock).mockReturnValueOnce({
        action: 'changeTransactionState',
        state: 'Success',
        transactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
      });

      await expect(handleCapturePayment(CTPayment)).resolves.toEqual({
        statusCode: 200,
        actions: [
          {
            action: 'changeTransactionState',
            state: 'Success',
            transactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
          },
        ],
      });
      expect(logger.error).toBeCalledTimes(1);
    });

    test('should throw error when mollie payment is not valid (captureMode != manual or state != authorized)', async () => {
      const CTPayment: Payment = {
        id: '5c8b0375-305a-3f19-ae8e-07806b101999',
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
        transactions: [
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101999',
            type: 'Charge',
            amount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 1000,
              fractionDigits: 2,
            },
            state: 'Pending',
            interactionId: 'tr_7UhSN2zuXS',
            custom: {
              fields: {
                [CustomFieldName.transactions.fields.shouldCapturePayment.name]: true,
              },
            } as unknown as CustomFields,
          },
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101299',
            type: 'Athorization',
            amount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 1000,
              fractionDigits: 2,
            },
            state: 'Success',
            interactionId: 'tr_7UhSN2zuXS',
          },
        ],
        interfaceInteractions: [],
        paymentMethodInfo: {
          method: 'creditcard',
        },
      };

      const molliePayment: molliePayment = {
        resource: 'payment',
        id: 'tr_7UhSN2zuXS',
        mode: 'live',
        amount: {
          value: '10.00',
          currency: 'EUR',
        },
        description: 'Order #12345',
        sequenceType: 'oneoff',
        redirectUrl: 'https://webshop.example.org/order/12345/',
        webhookUrl: 'https://webshop.example.org/payments/webhook/',
        metadata: '{"order_id":12345}',
        profileId: 'pfl_QkEhN94Ba',
        captureMode: 'automatic',
        status: 'pending',
        isCancelable: true,
        createdAt: '2024-03-20T09:13:37+00:00',
        expiresAt: '2024-03-20T09:28:37+00:00',
        _links: {
          checkout: {
            href: 'https://www.mollie.com/checkout/select-method/7UhSN1zuXS',
            type: 'text/html',
          },
        },
      } as molliePayment;

      (getPaymentById as jest.Mock).mockReturnValueOnce(molliePayment);

      await expect(handleCapturePayment(CTPayment)).rejects.toThrow(
        new CustomError(
          400,
          `SCTM - handleCapturePayment - Payment is not authorized or capture mode is not manual, Mollie Payment ID: ${molliePayment.id}`,
        ),
      );
      expect(logger.error).toBeCalledTimes(1);
    });

    test('should throw error when mollie payment is not valid (captureMode != manual or state != authorized)', async () => {
      const CTPayment: Payment = {
        id: '5c8b0375-305a-3f19-ae8e-07806b101999',
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
        transactions: [
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101999',
            type: 'Charge',
            amount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 1000,
              fractionDigits: 2,
            },
            state: 'Pending',
            interactionId: 'tr_7UhSN2zuXS',
            custom: {
              fields: {
                [CustomFieldName.transactions.fields.shouldCapturePayment.name]: true,
              },
            } as unknown as CustomFields,
          },
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101299',
            type: 'Athorization',
            amount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 1000,
              fractionDigits: 2,
            },
            state: 'Success',
            interactionId: 'tr_7UhSN2zuXS',
          },
        ],
        interfaceInteractions: [],
        paymentMethodInfo: {
          method: 'creditcard',
        },
      };

      const molliePayment: molliePayment = {
        resource: 'payment',
        id: 'tr_7UhSN2zuXS',
        mode: 'live',
        amount: {
          value: '10.00',
          currency: 'EUR',
        },
        description: 'Order #12345',
        sequenceType: 'oneoff',
        redirectUrl: 'https://webshop.example.org/order/12345/',
        webhookUrl: 'https://webshop.example.org/payments/webhook/',
        metadata: '{"order_id":12345}',
        profileId: 'pfl_QkEhN94Ba',
        captureMode: 'automatic',
        status: 'pending',
        isCancelable: true,
        createdAt: '2024-03-20T09:13:37+00:00',
        expiresAt: '2024-03-20T09:28:37+00:00',
        _links: {
          checkout: {
            href: 'https://www.mollie.com/checkout/select-method/7UhSN1zuXS',
            type: 'text/html',
          },
        },
      } as molliePayment;

      (getPaymentById as jest.Mock).mockReturnValueOnce(molliePayment);

      await expect(handleCapturePayment(CTPayment)).rejects.toThrow(
        new CustomError(
          400,
          `SCTM - handleCapturePayment - Payment is not authorized or capture mode is not manual, Mollie Payment ID: ${molliePayment.id}`,
        ),
      );
      expect(logger.error).toBeCalledTimes(1);
    });

    test('should record errors when capturing failed', async () => {
      const CTPayment: Payment = {
        id: '5c8b0375-305a-3f19-ae8e-07806b101999',
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
        transactions: [
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101999',
            type: 'Charge',
            amount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 1000,
              fractionDigits: 2,
            },
            state: 'Pending',
            interactionId: 'tr_7UhSN2zuXS',
            custom: {
              fields: {
                [CustomFieldName.transactions.fields.shouldCapturePayment.name]: true,
              },
            } as unknown as CustomFields,
          },
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101299',
            type: 'Athorization',
            amount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 1000,
              fractionDigits: 2,
            },
            state: 'Success',
            interactionId: 'tr_7UhSN2zuXS',
          },
        ],
        interfaceInteractions: [],
        paymentMethodInfo: {
          method: 'creditcard',
        },
      };

      const molliePayment: molliePayment = {
        resource: 'payment',
        id: 'tr_7UhSN2zuXS',
        mode: 'live',
        amount: {
          value: '10.00',
          currency: 'EUR',
        },
        description: 'Order #12345',
        sequenceType: 'oneoff',
        redirectUrl: 'https://webshop.example.org/order/12345/',
        webhookUrl: 'https://webshop.example.org/payments/webhook/',
        metadata: '{"order_id":12345}',
        profileId: 'pfl_QkEhN94Ba',
        captureMode: 'manual',
        status: 'authorized',
        isCancelable: true,
        createdAt: '2024-03-20T09:13:37+00:00',
        expiresAt: '2024-03-20T09:28:37+00:00',
        _links: {
          checkout: {
            href: 'https://www.mollie.com/checkout/select-method/7UhSN1zuXS',
            type: 'text/html',
          },
        },
      } as molliePayment;

      (getPaymentById as jest.Mock).mockReturnValueOnce(molliePayment);

      (createCapturePayment as jest.Mock).mockReturnValueOnce(new CustomError(400, 'Capture failed'));

      (changeTransactionState as jest.Mock).mockReturnValueOnce({
        action: 'changeTransactionState',
        state: 'Failure',
        transactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
      });

      await expect(handleCapturePayment(CTPayment)).resolves.toEqual({
        statusCode: 400,
        actions: [
          {
            action: 'setTransactionCustomField',
            name: CustomFieldName.transactions.fields.capturePaymentErrors.name,
            value:
              '{"errorMessage":"Capture failed","submitData":{"paymentId":"tr_7UhSN2zuXS","amount":{"value":"10.00","currency":"EUR"},"description":""}}',
            transactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
          },
          {
            action: 'changeTransactionState',
            state: 'Failure',
            transactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
          },
        ],
      });
    });
  });
});
