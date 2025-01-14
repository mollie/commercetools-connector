import { updatePaymentExtensionAccessToken } from './../../src/service/job.service';
import {
  describe,
  jest,
  beforeEach,
  afterEach,
  it,
  expect,
} from '@jest/globals';
import { Request, Response } from 'express';
import { post } from '../../src/controllers/job.controller';

jest.mock('../../src/service/job.service', () => ({
  updatePaymentExtensionAccessToken: jest.fn(),
}));

jest.mock('../../src/utils/logger.utils');

describe('Test job.controller.ts', () => {
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
    await post(req as Request, res as Response);
    expect(updatePaymentExtensionAccessToken).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(200);
  });
});
