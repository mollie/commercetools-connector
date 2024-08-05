import { describe, test, expect, afterEach, it, jest } from '@jest/globals';
import { ConnectorActions, ErrorMessages } from '../../src/utils/constant.utils';
import { Payment, CustomFields } from '@commercetools/platform-sdk';
import { determinePaymentAction } from '../../src/utils/paymentAction.utils';
import { logger } from '../../src/utils/logger.utils';

describe('Test controller.utils.ts', () => {
  test('call determinePaymentAction without object reference', async () => {
    expect(() => {
      determinePaymentAction();
    }).toThrow(ErrorMessages.paymentObjectNotFound);

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
    expect(response).toBe(ConnectorActions.GetPaymentMethods);
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
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101999',
            type: 'Charge',
            amount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 1000,
              fractionDigits: 2,
            },
            state: 'Success',
          },
        ],
        interfaceInteractions: [],
        paymentMethodInfo: {},
      } as Payment,
      expectedConnectorAction: ConnectorActions.NoAction,
      expectedErrorMessage: '',
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
            type: 'Authorization',
            interactionId: 'tr_123123',
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
        paymentMethodInfo: {},
      } as Payment,
      expectedConnectorAction: ConnectorActions.CancelPayment,
      expectedErrorMessage: '',
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
            state: 'Success',
          },
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b102000',
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
        paymentMethodInfo: {},
      } as Payment,
      expectedConnectorAction: ConnectorActions.CreateRefund,
      expectedErrorMessage: '',
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
            state: 'Success',
          },
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101999',
            type: 'CancelAuthorization',
            state: 'Initial',
          },
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b102000',
            type: 'Refund',
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
      expectedConnectorAction: ConnectorActions.CancelRefund,
      expectedErrorMessage: '',
    },
    {
      CTPayment: {
        id: '5c8b0375-305a-4f19-ae8e-07806b101999',
        key: 'get-apple-pay-session-case',
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
        paymentMethodInfo: {},
        custom: {
          type: {
            typeId: 'type',
            id: 'sctm_apple_pay_session_request',
          },
          fields: {
            sctm_apple_pay_session_request: JSON.stringify({
              domain: 'pay.mywebshop.com',
              validationUrl: 'https://apple-pay-gateway-cert.apple.com/paymentservices/paymentSession',
            }),
          },
        } as unknown as CustomFields,
      } as Payment,
      expectedConnectorAction: ConnectorActions.GetApplePaySession,
      expectedErrorMessage: '',
    },
  ];

  it.each(dataSet)(
    'should return correct action and error message',
    ({ CTPayment, expectedConnectorAction, expectedErrorMessage }) => {
      if (expectedErrorMessage) {
        expect(() => {
          determinePaymentAction(CTPayment);
        }).toThrow(expectedErrorMessage);
      } else {
        const action = determinePaymentAction(CTPayment);
        expect(action).toBeDefined();
        expect(action).toBe(expectedConnectorAction);

        if (expectedConnectorAction === ConnectorActions.NoAction && expectedErrorMessage === '') {
          expect(logger.warn).toBeCalledTimes(1);
          expect(logger.warn).toBeCalledWith('SCTM - No payment actions matched');
        }
      }
    },
  );
});
