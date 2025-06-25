import { describe, it, jest, beforeEach, expect, afterEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import webhookRouter from '../../src/routes/processor.route';
import { logger } from '../../src/utils/logger.utils';
import { createPaymentExtension, deletePaymentExtension } from '../../src/commercetools/extensions.commercetools';
import {
  createCustomPaymentType,
  createCustomPaymentInterfaceInteractionType,
  createCustomTransactionType,
} from '../../src/commercetools/customFields.commercetools';
jest.mock('../../src/commercetools/extensions.commercetools', () => ({
  deletePaymentExtension: jest.fn(),
  createPaymentExtension: jest.fn(),
}));

jest.mock('../../src/commercetools/customFields.commercetools', () => ({
  createCustomPaymentType: jest.fn(),
  createCustomPaymentInterfaceInteractionType: jest.fn(),
  createCustomTransactionType: jest.fn(),
}));

describe('Test src/route/processor.route.ts', () => {
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /processor/health-check', () => {
    it('should return 200 and "SCTM - healthCheck - The connector is running healthily."', async () => {
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
    });
  });

  describe('POST /processor/', () => {
    it('should return 200', async () => {
      const layer = webhookRouter.stack.find(
        //@ts-expect-error route should be always available
        (layer) => layer.route.path === '/' && layer.route.methods.post,
      );

      expect(layer).toBeDefined();

      //@ts-expect-error handler should be always available
      const handler = layer.route.stack[0].handle;

      expect(handler).toBeDefined();

      req = {
        body: {
          action: 'Update',
          resource: {
            typeId: 'payment',
            obj: {
              id: '5c8b0375-305a-4f19-ae8e-07806b101999',
              version: 1,
              createdAt: '2024-07-04T14:07:35.625Z',
              lastModifiedAt: '2024-07-04T14:07:35.625Z',
              amountPlanned: {
                type: 'centPrecision',
                currencyCode: 'EUR',
                centAmount: 1000,
                fractionDigits: 2,
              },
              paymentStatus: {},
              transactions: [
                {
                  id: '199292919285',
                  type: 'Charge',
                  interactionId: 'tr_123123',
                  amount: {
                    type: 'centPrecision',
                    currencyCode: 'EUR',
                    centAmount: 1000,
                    fractionDigits: 2,
                  },
                  state: 'Success',
                },
                {
                  id: 'test_refund',
                  type: 'Refund',
                  amount: {
                    type: 'centPrecision',
                    currencyCode: 'EUR',
                    centAmount: 1000,
                    fractionDigits: 2,
                  },
                  state: 'Initial',
                },
              ],
              interfaceInteractions: [],
              paymentMethodInfo: {
                method: 'creditcard',
              },
            },
          },
        },
      };

      await handler(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe('POST /install/', () => {
    it('should return 200 if hostname is provided', async () => {
      const layer = webhookRouter.stack.find(
        //@ts-expect-error route should be always available
        (layer) => layer.route.path === '/install' && layer.route.methods.post,
      );
      expect(layer).toBeDefined();

      //@ts-expect-error handler should be always available
      const handler = layer.route.stack[0].handle;

      expect(handler).toBeDefined();

      (createPaymentExtension as jest.Mock).mockReturnValueOnce(Promise.resolve());
      (createCustomPaymentType as jest.Mock).mockReturnValueOnce(Promise.resolve());
      (createCustomPaymentInterfaceInteractionType as jest.Mock).mockReturnValueOnce(Promise.resolve());
      (createCustomTransactionType as jest.Mock).mockReturnValueOnce(Promise.resolve());

      req = {
        hostname: 'test.com',
        secure: true,
        protocol: 'https',
      };

      await handler(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).not.toHaveBeenCalled;
    });

    it('should return 400 if hostname is not provided', async () => {
      const layer = webhookRouter.stack.find(
        //@ts-expect-error route should be always available
        (layer) => layer.route.path === '/install' && layer.route.methods.post,
      );
      expect(layer).toBeDefined();

      //@ts-expect-error handler should be always available
      const handler = layer.route.stack[0].handle;

      expect(handler).toBeDefined();

      req = {
        hostname: '',
        secure: true,
        protocol: 'https',
      };

      await handler(req as Request, res as Response, next);

      expect(logger.debug).toBeCalledTimes(1);
      expect(logger.debug).toHaveBeenCalledWith('SCTM - install - Missing body parameters {extensionUrl}.');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).not.toHaveBeenCalledWith();
    });
  });

  describe('POST /uninstall/', () => {
    it('should return 200', async () => {
      const layer = webhookRouter.stack.find(
        //@ts-expect-error route should be always available
        (layer) => layer.route.path === '/uninstall' && layer.route.methods.post,
      );
      expect(layer).toBeDefined();

      //@ts-expect-error handler should be always available
      const handler = layer.route.stack[0].handle;

      expect(handler).toBeDefined();

      (deletePaymentExtension as jest.Mock).mockReturnValueOnce(Promise.resolve());

      await handler(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).not.toHaveBeenCalledWith();
    });
  });
});
