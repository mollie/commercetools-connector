import { describe, test, jest, beforeEach, afterEach, expect, it } from '@jest/globals';
import { CustomFields, Payment } from '@commercetools/platform-sdk';
import {
  handlePaymentWebhook,
  getCreatePaymentUpdateAction,
  getPaymentCancelActions,
  handleCreatePayment,
  handleListPaymentMethodsByPayment,
  handleCreateRefund,
  handlePaymentCancelRefund,
  handleCancelPayment,
  handleGetApplePaySession,
} from '../../src/service/payment.service';
import { ControllerResponseType } from '../../src/types/controller.types';
import { CancelStatusText, ConnectorActions, CustomFields as CustomFieldName } from '../../src/utils/constant.utils';
import { PaymentStatus, Payment as molliePayment, Refund } from '@mollie/api-client';
import { CTTransactionState } from '../../src/types/commercetools.types';
import {
  listPaymentMethods,
  getPaymentById,
  createMolliePayment,
  cancelPayment,
  getApplePaySession,
} from '../../src/mollie/payment.mollie';
import { cancelPaymentRefund, createPaymentRefund, getPaymentRefund } from '../../src/mollie/refund.mollie';
import CustomError from '../../src/errors/custom.error';
import { logger } from '../../src/utils/logger.utils';
import { getPaymentByMolliePaymentId, updatePayment } from '../../src/commercetools/payment.commercetools';
import { CreateParameters } from '@mollie/api-client/dist/types/src/binders/payments/refunds/parameters';
import { getPaymentExtension } from '../../src/commercetools/extensions.commercetools';

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
        centAmount: 1000,
        fractionDigits: 2,
      },
      custom: {
        fields: {
          sctm_payment_methods_request: {
            locale: 'de_DE',
          },
        },
      } as unknown as CustomFields,
    } as unknown as Payment;

    const response = await handleListPaymentMethodsByPayment(mockResource);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    expect(response?.actions?.length).toBeGreaterThan(0);
    expect(response?.actions?.[0]?.action).toBe('setCustomField');
  });

  test('call listPaymentMethodsByPayment with no object reference', async () => {
    (listPaymentMethods as jest.Mock).mockReturnValueOnce([]);

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
          sctm_payment_methods_request: {
            locale: 'de_DE',
          },
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
          sctm_payment_methods_request: {
            locale: 'de_DE',
          },
        },
      } as unknown as CustomFields,
    } as unknown as Payment;

    const response = await handleListPaymentMethodsByPayment(mockResource);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    expect(response?.actions?.length).toBeGreaterThan(0);
    expect(response?.actions?.[0]?.action).toBe('setCustomField');
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
          sctm_payment_methods_request: {
            locale: 'de_DE',
          },
        },
      } as unknown as CustomFields,
    } as unknown as Payment;

    process.env.MOLLIE_CARD_COMPONENT = '1';

    const response = await handleListPaymentMethodsByPayment(mockResource);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    expect(response?.actions?.length).toBeGreaterThan(0);
    expect(response?.actions?.[0]?.action).toBe('setCustomField');
    expect(JSON.stringify(response)).not.toContain('creditcard');
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
      ) as typeof import('../../src/service/payment.service.ts');
      return paymentService.getCreatePaymentUpdateAction(molliePayment, CTPayment);
    });

    getCreatePaymentUpdateAction(molliePayment, CTPayment).catch((error) => {
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
      ) as typeof import('../../src/service/payment.service.ts');
      return paymentService.getCreatePaymentUpdateAction(molliePayment, CTPayment);
    });

    const actual = await getCreatePaymentUpdateAction(molliePayment, CTPayment);
    expect(actual).toHaveLength(4);

    expect(actual[0]).toEqual({
      action: 'addInterfaceInteraction',
      type: {
        key: 'sctm_interface_interaction_type',
      },
      fields: {
        id: uuid,
        actionType: ConnectorActions.CreatePayment,
        createdAt: molliePayment.createdAt,
        request: JSON.stringify({
          transactionId: CTPayment.transactions[0].id,
          paymentMethod: CTPayment.paymentMethodInfo.method,
        }),
        response: JSON.stringify({
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
});

describe('Test createPayment', () => {
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

    (createMolliePayment as jest.Mock).mockReturnValueOnce(molliePayment);
    (getPaymentExtension as jest.Mock).mockReturnValueOnce({
      destination: {
        url: 'https://example.com',
      },
    });

    const actual = await handleCreatePayment(CTPayment);

    const ctActions = [
      {
        action: 'addInterfaceInteraction',
        type: { key: 'sctm_interface_interaction_type' },
        fields: {
          id: '5c8b0375-305a-4f19-ae8e-07806b101999',
          actionType: 'createPayment',
          createdAt: '2024-03-20T09:13:37+00:00',
          request: '{"transactionId":"5c8b0375-305a-4f19-ae8e-07806b101999","paymentMethod":"creditcard"}',
          response:
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
    ];

    expect(actual).toEqual({
      statusCode: 201,
      actions: ctActions,
    });
  });
});

describe('Test handleCreateRefund', () => {
  it('should return status code and array of actions', async () => {
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

  test('should throw an error if the custom field is not able to be parsed', () => {
    const transactionCustomFieldName = CustomFieldName.paymentCancelReason;

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
          state: 'Failure',
          custom: {
            type: {
              typeId: 'type',
              id: 'custom-field-1',
            },
            fields: {
              sctm_payment_cancel_refund: 'asdasdasd',
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
      return paymentService.getPaymentCancelActions(CTPayment.transactions[0], ConnectorActions.CancelRefund);
    });

    try {
      getPaymentCancelActions(CTPayment.transactions[0], ConnectorActions.CancelRefund);
    } catch (error: unknown) {
      expect(getPaymentCancelActions).toBeCalledTimes(1);
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).message).toBe(
        `SCTM - handleCancelRefund - Failed to parse the JSON string from the custom field ${transactionCustomFieldName}.`,
      );
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        `SCTM - handleCancelRefund - Failed to parse the JSON string from the custom field ${transactionCustomFieldName}.`,
        {
          commerceToolsId: '5c8b0375-305a-4f19-ae8e-07806b101999',
        },
      );
    }
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
          type: 'Authorization',
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
              id: 'custom-field-1',
            },
            fields: {
              sctm_payment_cancel_reason: JSON.stringify(customFieldValue),
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
      return paymentService.getPaymentCancelActions(CTPayment.transactions[0], ConnectorActions.CancelRefund);
    });

    const actual = getPaymentCancelActions(CTPayment.transactions[0], ConnectorActions.CancelRefund);
    expect(actual).toHaveLength(2);

    expect(actual[0]).toEqual({
      action: 'changeTransactionState',
      transactionId: CTPayment.transactions[0].id,
      state: CTTransactionState.Failure,
    });

    expect(actual[1]).toEqual({
      action: 'setTransactionCustomField',
      transactionId: CTPayment.transactions[0].id,
      name: CustomFieldName.paymentCancelReason,
      value: JSON.stringify({
        reasonText: customFieldValue.reasonText,
        statusText: CancelStatusText,
      }),
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

  it('should return status code and array of actions', async () => {
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
        type: 'Authorization',
        interactionId: 'tr_123123',
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
            id: 'sctm_payment_cancel_reason',
          },
          fields: {
            sctm_payment_cancel_reason: JSON.stringify(customFieldReason),
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

    expect(actual).toEqual({
      statusCode: 200,
      actions: [
        {
          action: 'changeTransactionState',
          transactionId: CTPayment.transactions[0].id,
          state: CTTransactionState.Failure,
        },
        {
          action: 'setTransactionCustomField',
          transactionId: CTPayment.transactions[0].id,
          name: 'sctm_payment_cancel_reason',
          value: JSON.stringify({
            ...customFieldReason,
            statusText: CancelStatusText,
          }),
        },
      ],
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
    ]);
  });
});
