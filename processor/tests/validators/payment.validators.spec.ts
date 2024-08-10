import { ConnectorActions } from './../../src/utils/constant.utils';
import { Payment } from '@commercetools/platform-sdk';
import {
  checkAmountPlanned,
  checkExtensionAction,
  checkPaymentInterface,
  checkPaymentMethodInput,
  checkValidSuccessChargeTransaction,
  checkPaymentMethodSpecificParameters,
  hasValidPaymentMethod,
  validateCommerceToolsPaymentPayload,
  checkValidRefundTransactionForCreate,
  checkValidRefundTransactionForCancel,
  checkValidSuccessAuthorizationTransaction,
} from './../../src/validators/payment.validators';
import { describe, it, expect, jest, afterEach } from '@jest/globals';
import CustomError from '../../src/errors/custom.error';
import SkipError from '../../src/errors/skip.error';
import { logger } from '../../src/utils/logger.utils';

jest.mock('@mollie/api-client', () => ({
  PaymentMethod: {
    applepay: 'applepay',
    paypal: 'paypal',
    dummy: 'dummy',
    creditcard: 'creditcard',
    giftcard: 'giftcard',
    banktransfer: 'banktransfer',
  },
}));

describe('checkExtensionAction', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test case
  });

  it('should return true if the given action is "Create" or "Update"', () => {
    expect(checkExtensionAction('Create')).toBe(true);
    expect(checkExtensionAction('Update')).toBe(true);
  });

  it('should throw an error if the given action is not "Create" or "Update"', () => {
    const action = 'test';
    try {
      checkExtensionAction(action);
    } catch (error: any) {
      expect(error).toBeInstanceOf(SkipError);
      expect(error.message).toBe(`Skip processing for action "${action}"`);
    }
  });
});

describe('checkPaymentInterface', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test case
  });

  it('should throw SkipError if the payment interface is not defined', () => {
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
      paymentMethodInfo: {},
    };

    try {
      checkPaymentInterface(CTPayment);
    } catch (error: any) {
      expect(error).toBeInstanceOf(SkipError);
      expect(error.message).toBe('SCTM - PAYMENT PROCESSING - Skip processing for payment interface "undefined"');
    }
  });

  it('should throw SkipError false if the payment interface is not mollie', () => {
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
        paymentInterface: 'test',
      },
    };

    try {
      checkPaymentInterface(CTPayment);
    } catch (error: any) {
      expect(error).toBeInstanceOf(SkipError);
      expect(error.message).toBe('SCTM - PAYMENT PROCESSING - Skip processing for payment interface "test"');
    }
  });

  it('should return true if the payment interface is mollie', () => {
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
        paymentInterface: 'Mollie',
      },
    };

    expect(checkPaymentInterface(CTPayment)).toBe(true);
  });
});

describe('hasValidPaymentMethod', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test case
  });

  it('should return false if the payment method is not defined', () => {
    expect(hasValidPaymentMethod(undefined)).toBe(false);
  });

  it('should return true if the payment method is defined and is supported by Mollie', () => {
    expect(hasValidPaymentMethod('applepay')).toBe(true);
    expect(hasValidPaymentMethod('paypal')).toBe(true);
    expect(hasValidPaymentMethod('dummy')).toBe(true);
  });

  it('should return false if the payment method is defined and is not supported by Mollie', () => {
    expect(hasValidPaymentMethod('test')).toBe(false);
  });
});

