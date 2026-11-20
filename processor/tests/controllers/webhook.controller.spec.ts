import { describe, jest, it, expect, beforeEach, afterEach } from '@jest/globals';
import { post } from '../../src/controllers/webhook.controller';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../src/utils/logger.utils';
import { handlePaymentWebhook } from '../../src/service/payment.service';
import { isPayment } from '../../src/utils/mollie.utils';

jest.mock('../../src/service/payment.service', () => ({
  handlePaymentWebhook: jest.fn(),
}));

jest.mock('../../src/utils/mollie.utils', () => ({
  isPayment: jest.fn(),
}));

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return only status code 200 with warning log', async () => {
    (isPayment as jest.Mock).mockReturnValue(false);

    req = {
      body: { id: 'xxx_123' },
    };

    await post(req as Request, res as Response, next);

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith('Webhook with id xxx_123 is not a payment event.');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it('should return status code 200', async () => {
    (isPayment as jest.Mock).mockReturnValue(true);
    (handlePaymentWebhook as jest.Mock).mockReturnValue(true);

    req = {
      body: { id: 'tr_123' },
    };

    await post(req as Request, res as Response, next);

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('Webhook with id tr_123 is handled successfully.');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it('should return status code 400 if the payment was not handled successfully', async () => {
    (isPayment as jest.Mock).mockReturnValue(true);
    (handlePaymentWebhook as jest.Mock).mockReturnValue(false);

    req = {
      body: { id: 'tr_123' },
    };

    await post(req as Request, res as Response, next);

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(
      'Webhook with id tr_123 is handled unsuccessfully, retry will be take place automatically.',
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalled();
  });

  it('should catch exception error', async () => {
    (isPayment as jest.Mock).mockReturnValue(true);

    req = {
      body: { id: 'tr_123' },
    };

    (handlePaymentWebhook as jest.Mock).mockImplementation(() => {
      throw new Error('error');
    });

    await post(req as Request, res as Response, next);

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith('Error processing webhook event', { message: 'error' });
    expect((next as jest.Mock).mock.calls[0][0]).toMatchObject({ message: 'error' });
  });

  it('should catch other exception', async () => {
    (isPayment as jest.Mock).mockReturnValue(true);

    req = {
      body: { id: 'tr_123' },
    };

    (handlePaymentWebhook as jest.Mock).mockImplementation(() => {
      throw { message: 'An error occurred', code: 500, request: { body: { email: 'customer@example.com' } } };
    });

    await post(req as Request, res as Response, next);

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith('Error processing webhook event', {
      message: 'An error occurred',
      code: 500,
    });
    expect((next as jest.Mock).mock.calls[0][0]).toMatchObject({ message: 'An error occurred' });
  });
});
