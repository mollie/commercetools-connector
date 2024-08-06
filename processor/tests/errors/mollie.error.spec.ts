import { CTEnumErrors } from './../../src/types/commercetools.types';
import { jest, expect, describe, it } from '@jest/globals';
import { formatErrorResponse, getExtraInfo } from '../../src/errors/mollie.error';

describe('Test getExtraInfo', () => {
  it('should return correct information', () => {
    const input = {
      status: 'Error',
      statusCode: 400,
      links: 'dummy link',
      title: 'dummy title',
      field: 'dummy field',
      test: 'test',
    };

    const result = getExtraInfo(input);

    expect(result).toEqual({
      originalStatusCode: input.status,
      field: input.field,
      links: input.links,
      title: input.title,
    });
  });
});

describe('Test formatErrorResponse', () => {
  jest.spyOn(require('../../src/errors/mollie.error'), 'getExtraInfo');

  it('should return syntax error', () => {
    const error = {
      statusCode: 400,
      message: 'Something wrong happened',
    };

    const result = formatErrorResponse(error);

    expect(getExtraInfo).toBeCalledTimes(1);
    expect(getExtraInfo).toBeCalledWith(error);

    expect(result).toEqual({
      status: 400,
      errors: [
        {
          code: CTEnumErrors.SyntaxError,
          message: error.message,
          extensionExtraInfo: {
            originalStatusCode: error.statusCode,
          },
        },
      ],
    });
  });

  it('should return general error', () => {
    const error = {
      statusCode: 500,
    };

    const result = formatErrorResponse(error);

    expect(getExtraInfo).toBeCalledTimes(1);
    expect(getExtraInfo).toBeCalledWith(error);

    expect(result).toEqual({
      status: 400,
      errors: [
        {
          code: CTEnumErrors.General,
          message: 'Please see logs for more details',
          extensionExtraInfo: {
            originalStatusCode: error.statusCode,
          },
        },
      ],
    });
  });
});
