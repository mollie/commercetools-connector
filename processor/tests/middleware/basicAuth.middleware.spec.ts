import { describe, it, jest, beforeEach, expect, afterEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { basicAuthMiddleware } from '../../src/middleware/basicAuth.middleware';

jest.mock('../../src/utils/config.utils', () => ({
  readConfiguration: jest.fn().mockReturnValue({
    commerceTools: {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    },
  }),
}));

describe('basicAuthMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      // @ts-expect-error: ignore type error
      status: jest.fn().mockReturnThis(),
      // @ts-expect-error: ignore type error
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() when valid Basic Auth credentials are provided', () => {
    const validCredentials = Buffer.from('test-client-id:test-client-secret').toString('base64');
    req.headers = {
      authorization: `Basic ${validCredentials}`,
    };

    basicAuthMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header is missing', () => {
    req.headers = {};

    basicAuthMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid Authorization header' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header does not start with "Basic "', () => {
    req.headers = {
      authorization: 'Bearer token123',
    };

    basicAuthMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid Authorization header' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 when credentials do not match', () => {
    const invalidCredentials = Buffer.from('wrong-id:wrong-secret').toString('base64');
    req.headers = {
      authorization: `Basic ${invalidCredentials}`,
    };

    basicAuthMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 when client ID is correct but secret is wrong', () => {
    const invalidCredentials = Buffer.from('test-client-id:wrong-secret').toString('base64');
    req.headers = {
      authorization: `Basic ${invalidCredentials}`,
    };

    basicAuthMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 when client secret is correct but ID is wrong', () => {
    const invalidCredentials = Buffer.from('wrong-id:test-client-secret').toString('base64');
    req.headers = {
      authorization: `Basic ${invalidCredentials}`,
    };

    basicAuthMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    expect(next).not.toHaveBeenCalled();
  });
});
