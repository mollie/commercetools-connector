import { describe, it, expect } from '@jest/globals';
import { userAgentMiddlewareOptions } from '../../src/middleware/userAgent.middleware';
import { VERSION_STRING } from '../../src/utils/constant.utils';

describe('Test userAgent.middleware.ts', () => {
  it('should return correct version string', () => {
    expect(`${userAgentMiddlewareOptions.libraryName}/${userAgentMiddlewareOptions.libraryVersion}`).toEqual(
      `${VERSION_STRING}`,
    );
  });
});
