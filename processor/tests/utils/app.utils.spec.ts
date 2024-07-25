import { describe, test, expect, jest } from '@jest/globals';
import { createDateNowString } from '../../src/utils/app.utils';

describe('Test app.utils.ts', () => {
  test('should return createDateNowString correct time', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-07-24'));

    expect(createDateNowString()).toBe('2024-07-24T00:00:00.000Z');
  });
});
