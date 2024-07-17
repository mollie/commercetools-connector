import { describe, jest, it, beforeEach } from '@jest/globals';

jest.mock('../../src/service/payment.service', () => ({
  handlePaymentWebhook: jest.fn(),
}));

import { post } from '../../src/controllers/webhook.controller';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../src/utils/logger.utils';

describe('Test webhook.controller.ts', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    res = {
      // @ts-expect-error: ignore type error
      status: jest.fn().mockReturnThis(),
      // @ts-expect-error: ignore type error
      send: jest.fn(),
      // @ts-expect-error: ignore type error
      json: jest.fn(),
    };
  });

  it('should return only status code 200 with warning log', async () => {
    req = {
      body: { id: 'xxx_123' },
    };

    await post(req as Request, res as Response, next);

    expect(logger.warn).toHaveBeenCalledWith('Webhook with id xxx_123 is not a payment event.');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it('should return only status code 200', async () => {
    req = {
      body: { id: 'tr_123' },
    };

    await post(req as Request, res as Response, next);

    expect(logger.info).toHaveBeenCalledWith('Webhook with id tr_123 is handled successfully.');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });
});
