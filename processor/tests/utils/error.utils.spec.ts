import { describe, test, expect } from '@jest/globals';
import { toErrorLog } from '../../src/utils/error.utils';

describe('toErrorLog', () => {
  test('keeps message, status, code and field and drops everything else', () => {
    const error = Object.assign(new Error('Bad request'), {
      statusCode: 422,
      field: 'amount',
      originalRequest: { headers: { Authorization: 'Bearer must-not-be-logged' } },
    });

    expect(toErrorLog(error)).toEqual({ message: 'Bad request', statusCode: 422, field: 'amount' });
  });

  test('handles non-object values', () => {
    expect(toErrorLog('boom')).toEqual({ message: 'boom' });
  });
});
