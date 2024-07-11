import { CTError, CTEnumErrors, CTErrorExtensionExtraInfo } from '../types/commercetools.types';

// This is based on MollieApiError interface from Mollie's SDK
/* eslint-disable  @typescript-eslint/no-explicit-any */
const getExtraInfo = ({ status, statusCode, links, title, field }: any): CTErrorExtensionExtraInfo => {
  const orginalStatus = status || statusCode;
  const extraInfo = Object.assign(
    {},
    orginalStatus && { originalStatusCode: orginalStatus },
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
  let formattedError = {} as CTError;
  const ctCode = error.ctCode;
  const status = error.status || error.statusCode;
  switch (true) {
    case status === 400:
      formattedError = {
        code: ctCode ?? CTEnumErrors.SyntaxError,
        message: error.message,
      };
      break;

    default:
      //5xx
      formattedError = {
        code: CTEnumErrors.General,
        message: error.message ?? 'Please see logs for more details',
      };
  }
  const extraInfo = getExtraInfo(error);
  if (Object.keys(extraInfo).length) formattedError.extensionExtraInfo = extraInfo;

  return {
    status: 400,
    errors: [formattedError],
  };
};
