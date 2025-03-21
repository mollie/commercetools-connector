import { SurchargeCost } from './../types/commercetools.types';
import { Payment, Transaction } from '@commercetools/platform-sdk';
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
 * @param errorPrefix
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
    const errorMessage = `${errorPrefix ?? 'SCTM - PAYMENT PROCESSING'} - Failed to parse the JSON string from the custom field ${fieldName}.`;
    logger.error(errorMessage, {
      commerceToolsId: commerceToolsId,
    });

    throw new CustomError(400, errorMessage);
  }
}

/**
 * Removes empty properties from an object.
 *
 * @param {object} obj - The object from which to remove empty properties.
 * @return {object} - The object with empty properties removed.
 */
export function removeEmptyProperties(obj: object) {
  const clonedObject: { [key: string]: any } = { ...obj };

  for (const key in clonedObject) {
    if (Object.hasOwn(clonedObject, key)) {
      const value = clonedObject[key];

      if (
        value === null ||
        value === undefined ||
        value === '' ||
        (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
      ) {
        delete clonedObject[key];
      }
    }
  }

  return clonedObject;
}

export const convertCentToEUR = (amount: number, fractionDigits: number): number => {
  return amount / Math.pow(10, fractionDigits);
};

export const calculateTotalSurchargeAmount = (ctPayment: Payment, surcharges?: SurchargeCost): number => {
  if (!surcharges) {
    return 0;
  }
  const amount = convertCentToEUR(ctPayment.amountPlanned.centAmount, ctPayment.amountPlanned.fractionDigits);

  const percentageAmount = surcharges.percentageAmount ?? 0;
  const fixedAmount = surcharges.fixedAmount ?? 0;

  return (amount * percentageAmount) / 100 + fixedAmount;
};

export const roundSurchargeAmountToCent = (surchargeAmountInEur: number, fractionDigits: number): number => {
  return Math.round(surchargeAmountInEur * Math.pow(10, fractionDigits));
};

export const sortTransactionsByLatestCreationTime = (transactions: Transaction[]): Transaction[] => {
  const clonedTransactions = Object.assign([], transactions);

  return clonedTransactions.sort((a: Transaction, b: Transaction) => {
    const timeA = a.timestamp as string;
    const timeB = b.timestamp as string;

    if (timeA < timeB) {
      return 1;
    }

    if (timeA > timeB) {
      return -1;
    }

    return 0;
  });
};
