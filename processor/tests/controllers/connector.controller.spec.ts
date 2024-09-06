import { describe, jest, beforeEach, afterEach, it, expect } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';
import { healthCheck, install } from '../../src/controllers/connector.controller';
import { logger } from '../../src/utils/logger.utils';

jest.mock('../../src/service/connector.service', () => ({
  createExtensionAndCustomFields: jest.fn(),
  removeExtension: jest.fn(),
}));

describe('Test connector.controller.ts', () => {
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

  it('should return status code 200 with health check successful response', async () => {
    req = {};
    await healthCheck(req as Request, res as Response);
    expect(logger.debug).toBeCalledTimes(1);
    expect(logger.debug).toHaveBeenCalledWith('SCTM - healthCheck - The connector is running healthily.');
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it('should return status code 200 with install successful response', async () => {
    req = {
      body: { extensionUrl: 'https://example.com/extensionUrl' },
    };
    await install(req as Request, res as Response);
    expect(logger.debug).toBeCalledTimes(1);
    expect(logger.debug).toHaveBeenCalledWith(
      'SCTM - install - The connector was installed successfully with required extensions and custom fields.',
    );
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });
});
