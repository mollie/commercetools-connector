import { CTError, CTEnumErrors, CTErrorExtensionExtraInfo } from '../types/commercetools.types';

// This is based on MollieApiError interface from Mollie's SDK
/* eslint-disable  @typescript-eslint/no-explicit-any */
export const getExtraInfo = ({ status, statusCode, links, title, field }: any): CTErrorExtensionExtraInfo => {
  const originalStatus = status || statusCode;
  const extraInfo = Object.assign(
    {},
    originalStatus && { originalStatusCode: originalStatus },
    links && { links },
    title && { title },
    field && { field },
  );
  return extraInfo;
};

/**
 *
 * @param error Takes extension error or ApiError from Mollie SDK (extended from Node's Error class)
 * N.B. mollie errors return with statusCode, not status
 * Formats error into a commercetools "Validation Failed" response.
 * Docs: https://docs.commercetools.com/api/projects/api-extensions#error
 */

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const formatErrorResponse = (error: any) => {
  const formattedError: CTError = {
    code: CTEnumErrors.General,
    message: 'Please see logs for more details',
  };
  const ctCode = error.ctCode;
  const status = error.status || error.statusCode;

  switch (status) {
    case 400:
      formattedError.code = ctCode ?? CTEnumErrors.SyntaxError;
      break;
    case 500:
      formattedError.code = CTEnumErrors.General;
      break;
    default:
      formattedError.code = CTEnumErrors.General;
      break;
  }

  formattedError.message = error.message || 'Please see logs for more details';

  const extraInfo = getExtraInfo(error);
  if (Object.keys(extraInfo).length) formattedError.extensionExtraInfo = extraInfo;

  return {
    status: 400,
    errors: [formattedError],
  };
};
