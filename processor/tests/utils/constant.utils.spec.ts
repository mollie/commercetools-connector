import { describe, test, expect } from '@jest/globals';
import { CustomFields, ConnectorActions, ErrorMessages, CancelRefundStatusText } from '../../src/utils/constant.utils';

describe('Test constant.utils.ts', () => {
  test('should return the correct {CustomFields} constant', () => {
    expect(CustomFields).toBeDefined();
    expect(CustomFields?.payment).toBeDefined();
    expect(CustomFields?.payment?.request).toBeDefined();
    expect(CustomFields?.payment?.response).toBeDefined();
    expect(CustomFields?.payment?.error).toBeDefined();
  });

  test('should return the correct {ErrorMessages} constant', () => {
    expect(ErrorMessages).toBeDefined();
    expect(ErrorMessages?.paymentObjectNotFound).toBeDefined();
    expect(ErrorMessages?.paymentObjectNotFound).toBe('Object ctPayment not found');
  });

  test('should return the correct {ConnectorActions} constant', () => {
    expect(ConnectorActions).toBeDefined();
    expect(ConnectorActions?.GetPaymentMethods).toBeDefined();
    expect(ConnectorActions?.CreatePayment).toBeDefined();
    expect(ConnectorActions?.CancelRefund).toBeDefined();
    expect(ConnectorActions?.NoAction).toBeDefined();
    expect(ConnectorActions?.GetPaymentMethods).toBe('getPaymentMethods');
    expect(ConnectorActions?.CreatePayment).toBe('createPayment');
    expect(ConnectorActions?.CancelRefund).toBe('cancelRefund');
    expect(ConnectorActions?.NoAction).toBe('noAction');
  });

  test('should return the correct {CancelRefundStatusText} constant', () => {
    expect(CancelRefundStatusText).toBeDefined();
    expect(CancelRefundStatusText).toBe('Cancelled from shop side');
  });
});
