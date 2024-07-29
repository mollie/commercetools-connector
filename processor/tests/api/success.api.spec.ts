import { UpdateAction } from '@commercetools/sdk-client-v2';
import { Response } from 'express';
import { apiSuccess } from '../../src/api/success.api';

describe('test success.api', () => {
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

  it('should send a success response with status code and update actions', () => {
    const statusCode = 200;
    const updateActions: UpdateAction[] = [{ action: 'testAction' }];

    apiSuccess(statusCode, response, updateActions);

    expect(statusMock).toHaveBeenCalledWith(statusCode);
    expect(jsonMock).toHaveBeenCalledWith({ actions: updateActions });
  });

  it('should send a success response with status code and no update actions', () => {
    const statusCode = 200;

    apiSuccess(statusCode, response);

    expect(statusMock).toHaveBeenCalledWith(statusCode);
    expect(jsonMock).toHaveBeenCalledWith({});
  });
});
