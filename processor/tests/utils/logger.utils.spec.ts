import { logger } from '../../src/utils/logger.utils';
import { describe, test, expect } from '@jest/globals';

describe('Test logger.utils.ts', () => {
  test('should return the correct logger with debug level', () => {
    expect(logger).toBeDefined();
    expect(logger.level).toBe('debug');
  });
});
