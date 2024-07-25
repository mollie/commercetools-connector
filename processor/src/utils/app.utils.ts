import CustomError from '../errors/custom.error';
import { logger } from './logger.utils';
/**
 * Generates an ISO string date
 * @returns Returns the current date converted to ISO.
 */
export function createDateNowString(): string {
  return new Date().toISOString();
}

/**
 * Parses a string into a JSON object.
 * Write log if the string cannot be parsed
 *
 * @param {string} targetedString - The string to be parsed.
 * @param {string} fieldName - The name of the custom field.
 * @param {string} commerceToolsId - CommerceTools Payment ID or Transaction ID.
 * @returns {object} - The parsed JSON object.
 * @throws {CustomError} - If the string cannot be parsed into a JSON object.
 */
export function parseStringToJsonObject(
  targetedString: string,
  fieldName?: string,
  errorPrefix?: string,
  commerceToolsId?: string,
) {
  if (targetedString === undefined || targetedString.trim() === '') {
    return {};
  }

  try {
    return JSON.parse(targetedString);
  } catch {
    logger.error(
      `${errorPrefix ? errorPrefix : 'SCTM - PAYMENT PROCESSING'} - Failed to parse the JSON string from the custom field ${fieldName}.`,
      {
        commerceToolsId: commerceToolsId,
      },
    );

    throw new CustomError(
      400,
      `${errorPrefix ? errorPrefix : 'SCTM - PAYMENT PROCESSING'} - Failed to parse the JSON string from the custom field ${fieldName}.`,
    );
  }
}
