import { formatErrorResponse } from './mollie.error';
import { CTError } from '../types/commercetools.types';

class CustomError extends Error {
  statusCode: number | string;
  message: string;
  errors: CTError[];

  constructor(statusCode: number | string, message: string) {
    super(message);

    this.statusCode = statusCode;
    this.message = message;

    this.errors = formatErrorResponse(this).errors;
  }
}

export default CustomError;
