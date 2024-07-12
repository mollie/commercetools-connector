import { Payment } from '@commercetools/platform-sdk';
import {
  checkExtensionAction,
  checkPaymentInterface,
  checkPaymentMethodInput,
  checkPaymentMethodSpecificParameters,
  hasValidPaymentMethod,
} from './../../src/validators/payment.validators';
import { describe, it, expect, jest, afterEach } from '@jest/globals';
import CustomError from '../../src/errors/custom.error';
import SkipError from '../../src/errors/skip.error';

jest.mock('@mollie/api-client', () => ({
  PaymentMethod: {
    applePay: 'applePay',
    paypal: 'paypal',
    dummy: 'dummy',
    creditcard: 'creditcard',
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
    expect(hasValidPaymentMethod('applePay')).toBe(true);
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

  it('should throw CustomError and a correct error message if the payment method is not defined', () => {
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
      checkPaymentMethodInput(CTPayment);
    } catch (error: any) {
      expect(error).toBeInstanceOf(CustomError);
      expect(error.message).toBe(
        'SCTM - PAYMENT PROCESSING - Payment method must be set in order to create a Mollie payment.',
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
      checkPaymentMethodInput(CTPayment);
    } catch (error: any) {
      expect(error).toBeInstanceOf(CustomError);
      expect(error.message).toBe(
        `SCTM - PAYMENT PROCESSING - Invalid paymentMethodInfo.method "${CTPayment.paymentMethodInfo.method}".`,
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

    expect(checkPaymentMethodInput(CTPayment)).toBe(true);
  });
});

describe('checkPaymentMethodSpecificParameters', () => {
  it('should return false if the payment method is creditcard and cardToken is not defined in Custom Field', () => {
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

    expect(checkPaymentMethodSpecificParameters(CTPayment, CTPayment.paymentMethodInfo.method as string)).toBe(false);
  });

  it('should return false if the payment method is creditcard and cardToken is an empty string', () => {
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
            '{"description":"Test","locale":"en_GB","redirectUrl":"https://www.google.com/","cardToken":""}',
        },
      },
    };

    expect(checkPaymentMethodSpecificParameters(CTPayment, CTPayment.paymentMethodInfo.method as string)).toBe(false);
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

    expect(checkPaymentMethodSpecificParameters(CTPayment, CTPayment.paymentMethodInfo.method as string)).toBe(true);
  });
});
