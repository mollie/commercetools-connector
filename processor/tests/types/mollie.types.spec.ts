import { describe, test, expect, jest } from '@jest/globals';
import { ApplePaySessionRequest, ParsedMethodsRequestType } from '../../src/types/mollie.types';

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
});
