import { Response } from 'express';
import { CTError } from '../../src/types/commercetools.types';
import { apiError } from '../../src/api/error.api';

describe('apiError', () => {
  let response: Response;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    response = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;
  });

  it('should send an error response with 400 status code and the errors array', () => {
    const errors: CTError[] = [
      { code: 'InvalidInput', message: 'Invalid input provided' } as unknown as CTError,
      { code: 'NotFound', message: 'Resource not found' } as unknown as CTError,
    ];

    apiError(response, errors);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ errors });
  });

  it('should send an error response with 400 status code and an empty errors array', () => {
    const errors: CTError[] = [];

    apiError(response, errors);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ errors });
  });
});
