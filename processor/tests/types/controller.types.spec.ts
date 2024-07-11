import { describe, test, expect, jest } from '@jest/globals';
import { ControllerResponseType, DeterminePaymentActionType } from '../../src/types/controller.types';

const functions = {
  isControllerResponseType: jest.fn((obj: ControllerResponseType): obj is ControllerResponseType => {
    return isFinite(obj?.statusCode);
  }),

  isDeterminePaymentActionType: jest.fn((obj: DeterminePaymentActionType): obj is DeterminePaymentActionType => {
    return typeof obj?.action === 'string';
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
    const mockType = {
      action: 'getPaymentMethods',
      errorMessage: 'SCTM - Object ctPayment not found',
    } as DeterminePaymentActionType;

    expect(functions.isDeterminePaymentActionType(mockType)).toBeTruthy();
  });

  test('should return the incorrect {DeterminePaymentActionType} type declaration', () => {
    const mockType = {
      trigger: 'getPaymentMethods',
      errorMessage: 'SCTM - Object ctPayment not found',
    } as unknown as DeterminePaymentActionType;

    expect(functions.isDeterminePaymentActionType(mockType)).toBeFalsy();
  });
});
