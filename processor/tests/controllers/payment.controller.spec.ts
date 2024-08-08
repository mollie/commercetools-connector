import { describe, test, expect, jest, afterEach } from '@jest/globals';
import { paymentController } from '../../src/controllers/payment.controller';
import { CustomFields, Payment, PaymentReference } from '@commercetools/platform-sdk';
import CustomError from '../../src/errors/custom.error';
import { determinePaymentAction } from '../../src/utils/paymentAction.utils';
import {
  handleCreatePayment,
  handleListPaymentMethodsByPayment,
  handlePaymentCancelRefund,
  handleCreateRefund,
  handleGetApplePaySession,
  handleCancelPayment,
} from '../../src/service/payment.service';
import { CancelStatusText, ConnectorActions, CustomFields as CustomFieldName } from '../../src/utils/constant.utils';
import { validateCommerceToolsPaymentPayload } from '../../src/validators/payment.validators';
import SkipError from '../../src/errors/skip.error';
import { logger } from '../../src/utils/logger.utils';

jest.mock('../../src/service/payment.service', () => ({
  handleListPaymentMethodsByPayment: jest.fn(),
  handleCreatePayment: jest.fn(),
  handlePaymentCancelRefund: jest.fn(),
  handleCreateRefund: jest.fn(),
  handleGetApplePaySession: jest.fn(),
  handleCancelPayment: jest.fn(),
}));

jest.mock('../../src/validators/payment.validators.ts', () => ({
  validateCommerceToolsPaymentPayload: jest.fn(),
}));

jest.mock('../../src/utils/paymentAction.utils', () => ({
  determinePaymentAction: jest.fn(),
}));

