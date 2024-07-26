import { ConnectorActions } from './../../src/utils/constant.utils';
import { Payment } from '@commercetools/platform-sdk';
import {
  checkExtensionAction,
  checkPaymentInterface,
  checkPaymentMethodInput,
  checkValidRefundTransaction,
  checkPaymentMethodSpecificParameters,
  hasValidPaymentMethod,
  validateCommerceToolsPaymentPayload,
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

    try {
      checkPaymentMethodSpecificParameters(CTPayment);
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

    try {
      checkPaymentMethodSpecificParameters(CTPayment);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).message).toBe(
        'SCTM - PAYMENT PROCESSING - cardToken is required for payment method creditcard',
      );
      expect(logger.error).toBeCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        `SCTM - PAYMENT PROCESSING - cardToken is required for payment method creditcard, CommerceTools Payment ID: ${CTPayment.id}`,
        {
          cardToken: '',
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
      checkPaymentMethodSpecificParameters(CTPayment);
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

    expect(checkPaymentMethodSpecificParameters(CTPayment)).toBe(undefined);
  });
});

import * as paymentValidators from '../../src/validators/payment.validators';

describe('validateCommerceToolsPaymentPayload', () => {
  jest.spyOn(paymentValidators, 'checkPaymentMethodInput');
  jest.spyOn(paymentValidators, 'checkValidRefundTransaction');

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

  it('should call the checkValidRefundTransaction when the action is "CreateRefund"', () => {
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
    expect(checkValidRefundTransaction).toBeCalledTimes(1);
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
      exception: 'SCTM - handleCreateRefund - No successful charge transaction found',
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
      exception: 'SCTM - handleCreateRefund - No successful charge transaction found',
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
});
