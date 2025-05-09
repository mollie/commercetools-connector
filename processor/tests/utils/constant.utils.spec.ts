import { describe, test, expect } from '@jest/globals';
import {
  CustomFields,
  ConnectorActions,
  ErrorMessages,
  CancelStatusText,
  LIBRARY_NAME,
  LIBRARY_VERSION,
  PAY_LATER_ENUMS,
  DUE_DATE_PATTERN,
  DEFAULT_DUE_DATE,
  MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
  MOLLIE_SURCHARGE_LINE_DESCRIPTION,
  MOLLIE_SHIPPING_LINE_DESCRIPTION,
} from '../../src/utils/constant.utils';
import { version } from '../../package.json';

describe('Test constant.utils.ts', () => {
  test('should return the correct {LIBRARY_NAME} constant', () => {
    expect(LIBRARY_NAME).toBeDefined();
    expect(LIBRARY_NAME).toBe('ShopmacherCommercetoolsMollieConnector');
  });

  test('should return the correct {LIBRARY_VERSION} constant', () => {
    expect(LIBRARY_VERSION).toBeDefined();
    expect(LIBRARY_VERSION).toBe(version);
  });

  test('should return the correct {CustomFields} constant', () => {
    expect(CustomFields).toBeDefined();
    expect(CustomFields?.payment).toBeDefined();
    expect(CustomFields?.payment?.request).toBeDefined();
    expect(CustomFields?.payment?.response).toBeDefined();
    expect(CustomFields?.payment?.error).toBeDefined();
    expect(CustomFields?.payment?.profileId).toBeDefined();

    expect(CustomFields?.createPayment?.request).toBeDefined();
    expect(CustomFields?.createPayment?.interfaceInteraction).toBeDefined();

    expect(CustomFields?.transactions.defaultCustomTypeKey).toBeDefined();
    expect(CustomFields?.transactions.resourceTypeId).toBeDefined();
    expect(CustomFields?.transactions.name).toBeDefined();
    expect(CustomFields?.transactions.fields.cancelPaymentReasonText.name).toBeDefined();
    expect(CustomFields?.transactions.fields.cancelPaymentStatusText.name).toBeDefined();
    expect(CustomFields?.transactions.fields.molliePaymentIdToRefund.name).toBeDefined();
    expect(CustomFields?.transactions.fields.surchargeCost.name).toBeDefined();
    expect(CustomFields?.transactions.fields.shouldCapturePayment.name).toBeDefined();
    expect(CustomFields?.transactions.fields.capturePaymentDescription.name).toBeDefined();
    expect(CustomFields?.transactions.fields.capturePaymentErrors.name).toBeDefined();

    expect(CustomFields?.applePay?.session?.request).toBeDefined();
    expect(CustomFields?.applePay?.session?.response).toBeDefined();
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
    expect(ConnectorActions?.GetApplePaySession).toBe('getApplePaySession');
  });

  test('should return the correct {CancelStatusText} constant', () => {
    expect(CancelStatusText).toBeDefined();
    expect(CancelStatusText).toBe('Cancelled from shop side');
  });

  test('should return the correct {PAY_LATER_ENUMS} constant', () => {
    expect(PAY_LATER_ENUMS).toBeDefined();
    expect(PAY_LATER_ENUMS).toContain('klarnapaylater');
    expect(PAY_LATER_ENUMS).toContain('klarnasliceit');
  });

  test('should return correct {DUE_DATE_PATTERN} pattern', () => {
    expect(DUE_DATE_PATTERN).toBeDefined();
  });

  test('should return correct {DEFAULT_DUE_DATE} pattern', () => {
    expect(DEFAULT_DUE_DATE).toBeDefined();
    expect(DEFAULT_DUE_DATE).toBe(14);
  });

  test('should return correct {MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM} pattern', () => {
    expect(MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM).toBeDefined();
    expect(MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM).toBe('mollie-surcharge-line-item');
  });

  test('should return correct {MOLLIE_SURCHARGE_LINE_DESCRIPTION} pattern', () => {
    expect(MOLLIE_SURCHARGE_LINE_DESCRIPTION).toBeDefined();
    expect(MOLLIE_SURCHARGE_LINE_DESCRIPTION).toBe('Total surcharge amount');
  });

  test('should return correct {MOLLIE_SHIPPING_LINE_DESCRIPTION} pattern', () => {
    expect(MOLLIE_SHIPPING_LINE_DESCRIPTION).toBeDefined();
    expect(MOLLIE_SHIPPING_LINE_DESCRIPTION).toBe('Shipping amount');
  });
});
