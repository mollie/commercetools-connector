import { authMiddlewareOptions } from '../../src/middleware/auth.middleware';
import { describe, it, expect } from '@jest/globals';

describe('Test auth.middleware.ts', () => {
  it('should have correct options', () => {
    expect(authMiddlewareOptions.scopes).toBeDefined();
    expect(authMiddlewareOptions.credentials).toBeDefined();
    expect(authMiddlewareOptions.host).toBeDefined();
    expect(authMiddlewareOptions.projectKey).toBeDefined();
  });

  it('should return correct host', () => {
    expect(authMiddlewareOptions.host).toEqual(`https://auth.${process.env.CTP_REGION}.commercetools.com`);
  });

  it('should return correct scopes', () => {
    expect(authMiddlewareOptions.scopes).toEqual([process.env.CTP_SCOPE as string]);
  });

  it('should return correct credentials', () => {
    expect(authMiddlewareOptions.credentials).toEqual({
      clientId: process.env.CTP_CLIENT_ID as string,
      clientSecret: process.env.CTP_CLIENT_SECRET as string,
    });
  });

  it('should return correct projectKey', () => {
    expect(authMiddlewareOptions.projectKey).toEqual(process.env.CTP_PROJECT_KEY as string);
  });
});
