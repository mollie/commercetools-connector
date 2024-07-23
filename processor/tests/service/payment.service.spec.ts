import { describe, test, expect, jest, beforeEach, afterEach, it } from '@jest/globals';
import { CustomFields, Payment } from '@commercetools/platform-sdk';
import {
  getCreatePaymentUpdateAction,
  getPaymentCancelRefundActions,
  handleCreatePayment,
  handleListPaymentMethodsByPayment,
  handlePaymentCancelRefund,
} from '../../src/service/payment.service';
import { ControllerResponseType } from '../../src/types/controller.types';
import {
  CancelRefundStatusText,
  ConnectorActions,
  CustomFields as CustomFieldName,
} from '../../src/utils/constant.utils';
import { PaymentStatus, Payment as molliePayment } from '@mollie/api-client';
import { CTTransactionState } from '../../src/types/commercetools.types';
import {
  cancelPaymentRefund,
  createMolliePayment,
  getPaymentById,
  listPaymentMethods,
} from '../../src/mollie/payment.mollie';
import CustomError from '../../src/errors/custom.error';
import { logger } from '../../src/utils/logger.utils';
const uuid = '5c8b0375-305a-4f19-ae8e-07806b101999';
jest.mock('uuid', () => ({
  v4: () => uuid,
}));

jest.mock('../../src/service/payment.service.ts', () => ({
  ...(jest.requireActual('../../src/service/payment.service.ts') as object),
  getCreatePaymentUpdateAction: jest.fn(),
  getPaymentCancelRefundActions: jest.fn(),
}));

jest.mock('../../src/mollie/payment.mollie', () => ({
  listPaymentMethods: jest.fn(),
  createMolliePayment: jest.fn(),
  getPaymentById: jest.fn(),
  cancelPaymentRefund: jest.fn(),
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

describe('Test getPaymentCancelRefundActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should throw an error if the custom field is not able to be parsed', () => {
    const transactionCustomFieldName = CustomFieldName.paymentCancelRefund;

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

    (getPaymentCancelRefundActions as jest.Mock).mockImplementationOnce(() => {
      const paymentService = jest.requireActual(
        '../../src/service/payment.service.ts',
      ) as typeof import('../../src/service/payment.service.ts');
      return paymentService.getPaymentCancelRefundActions(CTPayment.transactions[0]);
    });

    try {
      getPaymentCancelRefundActions(CTPayment.transactions[0]);
    } catch (error: unknown) {
      expect(getPaymentCancelRefundActions).toBeCalledTimes(1);
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).message).toBe(
        `SCTM - handleCancelRefund - Failed to parse the JSON string from the custom field ${transactionCustomFieldName}.`,
      );
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        `SCTM - handleCancelRefund - Failed to parse the JSON string from the custom field ${transactionCustomFieldName}.`,
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
              sctm_payment_cancel_refund: JSON.stringify(customFieldValue),
            },
          },
        },
      ],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'creditcard',
      },
    };

    (getPaymentCancelRefundActions as jest.Mock).mockImplementationOnce(() => {
      const paymentService = jest.requireActual(
        '../../src/service/payment.service.ts',
      ) as typeof import('../../src/service/payment.service.ts');
      return paymentService.getPaymentCancelRefundActions(CTPayment.transactions[0]);
    });

    const actual = await getPaymentCancelRefundActions(CTPayment.transactions[0]);
    expect(actual).toHaveLength(2);

    expect(actual[0]).toEqual({
      action: 'changeTransactionState',
      transactionId: CTPayment.transactions[0].id,
      state: CTTransactionState.Failure,
    });

    expect(actual[1]).toEqual({
      action: 'setTransactionCustomField',
      transactionId: CTPayment.transactions[0].id,
      name: CustomFieldName.paymentCancelRefund,
      value: JSON.stringify({
        reasonText: customFieldValue.reasonText,
        statusText: CancelRefundStatusText,
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
        interactionId: 'refund_id_123123',
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

  it('should throw error if the Mollie Payment status is not pending', async () => {
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

    (getPaymentById as jest.Mock).mockReturnValueOnce(molliePayment);

    try {
      await handlePaymentCancelRefund(CTPayment);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        `SCTM - handleCancelRefund - Mollie Payment status must be pending, payment ID: ${molliePayment.id}`,
      );
    }
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
      status: PaymentStatus.pending,
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

    (getPaymentById as jest.Mock).mockReturnValueOnce(molliePayment);

    (cancelPaymentRefund as jest.Mock).mockReturnValueOnce(true);

    (getPaymentCancelRefundActions as jest.Mock).mockReturnValueOnce([]);

    await handlePaymentCancelRefund(CTPayment);

    expect(getPaymentById).toBeCalledTimes(1);
    expect(getPaymentById).toBeCalledWith(CTPayment.transactions[0].interactionId);
    expect(cancelPaymentRefund).toBeCalledTimes(1);
    expect(cancelPaymentRefund).toBeCalledWith(CTPayment.transactions[1].interactionId, {
      paymentId: molliePayment.id,
    });
  });
});
