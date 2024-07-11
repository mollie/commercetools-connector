import { describe, test, expect, afterEach, it, jest } from '@jest/globals';
import { ConnectorActions, ErrorMessages } from '../../src/utils/constant.utils';
import { Payment, CustomFields } from '@commercetools/platform-sdk';
import { determinePaymentAction } from '../../src/utils/paymentAction.utils';
import { logger } from '../../src/utils/logger.utils';

jest.mock('../../src/utils/logger.utils', () => ({
  logger: {
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Test controller.utils.ts', () => {
  test('call determinePaymentAction without object reference', async () => {
    const response = determinePaymentAction();
    expect(response).toBeDefined();
    expect(response.action).toBe(ConnectorActions.NoAction);
    expect(response.errorMessage).toBe(ErrorMessages.paymentObjectNotFound);

    expect(logger.error).toBeCalledTimes(1);
  });

  test('call determinePaymentAction with with object reference', async () => {
    const mockCtPayment: Payment = {
      custom: {
        fields: {
          sctm_payment_methods_request: {
            locale: 'de_DE',
          },
        },
      } as unknown as CustomFields,
    } as unknown as Payment;
    const response = determinePaymentAction(mockCtPayment);
    expect(response).toBeDefined();
    expect(response.action).toBe(ConnectorActions.GetPaymentMethods);
    expect(response.errorMessage).not.toBe(ErrorMessages.paymentObjectNotFound);
  });
});

describe('determinePaymentAction', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test case
  });

  const dataSet = [
    {
      CTPayment: {
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
            state: 'Initial',
          },
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101999',
            type: 'Charge',
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
        paymentMethodInfo: {},
      } as Payment,
      expectedConnectorAction: ConnectorActions.NoAction,
      expectedErrorMessage: 'Only one transaction can be in "Initial" state at any time',
    },
    {
      CTPayment: {
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
            state: 'Initial',
          },
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
          },
        ],
        interfaceInteractions: [],
        paymentMethodInfo: {},
      } as Payment,
      expectedConnectorAction: ConnectorActions.NoAction,
      expectedErrorMessage:
        'Must only have one Charge transaction processing (i.e. in state "Initial" or "Pending") at a time',
    },
    {
      CTPayment: {
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
          },
        ],
        interfaceInteractions: [],
        paymentMethodInfo: {},
      } as Payment,
      expectedConnectorAction: ConnectorActions.NoAction,
      expectedErrorMessage:
        'Cannot create a Transaction in state "Pending". This state is reserved to indicate the transaction has been accepted by the payment service provider',
    },
    {
      CTPayment: {
        id: '5c8b0375-305a-4f19-ae8e-07806b101999',
        key: 'creating-payment-case',
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
            state: 'Initial',
          },
        ],
        interfaceInteractions: [],
        paymentMethodInfo: {},
      } as Payment,
      expectedConnectorAction: ConnectorActions.CreatePayment,
      expectedErrorMessage: '',
    },
  ];

  it.each(dataSet)(
    'should return correct action and error message',
    ({ CTPayment, expectedConnectorAction, expectedErrorMessage }) => {
      const { action, errorMessage } = determinePaymentAction(CTPayment);

      expect(action).toBe(expectedConnectorAction);
      expect(errorMessage).toBe(expectedErrorMessage);
    },
  );
});
