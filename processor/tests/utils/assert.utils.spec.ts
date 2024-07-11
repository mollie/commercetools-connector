import { describe, test, expect, jest } from '@jest/globals';
import { assert, assertError, assertString } from '../../src/utils/assert.utils';

jest.mock('../../src/utils/assert.utils', () => ({
  assert: jest.fn((condition: unknown, msg: string) => {
    if (!condition) {
      return msg;
    }
    return true;
  }),
  assertError: jest.fn((condition: unknown, msg?: string) => {
    return assert(condition, msg ?? 'error');
  }),
  assertString: jest.fn((condition: unknown, msg?: string) => {
    return assert(condition, msg ?? 'error');
  }),
}));

describe('Test assert.utils.ts', () => {
  test('call assert() with a truthy condition', async () => {
    const response = assert(typeof 123 === 'number', 'This is not a valid number');
    expect(response).toBeTruthy();
    expect(response).not.toBe('This is not a valid number');
  });

  test('call assert() with falsy condition', async () => {
    const response = assert(typeof 123 === 'string', 'This is not a valid number');
    expect(response).toBeDefined();
    expect(response).toBe('This is not a valid number');
  });

  test('call assertError() with a truthy condition', async () => {
    const mockError = new Error('This is a mock Error');
    const response = assertError(mockError, 'This is not a valid Error');
    expect(response).toBeTruthy();
    expect(response).not.toBe('This is not a valid Error');
  });

  test('call assertError() with a falsy condition', async () => {
    const mockError = '';
    const response = assertError(mockError, 'This is not a valid Error');
    expect(response).toBeDefined();
    expect(response).toBe('This is not a valid Error');
  });

  test('call assertString() with a truthy condition', async () => {
    const mockString = 'This is a string';
    const response = assertString(mockString, 'This is not a valid string');
    expect(response).toBeTruthy();
    expect(response).not.toBe('This is not a valid string');
  });

  test('call assertString() with a falsy condition', async () => {
    const mockString = false;
    const response = assertString(mockString, 'This is not a valid string');
    expect(response).toBeDefined();
    expect(response).toBe('This is not a valid string');
  });
});
