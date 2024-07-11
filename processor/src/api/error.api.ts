import { Response } from 'express';
import { ResponseInterfaceError } from '../interfaces/response.interface';
import { CTError } from '../types/commercetools.types';

/**
 * Send a success response to the client
 *
 * @param {Response} response Express response
 * @param {number} statusCode The status code of the operation
 * @param {Array<UpdateAction>} updateActions The update actions that were made in the process
 * @returns Success response with 200 status code and the update actions array
 */
export const apiError = (response: Response, errors: CTError[]) => {
  const responseBody = {} as ResponseInterfaceError;

  responseBody.errors = errors;

  response.status(400).json({
    ...responseBody,
  });
};
