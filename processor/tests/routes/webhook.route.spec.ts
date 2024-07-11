import { describe, it, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import webhookRouter from '../../src/routes/webhook.route';

describe('Test src/route/webhook.route.ts', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    req = {
      body: jest.fn().mockReturnValue({ id: 'tr_123' }),
    };
    res = {
      // @ts-expect-error: ignore type error
      status: jest.fn().mockReturnThis(),
      // @ts-expect-error: ignore type error
      send: jest.fn(),
      // @ts-expect-error: ignore type error
      json: jest.fn(),
    };
  });

  describe('GET /webhook/health-check', () => {
    it('should return 200 and "Webhook is running"', async () => {
      const layer = webhookRouter.stack.find(
        //@ts-expect-error route should be always available
        (layer) => layer.route.path === '/health-check' && layer.route.methods.get,
      );

      expect(layer).toBeDefined();

      //@ts-expect-error handler should be always available
      const handler = layer.route.stack[0].handle;

      expect(handler).toBeDefined();

      await handler(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('Webhook is running');
    });
  });

  describe('POST /webhook/', () => {
    it('should return 200', async () => {
      const layer = webhookRouter.stack.find(
        //@ts-expect-error route should be always available
        (layer) => layer.route.path === '/' && layer.route.methods.post,
      );

      expect(layer).toBeDefined();

      //@ts-expect-error handler should be always available
      const handler = layer.route.stack[0].handle;

      expect(handler).toBeDefined();

      await handler(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
