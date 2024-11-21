import { describe, test, expect, jest } from '@jest/globals';
import {
  ApplePaySessionRequest,
  CustomPaymentMethod,
  ParsedMethodsRequestType,
  SupportedPaymentMethods,
} from '../../src/types/mollie.types';

const functions = {
  isParsedMethodsRequestType: jest.fn((obj: ParsedMethodsRequestType): obj is ParsedMethodsRequestType => {
    return typeof obj?.locale === 'string';
  }),

  isApplePaySessionRequest: jest.fn((obj: ApplePaySessionRequest): obj is ApplePaySessionRequest => {
    return typeof obj?.domain === 'string' && typeof obj?.validationUrl === 'string';
  }),
};

describe('Test mollie.types.ts', () => {
  test('should return the correct {ParsedMethodsRequestType} type declaration', () => {
    const mockType = {
      locale: 'de_DE',
    } as ParsedMethodsRequestType;
    expect(functions.isParsedMethodsRequestType(mockType)).toBeTruthy();
  });

  test('should return the incorrect {ParsedMethodsRequestType} type declaration', () => {
    const mockType = 'Not a correct type' as ParsedMethodsRequestType;
    expect(functions.isParsedMethodsRequestType(mockType)).toBeFalsy();
  });

  test('should return the correct {ApplePaySessionRequest} type declaration', () => {
    const mockType = {
      domain: 'pay.mywebshop.com',
      validationUrl: 'https://apple-pay-gateway-cert.apple.com/paymentservices/paymentSession',
    } as ApplePaySessionRequest;
    expect(functions.isApplePaySessionRequest(mockType)).toBeTruthy();
  });

  test('should return the incorrect {ApplePaySessionRequest} type declaration', () => {
    const mockType = {
      domain: 'pay.mywebshop.com',
    } as ApplePaySessionRequest;
    expect(functions.isApplePaySessionRequest(mockType)).toBeFalsy();
  });

  test('should return the correct SupportedPaymentMethods', () => {
    expect(SupportedPaymentMethods.ideal).toBe('ideal');
    expect(SupportedPaymentMethods.creditcard).toBe('creditcard');
    expect(SupportedPaymentMethods.bancontact).toBe('bancontact');
    expect(SupportedPaymentMethods.banktransfer).toBe('banktransfer');
    expect(SupportedPaymentMethods.przelewy24).toBe('przelewy24');
    expect(SupportedPaymentMethods.kbc).toBe('kbc');
    expect(SupportedPaymentMethods.blik).toBe('blik');
    expect(SupportedPaymentMethods.applepay).toBe('applepay');
    expect(SupportedPaymentMethods.paypal).toBe('paypal');
    expect(SupportedPaymentMethods.giftcard).toBe('giftcard');
    expect(SupportedPaymentMethods.googlepay).toBe('googlepay');
  });

  test('should return correct custom method', () => {
    expect(CustomPaymentMethod.blik).toBe('blik');
  });
});