describe('checkPaymentMethodInput', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test case
  });

  it('should throw CustomError and a correct error message if the payment method is not defined when trying to create a Mollie payment', () => {
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
      paymentMethodInfo: {},
    };

    try {
      checkPaymentMethodInput(ConnectorActions.CreatePayment, CTPayment);
    } catch (error: any) {
      expect(error).toBeInstanceOf(CustomError);
      expect(error.message).toBe(
        `SCTM - PAYMENT PROCESSING - Payment method must be set in order to create a Mollie payment, CommerceTools Payment ID: ${CTPayment.id}.`,
      );
    }
  });

  it('should throw CustomError and a correct error message if the payment method is not supported by Mollie', () => {
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
        method: 'test',
      },
    };

    try {
      checkPaymentMethodInput(ConnectorActions.CreatePayment, CTPayment);
    } catch (error: any) {
      expect(error).toBeInstanceOf(CustomError);
      expect(error.message).toBe(
        `SCTM - PAYMENT PROCESSING - Invalid paymentMethodInfo.method "${CTPayment.paymentMethodInfo.method}", CommerceTools Payment ID: ${CTPayment.id}.`,
      );
    }
  });

  it('should return true if the payment method is supported by Mollie', () => {
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
        method: 'dummy',
      },
    };

    expect(checkPaymentMethodInput(ConnectorActions.CreatePayment, CTPayment)).toBe(true);
  });

  it('should call checkPaymentMethodSpecificParameters if the payment method is "creditcard', () => {
    const paymentValidators = require('../../src/validators/payment.validators');

    jest.spyOn(paymentValidators, 'checkPaymentMethodSpecificParameters');

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
          id: 'sctm-payment-custom-fields',
        },
        fields: {
          sctm_create_payment_request:
            '{"description":"Test","locale":"en_GB","redirectUrl":"https://www.google.com/","cardToken":"token_12345"}',
        },
      },
    };

    checkPaymentMethodInput(ConnectorActions.CreatePayment, CTPayment);

    expect(checkPaymentMethodSpecificParameters).toBeCalledTimes(1);
  });
});

