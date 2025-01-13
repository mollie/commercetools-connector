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
import { logger } from '../../src/utils/logger.utils';
import { getAccessToken } from '../../src/commercetools/auth.commercetools';
import { updatePaymentExtension } from '../../src/commercetools/extensions.commercetools';

jest.mock('../../src/commercetools/auth.commercetools', () => ({
  getAccessToken: jest.fn(),
}));

jest.mock('../../src/commercetools/extensions.commercetools', () => ({
  updatePaymentExtension: jest.fn(),
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
    await post(req as Request, res as Response);
    expect(getAccessToken).toBeCalledTimes(1);
    expect(updatePaymentExtension).toBeCalledTimes(1);
    expect(logger.info).toBeCalledTimes(2);
    expect(res.status).toBeCalledWith(200);
  });
});
