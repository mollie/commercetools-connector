import { describe, test, expect, jest } from '@jest/globals';
import { ParsedMethodsRequestType } from '../../src/types/mollie.types';

const functions = {
  isParsedMethodsRequestType: jest.fn((obj: ParsedMethodsRequestType): obj is ParsedMethodsRequestType => {
    return typeof obj?.locale === 'string';
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
});