describe('checkPaymentMethodSpecificParameters', () => {
  it('should throw an error if the payment method is creditcard and card component is enabled and cardToken is not defined in Custom Field', () => {
    process.env.MOLLIE_CARD_COMPONENT = '1';

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

    try {
      checkPaymentMethodSpecificParameters(CTPayment, CTPayment.paymentMethodInfo.method as string);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).message).toBe(
        'SCTM - PAYMENT PROCESSING - cardToken is required for payment method creditcard',
      );
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        `SCTM - PAYMENT PROCESSING - cardToken is required for payment method creditcard, CommerceTools Payment ID: ${CTPayment.id}`,
        {
          cardToken: undefined,
          commerceToolsPaymentId: CTPayment.id,
        },
      );
    }
  });

  it('should throw an error if the payment method is creditcard and cardToken is an empty string', () => {
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
          id: 'sctm-payment-custom-fields',
        },
        fields: {
          sctm_create_payment_request:
            '{"description":"Test","locale":"en_GB","redirectUrl":"https://www.google.com/","cardToken":123}',
        },
      },
    };

    try {
      checkPaymentMethodSpecificParameters(CTPayment, CTPayment.paymentMethodInfo.method as string);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).message).toBe(
        'SCTM - PAYMENT PROCESSING - cardToken must be a string and not empty for payment method creditcard',
      );
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        `SCTM - PAYMENT PROCESSING - cardToken must be a string and not empty for payment method creditcard, CommerceTools Payment ID: ${CTPayment.id}`,
        {
          cardToken: 123,
          commerceToolsPaymentId: CTPayment.id,
        },
      );
    }
  });

  it('should throw CustomError if the payment method is creditcard and the custom field sctm_create_payment_request is not a JSON string', () => {
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
          id: 'sctm-payment-custom-fields',
        },
        fields: {
          sctm_create_payment_request: 'dummy string',
        },
      },
    };

    try {
      checkPaymentMethodSpecificParameters(CTPayment, CTPayment.paymentMethodInfo.method as string);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        'SCTM - PAYMENT PROCESSING - Failed to parse the JSON string from the custom field sctm_create_payment_request.',
        {
          commerceToolsId: CTPayment.id,
        },
      );
    }
  });

  it('should return true if the payment method is creditcard and cardToken is defined and not an empty string in the Payment custom fields', () => {
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
          id: 'sctm-payment-custom-fields',
        },
        fields: {
          sctm_create_payment_request:
            '{"description":"Test","locale":"en_GB","redirectUrl":"https://www.google.com/","cardToken":"ct_123456"}',
        },
      },
    };

    expect(checkPaymentMethodSpecificParameters(CTPayment, CTPayment.paymentMethodInfo.method as string)).toBe(
      undefined,
    );
  });

  it('should throw an error if the payment method is banktransfer and the billingAddress is not specified', () => {
    const paymentRequest = {
      description: 'Test',
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
        method: 'banktransfer',
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm-payment-custom-fields',
        },
        fields: {
          sctm_create_payment_request: JSON.stringify(paymentRequest),
        },
      },
    };

    try {
      checkPaymentMethodSpecificParameters(CTPayment, CTPayment.paymentMethodInfo.method as string);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).message).toBe(
        'SCTM - PAYMENT PROCESSING - email is required for payment method banktransfer. Please make sure you have sent it in billingAddress.email of the custom field',
      );
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        `SCTM - PAYMENT PROCESSING - email is required for payment method banktransfer. Please make sure you have sent it in billingAddress.email of the custom field`,
        {
          commerceToolsPayment: CTPayment,
        },
      );
    }
  });

  it('should throw an error if the payment method is banktransfer and the billingAddress is specified but does not provide email', () => {
    const paymentRequest = {
      description: 'Test',
      billingAddress: {
        title: 'Billing address title',
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
        method: 'banktransfer',
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm-payment-custom-fields',
        },
        fields: {
          sctm_create_payment_request: JSON.stringify(paymentRequest),
        },
      },
    };

    try {
      checkPaymentMethodSpecificParameters(CTPayment, CTPayment.paymentMethodInfo.method as string);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).message).toBe(
        'SCTM - PAYMENT PROCESSING - email is required for payment method banktransfer. Please make sure you have sent it in billingAddress.email of the custom field',
      );
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        `SCTM - PAYMENT PROCESSING - email is required for payment method banktransfer. Please make sure you have sent it in billingAddress.email of the custom field`,
        {
          commerceToolsPayment: CTPayment,
        },
      );
    }
  });

  it('should throw an error if the payment method is banktransfer and the email is not valid', () => {
    const paymentRequest = {
      description: 'Test',
      billingAddress: {
        title: 'Billing address title',
        email: 'dummy string',
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
        method: 'banktransfer',
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm-payment-custom-fields',
        },
        fields: {
          sctm_create_payment_request: JSON.stringify(paymentRequest),
        },
      },
    };

    try {
      checkPaymentMethodSpecificParameters(CTPayment, CTPayment.paymentMethodInfo.method as string);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).message).toBe('SCTM - PAYMENT PROCESSING - email must be a valid email address');
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(`SCTM - PAYMENT PROCESSING - email must be a valid email address`, {
        commerceToolsPayment: CTPayment,
      });
    }
  });

  it('should should not throw any error or terminate the process if the payment method is banktransfer and the email is provided correctly', () => {
    const paymentRequest = {
      description: 'Test',
      billingAddress: {
        title: 'Billing address title',
        email: 'test@gmail.com',
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
        method: 'banktransfer',
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm-payment-custom-fields',
        },
        fields: {
          sctm_create_payment_request: JSON.stringify(paymentRequest),
        },
      },
    };

    expect(checkPaymentMethodSpecificParameters(CTPayment, CTPayment.paymentMethodInfo.method as string)).toBe(
      undefined,
    );
    expect(logger.error).toBeCalledTimes(0);
  });

  it('should throw an error if the payment method is blik and the currency code is not PLN', () => {
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
        method: 'blik',
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm-payment-custom-fields',
        },
        fields: {
          sctm_create_payment_request:
            '{"description":"Test","locale":"en_GB","redirectUrl":"https://www.google.com/","billingEmail":"n.tran@shopmacher.de"}',
        },
      },
    };

    try {
      checkPaymentMethodSpecificParameters(CTPayment, CTPayment.paymentMethodInfo.method as string);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).message).toBe(
        'SCTM - PAYMENT PROCESSING - Currency Code must be PLN for payment method BLIK',
      );
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        `SCTM - PAYMENT PROCESSING - Currency Code must be PLN for payment method BLIK`,
        {
          commerceToolsPayment: CTPayment,
        },
      );
    }
  });

  it('should throw an error if the payment method is blik and the billing email is not provided', () => {
    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'PLN',
        centAmount: 1000,
        fractionDigits: 2,
      },
      paymentStatus: {},
      transactions: [],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'blik',
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm-payment-custom-fields',
        },
        fields: {
          sctm_create_payment_request:
            '{"description":"Test","locale":"en_GB","redirectUrl":"https://www.google.com/"}',
        },
      },
    };

    try {
      checkPaymentMethodSpecificParameters(CTPayment, CTPayment.paymentMethodInfo.method as string);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).message).toBe(
        'SCTM - PAYMENT PROCESSING - billingEmail is required for payment method BLIK',
      );
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        `SCTM - PAYMENT PROCESSING - billingEmail is required for payment method BLIK`,
        {
          commerceToolsPayment: CTPayment,
        },
      );
    }
  });

  it('should throw an error if the payment method is blik and the billing email is provided incorrectly', () => {
    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'PLN',
        centAmount: 1000,
        fractionDigits: 2,
      },
      paymentStatus: {},
      transactions: [],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'blik',
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm-payment-custom-fields',
        },
        fields: {
          sctm_create_payment_request:
            '{"description":"Test","locale":"en_GB","redirectUrl":"https://www.google.com/","billingEmail":"123123"}',
        },
      },
    };

    try {
      checkPaymentMethodSpecificParameters(CTPayment, CTPayment.paymentMethodInfo.method as string);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).message).toBe(
        'SCTM - PAYMENT PROCESSING - billingEmail must be a valid email address',
      );
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(`SCTM - PAYMENT PROCESSING - billingEmail must be a valid email address`, {
        commerceToolsPayment: CTPayment,
      });
    }
  });

  it('should should not throw any error or terminate the process if the payment method is blik and the currency code is PLN and the billing email is provided correctly', () => {
    const CTPayment: Payment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'PLN',
        centAmount: 1000,
        fractionDigits: 2,
      },
      paymentStatus: {},
      transactions: [],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'blik',
      },
      custom: {
        type: {
          typeId: 'type',
          id: 'sctm-payment-custom-fields',
        },
        fields: {
          sctm_create_payment_request:
            '{"description":"Test","locale":"en_GB","redirectUrl":"https://www.google.com/","billingEmail":"n.tran@shopmacher.de"}',
        },
      },
    };

    expect(checkPaymentMethodSpecificParameters(CTPayment, CTPayment.paymentMethodInfo.method as string)).toBe(
      undefined,
    );
    expect(logger.error).toBeCalledTimes(0);
  });
});

