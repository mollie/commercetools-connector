import { describe, it, expect } from '@jest/globals';
import { httpMiddlewareOptions } from '../../src/middleware/http.middleware';

describe('Test http.middleware.ts', () => {
  it('should have correct options', () => {
    expect(httpMiddlewareOptions.host).toBeDefined();
  });

  it('should return correct host', () => {
    expect(httpMiddlewareOptions.host).toEqual(`https://api.${process.env.CTP_REGION}.commercetools.com`);
  });
});
