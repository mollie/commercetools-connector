import { Payment as CTPayment } from '@commercetools/platform-sdk';
import { PaymentMethod as MolliePaymentMethods, PaymentMethod } from '@mollie/api-client';
import SkipError from '../errors/skip.error';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { ConnectorActions, CustomFields } from '../utils/constant.utils';

/**
 * Checks if the given action is either 'Create' or 'Update'.
 *
 * @param {string} action - The action to check.
 * @return {true | SkipError} Returns true if the action is 'Create' or 'Update', false otherwise.
 */
export const checkExtensionAction = (action: string): true | SkipError => {
  if (!['Create', 'Update'].includes(action)) {
    throw new SkipError(`Skip processing for action "${action}"`);
  }

  return true;
};

/**
 * Checks if the given Commercetools Payment object has a payment interface of 'mollie'.
 *
 * @param {CTPayment} ctPayment - The Commercetools Payment object to check.
 * @return {true | SkipError} Returns true if the payment interface is 'mollie', otherwise false.
 */
export const checkPaymentInterface = (ctPayment: CTPayment): true | SkipError => {
  if (
    !ctPayment.paymentMethodInfo?.paymentInterface ||
    ctPayment.paymentMethodInfo?.paymentInterface.toLowerCase() !== 'mollie'
  ) {
    throw new SkipError(
      `SCTM - PAYMENT PROCESSING - Skip processing for payment interface "${ctPayment.paymentMethodInfo?.paymentInterface}"`,
    );
  }

  return true;
};

/**
 * Checks if the given payment method is supported by Mollie
 *
 * @param {string|undefined} method - The method name that need to check.
 * @return {boolean} Returns true if the method is supported by Mollie
 */
export const hasValidPaymentMethod: (method: string | undefined) => boolean = (method: string | undefined): boolean => {
  return !!MolliePaymentMethods[method as MolliePaymentMethods];
};

/**
 * Checks the payment method input of a Commercetools Payment object.
 *
 * @return {true | CustomError} An object containing the validation result.
 * The `isInvalid` property indicates if the payment method input is invalid.
 * The `errorMessage` property contains the error message if the input is invalid.
 * @param ctPayment
 */
export const checkPaymentMethodInput = (connectorAction: string, ctPayment: CTPayment): true | CustomError => {
  const CTPaymentMethod = ctPayment.paymentMethodInfo?.method ?? '';
  const [method] = CTPaymentMethod.split(',');

  if (!method) {
    logger.error('SCTM - PAYMENT PROCESSING - Payment method must be set in order to create a Mollie payment.');
    throw new CustomError(
      400,
      `SCTM - PAYMENT PROCESSING - Payment method must be set in order to create a Mollie payment.`,
    );
  }

  if (!hasValidPaymentMethod(ctPayment.paymentMethodInfo?.method)) {
    logger.error(`SCTM - PAYMENT PROCESSING - Invalid paymentMethodInfo.method "${method}".`);
    throw new CustomError(400, `SCTM - PAYMENT PROCESSING - Invalid paymentMethodInfo.method "${method}".`);
  }

  if (method === PaymentMethod.creditcard) {
    checkPaymentMethodSpecificParameters(ctPayment);
  }

  return true;
};

/**
 * Checks whether the payment method specific parameters are present in the payment object
 * Currently, only perform the check with two payment methods: applepay and creditcard
 * For applepay: applePayPaymentToken must be exist
 * For creditcard: cardToken must be exist
 *
 * @param {CTPayment} CTPayment - The Commercetools Payment object to check.
 * @return {true | CustomError} An object containing the validation result.
 * The `isInvalid` property indicates if the payment method input is invalid.
 * The `errorMessage` property contains the error message if the input is invalid.
 */
export const checkPaymentMethodSpecificParameters = (ctPayment: CTPayment): void => {
  let paymentCustomFields;

  try {
    paymentCustomFields = ctPayment.custom?.fields?.[CustomFields.createPayment.request]
      ? JSON.parse(ctPayment.custom?.fields?.[CustomFields.createPayment.request])
      : {};
  } catch (error: unknown) {
    logger.error(
      'SCTM - PAYMENT PROCESSING - Failed to parse the JSON string from the custom field sctm_create_payment_request.',
    );
    throw new CustomError(
      400,
      `SCTM - PAYMENT PROCESSING - Failed to parse the JSON string from the custom field sctm_create_payment_request.`,
    );
  }

  if (!paymentCustomFields?.cardToken) {
    logger.error('SCTM - PAYMENT PROCESSING - cardToken is required for payment method creditcard');

    throw new CustomError(400, 'SCTM - PAYMENT PROCESSING - cardToken is required for payment method creditcard');
  }

  if (typeof paymentCustomFields?.cardToken !== 'string' || paymentCustomFields?.cardToken.trim() === '') {
    logger.error('SCTM - PAYMENT PROCESSING - cardToken must be a string and not empty for payment method creditcard');

    throw new CustomError(
      400,
      'SCTM - PAYMENT PROCESSING - cardToken must be a string and not empty for payment method creditcard',
    );
  }
};

export const checkAmountPlanned = (ctPayment: CTPayment): true | CustomError => {
  if (!ctPayment?.amountPlanned) {
    logger.error('SCTM - PAYMENT PROCESSING - Payment {amountPlanned} not found.');
    throw new CustomError(400, 'SCTM - PAYMENT PROCESSING - Payment {amountPlanned} not found.');
  }

  return true;
};

/**
 * Validates the payload of a CommerceTools payment based on the provided action and payment object.
 *
 * @param {string} extensionAction - The action to perform on the payment.
 * @param {string} controllerAction - The determined action that need to be done with the payment.
 * @param {CTPayment} ctPayment - The CommerceTools payment object to validate.
 * @return {void} - An object containing the validated action and an error message if validation fails.
 */
export const validateCommerceToolsPaymentPayload = (
  extensionAction: string,
  connectorAction: string,
  ctPayment: CTPayment,
): void => {
  checkExtensionAction(extensionAction);

  checkPaymentInterface(ctPayment);

  if (connectorAction === ConnectorActions.CreatePayment) {
    checkPaymentMethodInput(connectorAction, ctPayment);
  }

  checkAmountPlanned(ctPayment);
};
