import { describe, jest, afterEach, it, expect } from '@jest/globals';
import { logger } from '../../src/utils/logger.utils';
import { updatePaymentExtensionAccessToken } from '../../src/service/job.service';
import { getAccessToken } from '../../src/commercetools/auth.commercetools';
import { updatePaymentExtension } from '../../src/commercetools/extensions.commercetools';

jest.mock('../../src/commercetools/auth.commercetools', () => ({
  getAccessToken: jest.fn(),
}));

jest.mock('../../src/commercetools/extensions.commercetools', () => ({
  updatePaymentExtension: jest.fn(),
}));

describe('Test job.service.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('test updatePaymentExtensionAccessToken', async () => {
    await updatePaymentExtensionAccessToken();

    expect(getAccessToken).toBeCalledTimes(1);
    expect(updatePaymentExtension).toBeCalledTimes(1);
    expect(logger.info).toBeCalledTimes(2);
  });
});
