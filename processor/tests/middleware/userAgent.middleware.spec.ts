import { describe, it, expect } from '@jest/globals';
import { userAgentMiddlewareOptions } from '../../src/middleware/userAgent.middleware';
import { LIBRARY_NAME, LIBRARY_VERSION } from '../../src/utils/constant.utils';

describe('Test userAgent.middleware.ts', () => {
  it('should return correct version string', () => {
    expect(`${userAgentMiddlewareOptions.libraryName}/${userAgentMiddlewareOptions.libraryVersion}`).toEqual(
      `${LIBRARY_NAME}/${LIBRARY_VERSION}`,
    );
  });
});
