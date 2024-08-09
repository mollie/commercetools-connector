import { describe, test, expect, jest } from '@jest/globals';
import { ControllerResponseType, DeterminePaymentActionType } from '../../src/types/controller.types';

const functions = {
  isControllerResponseType: jest.fn((obj: ControllerResponseType): obj is ControllerResponseType => {
    return isFinite(obj?.statusCode);
  }),

  isDeterminePaymentActionType: jest.fn((obj: DeterminePaymentActionType): obj is DeterminePaymentActionType => {
    return typeof obj === 'string';
  }),
};

describe('Test controller.types.ts', () => {
  test('should return the correct {ControllerResponseType} type declaration', () => {
    const mockType = {
      statusCode: 400,
      actions: [],
    } as ControllerResponseType;

    expect(functions.isControllerResponseType(mockType)).toBeTruthy();
  });

  test('should return the incorrect {ControllerResponseType} type declaration', () => {
    const mockType = {
      status: 400,
      actions: [],
    } as unknown as ControllerResponseType;

    expect(functions.isControllerResponseType(mockType)).toBeFalsy();
  });

  test('should return the correct {DeterminePaymentActionType} type declaration', () => {
    expect(functions.isDeterminePaymentActionType('getPaymentMethods')).toBeTruthy();
    expect(functions.isDeterminePaymentActionType('createPayment')).toBeTruthy();
    expect(functions.isDeterminePaymentActionType('cancelPayment')).toBeTruthy();
    expect(functions.isDeterminePaymentActionType('createRefund')).toBeTruthy();
    expect(functions.isDeterminePaymentActionType('cancelRefund')).toBeTruthy();
    expect(functions.isDeterminePaymentActionType('noAction')).toBeTruthy();
    expect(functions.isDeterminePaymentActionType('getApplePaySession')).toBeTruthy();
  });
});
