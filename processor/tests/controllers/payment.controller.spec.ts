import { describe, test, expect, jest, afterEach } from '@jest/globals';
import { paymentController } from '../../src/controllers/payment.controller';
import { CustomFields, Payment, PaymentReference } from '@commercetools/platform-sdk';
import CustomError from '../../src/errors/custom.error';
import { determinePaymentAction } from '../../src/utils/paymentAction.utils';
import { handleCreatePayment, handleListPaymentMethodsByPayment } from '../../src/service/payment.service';
import { ConnectorActions } from '../../src/utils/constant.utils';
import { validateCommerceToolsPaymentPayload } from '../../src/validators/payment.validators';

jest.mock('../../src/service/payment.service', () => ({
  handleListPaymentMethodsByPayment: jest.fn(),
  handleCreatePayment: jest.fn(),
}));

jest.mock('../../src/validators/payment.validators.ts', () => ({
  validateCommerceToolsPaymentPayload: jest.fn(),
}));

jest.mock('../../src/utils/paymentAction.utils.ts', () => ({
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

    (validateCommerceToolsPaymentPayload as jest.Mock).mockImplementationOnce(() => {
      throw new CustomError(400, 'dummy message');
    });

    paymentController(mockAction, mockResource).catch((error) => {
      expect(error).toBeInstanceOf(CustomError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('dummy message');
      expect(determinePaymentAction).toBeCalledTimes(0);
      expect(handleListPaymentMethodsByPayment).toBeCalledTimes(0);
      expect(handleCreatePayment).toBeCalledTimes(0);
    });
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
    (determinePaymentAction as jest.Mock).mockReturnValue({
      action: ConnectorActions.GetPaymentMethods,
      errorMessage: '',
    });

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

    (determinePaymentAction as jest.Mock).mockReturnValue({
      action: ConnectorActions.CreatePayment,
      errorMessage: '',
    });

    (handleCreatePayment as jest.Mock).mockReturnValue(handleCreatePaymentResponse);

    const response = await paymentController(mockAction, mockResource);
    expect(response).toBeDefined();
    expect(handleListPaymentMethodsByPayment).toBeCalledTimes(0);
    expect(handleCreatePayment).toBeCalledTimes(1);
    expect(handleCreatePayment).toReturnWith(handleCreatePaymentResponse);
  });
});