describe('Test payment.controller.ts', () => {
  let mockAction: string;
  let mockResource: PaymentReference;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('throw error if validation failed', () => {
    mockAction = 'Create' as string;
    mockResource = {
      typeId: 'payment',
      obj: {
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
      } as unknown as Payment,
    } as PaymentReference;

    (determinePaymentAction as jest.Mock).mockReturnValue({
      action: ConnectorActions.GetPaymentMethods,
      errorMessage: '',
    });

    (validateCommerceToolsPaymentPayload as jest.Mock).mockImplementationOnce(() => {
      throw new CustomError(400, 'dummy message');
    });

    paymentController(mockAction, mockResource).catch((error) => {
      expect(error).toBeInstanceOf(CustomError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('dummy message');
      expect(determinePaymentAction).toBeCalledTimes(1);
      expect(validateCommerceToolsPaymentPayload).toBeCalledTimes(1);
      expect(handleListPaymentMethodsByPayment).toBeCalledTimes(0);
      expect(handleCreatePayment).toBeCalledTimes(0);
    });
  });

  test('should throw a SkipError if no action matched', async () => {
    mockAction = 'Create' as string;
    mockResource = {
      typeId: 'payment',
      obj: {
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
      } as unknown as Payment,
    } as PaymentReference;

    (determinePaymentAction as jest.Mock).mockReturnValue(ConnectorActions.NoAction);

    try {
      await paymentController(mockAction, mockResource);
    } catch (error: unknown) {
      expect(determinePaymentAction).toBeCalledTimes(1);
      expect(error).toBeInstanceOf(SkipError);
      expect(error).toHaveProperty('message', 'No payment actions matched');
    }
  });

  test('should throw a SkipError if no action matched if the action is not detected at the end', async () => {
    mockAction = 'Create' as string;
    mockResource = {
      typeId: 'payment',
      obj: {
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
      } as unknown as Payment,
    } as PaymentReference;

    (determinePaymentAction as jest.Mock).mockReturnValue('dummyAction');

    (validateCommerceToolsPaymentPayload as jest.Mock).mockImplementationOnce(() => {
      return;
    });

    try {
      await paymentController(mockAction, mockResource);
    } catch (error: unknown) {
      expect(determinePaymentAction).toBeCalledTimes(1);
      expect(error).toBeInstanceOf(SkipError);
      expect(error).toHaveProperty('message', 'No payment actions matched');
      expect(logger.debug).toBeCalledTimes(4);
      expect(logger.debug).toHaveBeenNthCalledWith(
        4,
        'SCTM - payment processing - paymentController - No payment actions matched',
      );
    }
  });

  test('call listPaymentMethodsByPayment with valid object reference', async () => {
    mockAction = 'Create' as string;
    mockResource = {
      typeId: 'payment',
      obj: {
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
      } as unknown as Payment,
    } as PaymentReference;

    const handleListPaymentMethodsByPaymentResponse = {
      statusCode: 200,
      actions: [
        {
          action: 'setCustomField',
          name: 'sctm_payment_methods_response',
          value:
            '{"count":2,"methods":[{"resource":"method","id":"paypal","description":"PayPal","minimumAmount":{"value":"0.01","currency":"EUR"},"maximumAmount":null,"image":{"size1x":"https://www.mollie.com/external/icons/payment-methods/paypal.png","size2x":"https://www.mollie.com/external/icons/payment-methods/paypal%402x.png","svg":"https://www.mollie.com/external/icons/payment-methods/paypal.svg"},"status":"activated","_links":{"self":{"href":"https://api.mollie.com/v2/methods/paypal","type":"application/hal+json"}}},{"resource":"method","id":"giftcard","description":"Geschenkkarten","minimumAmount":{"value":"0.01","currency":"EUR"},"maximumAmount":null,"image":{"size1x":"https://www.mollie.com/external/icons/payment-methods/giftcard.png","size2x":"https://www.mollie.com/external/icons/payment-methods/giftcard%402x.png","svg":"https://www.mollie.com/external/icons/payment-methods/giftcard.svg"},"status":"activated","_links":{"self":{"href":"https://api.mollie.com/v2/methods/giftcard","type":"application/hal+json"}}}]}',
        },
      ],
    };

    (validateCommerceToolsPaymentPayload as jest.Mock).mockImplementationOnce(() => {
      return;
    });
    (handleListPaymentMethodsByPayment as jest.Mock).mockReturnValue(handleListPaymentMethodsByPaymentResponse);
    (determinePaymentAction as jest.Mock).mockReturnValue(ConnectorActions.GetPaymentMethods);

    const response = await paymentController(mockAction, mockResource);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    expect(response?.actions?.length).toBeGreaterThan(0);
    expect(response?.actions?.[0].action).toBe('setCustomField');
    expect(handleListPaymentMethodsByPayment).toBeCalledTimes(1);
    expect(handleListPaymentMethodsByPayment).toReturnWith(handleListPaymentMethodsByPaymentResponse);
    expect(handleCreatePayment).toBeCalledTimes(0);
  });

  test('able to call and retrieve the result from handleCreatePayment', async () => {
    mockAction = 'Create' as string;
    mockResource = {
      typeId: 'payment',
      obj: {
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
      } as unknown as Payment,
    } as PaymentReference;

    const handleCreatePaymentResponse = {
      statusCode: 200,
      actions: [
        {
          action: 'changeTransactionInteractionId',
          transactionId: 'tr_123456',
          interactionId: 'tr_654321',
        },
      ],
    };

    (validateCommerceToolsPaymentPayload as jest.Mock).mockImplementationOnce(() => {
      return;
    });

    (determinePaymentAction as jest.Mock).mockReturnValue(ConnectorActions.CreatePayment);

    (handleCreatePayment as jest.Mock).mockReturnValue(handleCreatePaymentResponse);

    const response = await paymentController(mockAction, mockResource);
    expect(response).toBeDefined();
    expect(handleListPaymentMethodsByPayment).toBeCalledTimes(0);
    expect(handleCreatePayment).toBeCalledTimes(1);
    expect(handleCreatePayment).toReturnWith(handleCreatePaymentResponse);
  });

  test('able to call and retrieve the result from handlePaymentCreateRefund', async () => {
    mockAction = 'Create' as string;
    mockResource = {
      typeId: 'payment',
      obj: {
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
        transactions: [
          {
            id: 'tr_123456',
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
            id: 'tr_XXXXX',
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
      } as unknown as Payment,
    } as PaymentReference;

    const handlePaymentCancelRefundResponse = {
      statusCode: 200,
      actions: [
        {
          action: 'changeTransactionInteractionId',
          transactionId: 'tr_XXXXX',
          interactionId: 'refund_id',
        },
        {
          action: 'changeTransactionState',
          transactionId: 'tr_XXXXX',
          interactionId: 'Pending',
        },
      ],
    };

    (validateCommerceToolsPaymentPayload as jest.Mock).mockImplementationOnce(() => {
      return;
    });

    (determinePaymentAction as jest.Mock).mockReturnValue(ConnectorActions.CreateRefund);

    (handleCreateRefund as jest.Mock).mockReturnValue(handlePaymentCancelRefundResponse);

    const response = await paymentController(mockAction, mockResource);
    expect(response).toBeDefined();
    expect(handleListPaymentMethodsByPayment).toBeCalledTimes(0);
    expect(handleCreatePayment).toBeCalledTimes(0);
    expect(handleCreateRefund).toBeCalledTimes(1);
    expect(handleCreateRefund).toReturnWith(handlePaymentCancelRefundResponse);
  });

  test('able to call and retrieve the result from handlePaymentCancelRefund', async () => {
    mockAction = 'Create' as string;
    mockResource = {
      typeId: 'payment',
      obj: {
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
      } as unknown as Payment,
    } as PaymentReference;

    const transactionCustomFieldValue = JSON.stringify({
      responseText: 'Manually cancelled',
      statusText: CancelStatusText,
    });

    const handlePaymentCancelRefundResponse = {
      statusCode: 200,
      actions: [
        {
          action: 'changeTransactionState',
          transactionId: 'tr_123456',
          state: 'Failure',
        },
        {
          action: 'setTransactionCustomField',
          transactionId: 'tr_123456',
          name: CustomFieldName.paymentCancelReason,
          value: transactionCustomFieldValue,
        },
      ],
    };

    (validateCommerceToolsPaymentPayload as jest.Mock).mockImplementationOnce(() => {
      return;
    });

    (determinePaymentAction as jest.Mock).mockReturnValue(ConnectorActions.CancelRefund);

    (handlePaymentCancelRefund as jest.Mock).mockReturnValue(handlePaymentCancelRefundResponse);

    const response = await paymentController(mockAction, mockResource);
    expect(response).toBeDefined();
    expect(handleListPaymentMethodsByPayment).toBeCalledTimes(0);
    expect(handleCreatePayment).toBeCalledTimes(0);
    expect(handlePaymentCancelRefund).toBeCalledTimes(1);
    expect(handlePaymentCancelRefund).toReturnWith(handlePaymentCancelRefundResponse);
  });

  test('call handleGetApplePaySession with valid object reference', async () => {
    mockAction = 'Create' as string;
    mockResource = {
      typeId: 'payment',
      obj: {
        amountPlanned: {
          centAmount: 11000,
          currencyCode: 'EUR',
          fractionDigits: 2,
          type: 'centPrecision',
        },
        paymentMethodInfo: {
          method: 'paypal',
          paymentInterface: 'mollie',
        },
        custom: {
          fields: {
            sctm_apple_pay_session_request:
              '{"domain":"pay.mywebshop.com","validationUrl":"https://apple-pay-gateway-cert.apple.com/paymentservices/paymentSession"}',
          },
        } as unknown as CustomFields,
      } as unknown as Payment,
    } as unknown as PaymentReference;

    const handleGetApplePaySessionResponse = {
      statusCode: 200,
      actions: [
        {
          action: 'setCustomField',
          name: 'sctm_apple_pay_session_response',
          value:
            '{"epochTimestamp":1555507053169,"expiresAt":1555510653169,"merchantSessionIdentifier":"SSH2EAF8AFAEAA94DEEA898162A5DAFD36E_916523AAED1343F5BC5815E12BEE9250AFFDC1A17C46B0DE5A9","nonce":"0206b8db","merchantIdentifier":"BD62FEB196874511C22DB28A9E14A89E3534C93194F73EA417EC566368D391EB","domainName":"pay.example.org","displayName":"Chuck Norris\'s Store","signature":"308006092a864886f7...8cc030ad3000000000000"}',
        },
      ],
    };

    (validateCommerceToolsPaymentPayload as jest.Mock).mockImplementationOnce(() => {
      return;
    });

    (handleGetApplePaySession as jest.Mock).mockReturnValue(handleGetApplePaySessionResponse);
    (determinePaymentAction as jest.Mock).mockReturnValue(ConnectorActions.GetApplePaySession);

    const response = await paymentController(mockAction, mockResource);
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    expect(response?.actions?.length).toBeGreaterThan(0);
    expect(response?.actions?.[0].action).toBe('setCustomField');
    expect(handleGetApplePaySession).toBeCalledTimes(1);
    expect(handleGetApplePaySession).toReturnWith(handleGetApplePaySessionResponse);
    expect(handleCreatePayment).toBeCalledTimes(0);
  });

  test('able to call and retrieve the result from handleCancelPayment', async () => {
    mockAction = 'Create' as string;
    mockResource = {
      typeId: 'payment',
      obj: {
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
      } as unknown as Payment,
    } as PaymentReference;

    const transactionCustomFieldValue = JSON.stringify({
      responseText: 'Manually cancelled',
      statusText: CancelStatusText,
    });

    const handleCancelPaymentResponse = {
      statusCode: 200,
      actions: [
        {
          action: 'changeTransactionState',
          transactionId: 'tr_123456',
          state: 'Failure',
        },
        {
          action: 'setTransactionCustomField',
          transactionId: 'tr_123456',
          name: CustomFieldName.paymentCancelReason,
          value: transactionCustomFieldValue,
        },
      ],
    };

    (validateCommerceToolsPaymentPayload as jest.Mock).mockImplementationOnce(() => {
      return;
    });

    (determinePaymentAction as jest.Mock).mockReturnValue(ConnectorActions.CancelPayment);

    (handleCancelPayment as jest.Mock).mockReturnValue(handleCancelPaymentResponse);

    const response = await paymentController(mockAction, mockResource);
    expect(response).toBeDefined();
    expect(handleListPaymentMethodsByPayment).toBeCalledTimes(0);
    expect(handleCreatePayment).toBeCalledTimes(0);
    expect(handleCreateRefund).toBeCalledTimes(0);
    expect(handlePaymentCancelRefund).toBeCalledTimes(0);
    expect(handleCancelPayment).toBeCalledTimes(1);
    expect(handleCancelPayment).toReturnWith(handleCancelPaymentResponse);
  });
});