describe('checkAmountPlanned', () => {
  it('should throw an error if the amountPlanned is not found', () => {
    const CTPayment = {
      id: '5c8b0375-305a-4f19-ae8e-07806b101999',
      version: 1,
      createdAt: '2024-07-04T14:07:35.625Z',
      lastModifiedAt: '2024-07-04T14:07:35.625Z',
      paymentStatus: {},
      transactions: [],
      interfaceInteractions: [],
      paymentMethodInfo: {
        method: 'dummy',
      },
    };

    try {
      checkAmountPlanned(CTPayment as unknown as Payment);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        `SCTM - PAYMENT PROCESSING - Payment {amountPlanned} not found, commerceToolsPaymentId: ${CTPayment.id}.`,
        {
          commerceToolsPaymentId: CTPayment.id,
        },
      );
    }
  });

  it('should return true if amountPlanned exists', () => {
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
        method: 'dummy',
      },
    };

    expect(checkAmountPlanned(CTPayment)).toBe(true);
  });
});

describe('validateCommerceToolsPaymentPayload', () => {
  const paymentValidators = require('../../src/validators/payment.validators');

  jest.spyOn(paymentValidators, 'checkPaymentMethodInput');
  jest.spyOn(paymentValidators, 'checkValidSuccessChargeTransaction');
  jest.spyOn(paymentValidators, 'checkValidRefundTransactionForCreate');
  jest.spyOn(paymentValidators, 'checkValidRefundTransactionForCancel');
  jest.spyOn(paymentValidators, 'checkValidSuccessAuthorizationTransaction');

  it('should not call the checkPaymentMethodInput when the action is not "CreatePayment"', () => {
    try {
      validateCommerceToolsPaymentPayload('Update', ConnectorActions.GetPaymentMethods, {} as Payment);
    } catch (error: unknown) {
      expect(checkPaymentMethodInput).toBeCalledTimes(0);
    }
  });

  it('should call the checkPaymentMethodInput when the action is "CreatePayment"', () => {
    try {
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
          paymentInterface: 'Mollie',
        },
      };

      validateCommerceToolsPaymentPayload('Update', ConnectorActions.CreatePayment, CTPayment);
    } catch (error: unknown) {
      expect(checkPaymentMethodInput).toBeCalledTimes(1);
    }
  });

  it('should call the checkValidRefundTransaction and checkValidRefundTransactionForCreate when the action is "CreateRefund"', () => {
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
          state: 'Success',
          interactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
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
        paymentInterface: 'Mollie',
      },
    };

    validateCommerceToolsPaymentPayload('Update', ConnectorActions.CreateRefund, CTPayment);
    expect(checkValidSuccessChargeTransaction).toBeCalledTimes(1);
    expect(checkValidRefundTransactionForCreate).toBeCalledTimes(1);
  });

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
      paymentInterface: 'Mollie',
    },
  };

  const dataSet = [
    {
      CTPayment: {
        ...CTPayment,
      },
      exception:
        'SCTM - handleCreateRefund - No successful charge transaction found, CommerceTools Transaction ID: undefined.',
    },
    {
      CTPayment: {
        ...CTPayment,
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
            interactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
          },
        ],
      },
      exception:
        'SCTM - handleCreateRefund - No successful charge transaction found, CommerceTools Transaction ID: undefined.',
    },
    {
      CTPayment: {
        ...CTPayment,
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
            interactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
          },
        ],
      },
      exception: 'SCTM - handleCreateRefund - No initial refund transaction found',
    },
    {
      CTPayment: {
        ...CTPayment,
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
            interactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
          },
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101999',
            type: 'Refund',
            state: 'Initial',
            interactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
          },
        ],
      },
      exception: 'SCTM - handleCreateRefund - No amount found in initial refund transaction',
    },
    {
      CTPayment: {
        ...CTPayment,
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
            interactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
          },
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101999',
            type: 'Refund',
            amount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 0,
              fractionDigits: 2,
            },
            state: 'Initial',
            interactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
          },
        ],
      },
      exception: 'SCTM - handleCreateRefund - No amount found in initial refund transaction',
    },
  ];

  it.each(dataSet)(
    'should throw exception on checkValidRefundTransaction with invalid "CreateRefund" action',
    ({ CTPayment, exception }) => {
      expect(() => {
        validateCommerceToolsPaymentPayload('Update', ConnectorActions.CreateRefund, CTPayment as Payment);
      }).toThrow(exception);
    },
  );

  it('should call the checkValidRefundTransaction and checkValidRefundTransactionForCancel when the action is "CancelRefund"', () => {
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
          state: 'Success',
          interactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
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
          state: 'Pending',
          interactionId: '5c8b0375-305a-4f19-ae8e-07806b102000',
        },
      ],
      interfaceInteractions: [],
      paymentMethodInfo: {
        paymentInterface: 'Mollie',
      },
    };

    validateCommerceToolsPaymentPayload('Update', ConnectorActions.CancelRefund, CTPayment);
    expect(checkValidSuccessChargeTransaction).toBeCalledTimes(1);
    expect(checkValidRefundTransactionForCancel).toBeCalledTimes(1);
  });

  const dataSetForCancelRefund = [
    {
      CTPayment: {
        ...CTPayment,
      },
      exception:
        'SCTM - handleCreateRefund - No successful charge transaction found, CommerceTools Transaction ID: undefined.',
    },
    {
      CTPayment: {
        ...CTPayment,
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
            interactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
          },
        ],
      },
      exception:
        'SCTM - handleCreateRefund - No successful charge transaction found, CommerceTools Transaction ID: undefined.',
    },
    {
      CTPayment: {
        ...CTPayment,
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
            interactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
          },
        ],
      },
      exception: 'SCTM - handleCancelRefund - No pending refund transaction found',
    },
    {
      CTPayment: {
        ...CTPayment,
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
            interactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
          },
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101999',
            type: 'Refund',
            state: 'Pending',
          },
        ],
      },
      exception:
        'SCTM - handleCancelRefund - Cannot get the Mollie refund ID from CommerceTools transaction, transaction ID: 5c8b0375-305a-4f19-ae8e-07806b101999',
    },
    {
      CTPayment: {
        ...CTPayment,
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
            interactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
          },
          {
            id: '5c8b0375-305a-4f19-ae8e-07806b101999',
            type: 'Refund',
            amount: {
              type: 'centPrecision',
              currencyCode: 'EUR',
              centAmount: 0,
              fractionDigits: 2,
            },
            state: 'Pending',
            interactionId: ' ',
          },
        ],
      },
      exception:
        'SCTM - handleCancelRefund - Cannot get the Mollie refund ID from CommerceTools transaction, transaction ID: 5c8b0375-305a-4f19-ae8e-07806b101999',
    },
  ];

  it.each(dataSetForCancelRefund)(
    'should throw exception on checkValidRefundTransaction with invalid "CancelRefund" action',
    ({ CTPayment, exception }) => {
      expect(() => {
        validateCommerceToolsPaymentPayload('Update', ConnectorActions.CancelRefund, CTPayment as Payment);
      }).toThrow(exception);
    },
  );

  it('should call the checkValidSuccessAuthorizationTransaction when the action is "CancelPayment" and throw error if the mollie payment id is not found', () => {
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
          state: 'Success',
          // interactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
        },
      ],
      interfaceInteractions: [],
      paymentMethodInfo: {
        paymentInterface: 'Mollie',
      },
    };

    try {
      validateCommerceToolsPaymentPayload('Update', ConnectorActions.CancelPayment, CTPayment);
    } catch (error: unknown) {
      expect(checkValidSuccessAuthorizationTransaction).toBeCalledTimes(1);
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        `SCTM - handleCancelPayment - Cannot get the Mollie payment ID from CommerceTools transaction, CommerceTools Transaction ID: ${CTPayment.transactions[0].id}.`,
      );
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).message).toBe(
        `SCTM - handleCancelPayment - Cannot get the Mollie payment ID from CommerceTools transaction, CommerceTools Transaction ID: ${CTPayment.transactions[0].id}.`,
      );
      expect((error as CustomError).statusCode).toBe(400);
    }
  });

  it('should call the checkValidSuccessAuthorizationTransaction when the action is "CancelPayment" and return true if the mollie payment id is found', () => {
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
          state: 'Success',
          interactionId: '5c8b0375-305a-4f19-ae8e-07806b101999',
        },
      ],
      interfaceInteractions: [],
      paymentMethodInfo: {
        paymentInterface: 'Mollie',
      },
    };

    validateCommerceToolsPaymentPayload('Update', ConnectorActions.CancelPayment, CTPayment);
    expect(checkValidSuccessAuthorizationTransaction).toBeCalledTimes(1);
    expect(checkValidSuccessAuthorizationTransaction).toBeCalledWith(CTPayment);
    expect(checkValidSuccessAuthorizationTransaction).toReturnWith(true);
  });
});
