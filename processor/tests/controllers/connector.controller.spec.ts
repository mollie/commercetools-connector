import { describe, jest, beforeEach, afterEach, it, expect } from '@jest/globals';
import { Request, Response } from 'express';
import { healthCheck, install, uninstall } from '../../src/controllers/connector.controller';
import { logger } from '../../src/utils/logger.utils';

jest.mock('../../src/service/connector.service', () => ({
  createExtensionAndCustomFields: jest.fn(),
  removeExtension: jest.fn(),
}));

jest.mock('../../src/utils/logger.utils');

describe('Test connector.controller.ts', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

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

  it('should return status code 200 with a successful health check response', async () => {
    req = {};
    await healthCheck(req as Request, res as Response);
    expect(logger.debug).toBeCalledTimes(1);
    expect(logger.debug).toHaveBeenCalledWith('SCTM - healthCheck - The connector is running healthily.');
    expect(res.status).toBeCalledWith(200);
  });

  it('should return status code 200 with a successful install response', async () => {
    req = {
      body: { extensionUrl: 'https://example.com/extensionUrl' },
    };
    await install(req as Request, res as Response);
    expect(logger.debug).toBeCalledTimes(1);
    expect(logger.debug).toHaveBeenCalledWith(
      'SCTM - install - The connector was installed successfully with required extensions and custom fields.',
    );
    expect(res.status).toBeCalledWith(200);
  });

  it('should return status code 400 when extensionUrl is missing during install', async () => {
    req = {
      body: { extensionUrl: '' },
    };
    await install(req as Request, res as Response);
    expect(logger.debug).toBeCalledTimes(1);
    expect(logger.debug).toHaveBeenCalledWith('SCTM - install - Missing body parameters {extensionUrl}.');
    expect(res.status).toBeCalledWith(400);
  });

  it('should return status code 200 with a successful uninstall response', async () => {
    req = {};
    await uninstall(req as Request, res as Response);
    expect(logger.debug).toBeCalledTimes(1);
    expect(logger.debug).toHaveBeenCalledWith('SCTM - uninstall - The connector was uninstalled successfully.');
    expect(res.status).toBeCalledWith(200);
  });
});
