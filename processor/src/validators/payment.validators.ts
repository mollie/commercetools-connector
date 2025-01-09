import { Payment as CTPayment } from '@commercetools/platform-sdk';
import { PaymentMethod as MolliePaymentMethods } from '@mollie/api-client';
import SkipError from '../errors/skip.error';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { ConnectorActions, CustomFields } from '../utils/constant.utils';
import { DeterminePaymentActionType } from '../types/controller.types';
import { CTTransactionState, CTTransactionType } from '../types/commercetools.types';
import { parseStringToJsonObject } from '../utils/app.utils';
import { readConfiguration } from '../utils/config.utils';
import { toBoolean } from 'validator';
import { CustomPaymentMethod, SupportedPaymentMethods } from '../types/mollie.types';

const throwError = (process: string, errorMessage: string, ctPayment?: CTPayment): void => {
  logger.error(`SCTM - ${process} - ${errorMessage}`, {
    commerceToolsPayment: ctPayment ?? {},
  });

  throw new CustomError(400, `SCTM - ${process} - ${errorMessage}`);
};

const throwSkipError = (process: string, errorMessage: string): void => {
  logger.info(`SCTM - ${process} - ${errorMessage}`);
  throw new SkipError(`SCTM - ${process} - ${errorMessage}`);
};

const validateCardToken = (cardToken: string | undefined, ctPayment: CTPayment): void => {
  if (!cardToken) {
    throwError('validateCardToken', 'cardToken is required for payment method creditcard.', ctPayment);
  }

  if (typeof cardToken !== 'string' || cardToken.trim() === '') {
    throwError(
      'validateCardToken',
      'cardToken must be a string and not empty for payment method creditcard.',
      ctPayment,
    );
  }
};

export const validateBanktransfer = (paymentCustomFields: any, ctPayment: CTPayment): void => {
  if (!paymentCustomFields?.billingAddress?.email) {
    throwError(
      'validateBanktransfer',
      'email is required for payment method banktransfer. Please make sure you have sent it in billingAddress.email of the custom field.',
      ctPayment,
    );
  }
};

const validateBlik = (paymentCustomFields: any, ctPayment: CTPayment): void => {
  if (ctPayment.amountPlanned.currencyCode.toLowerCase() !== 'pln') {
    throwError('validateBlik', 'Currency Code must be PLN for payment method BLIK.', ctPayment);
  }
};

export const paymentMethodRequiredExtraParameters = (
  method: string,
): method is MolliePaymentMethods | CustomPaymentMethod => {
  return [MolliePaymentMethods.creditcard, CustomPaymentMethod.blik, MolliePaymentMethods.banktransfer].includes(
    method as MolliePaymentMethods | CustomPaymentMethod,
  );
};

/**
 * Checks if the given action is either 'Create' or 'Update'.
 *
 * @param {string} action - The action to check.
 * @return {true | SkipError} Returns true if the action is 'Create' or 'Update', false otherwise.
 */
export const checkExtensionAction = (action: string): true | SkipError => {
  if (!['Create', 'Update'].includes(action)) {
    throwSkipError('checkExtensionAction', `Skip processing for action "${action}".`);
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
    throwSkipError(
      'checkPaymentInterface',
      `Skip processing for payment interface "${ctPayment.paymentMethodInfo?.paymentInterface}".`,
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
  return !!SupportedPaymentMethods[method as SupportedPaymentMethods];
};

/**
 * Checks the payment method input of a Commercetools Payment object.
 *
 * @return {true | CustomError} An object containing the validation result.
 * The `isInvalid` property indicates if the payment method input is invalid.
 * The `errorMessage` property contains the error message if the input is invalid.
 * @param connectorAction
 * @param ctPayment
 */
export const checkPaymentMethodInput = (
  connectorAction: DeterminePaymentActionType,
  ctPayment: CTPayment,
): true | CustomError => {
  const CTPaymentMethod = ctPayment.paymentMethodInfo?.method ?? '';
  const [method] = CTPaymentMethod.split(',');

  if (!method) {
    throwError(
      'checkPaymentMethodInput',
      `Payment method must be set in order to create a Mollie payment, CommerceTools Payment ID: ${ctPayment.id}.`,
    );
  }

  if (!hasValidPaymentMethod(ctPayment.paymentMethodInfo?.method)) {
    throwError(
      'checkPaymentMethodInput',
      `Invalid paymentMethodInfo.method "${method}", CommerceTools Payment ID: ${ctPayment.id}.`,
    );
  }

  if (paymentMethodRequiredExtraParameters(method)) {
    checkPaymentMethodSpecificParameters(ctPayment, method);
  }

  return true;
};

/**
 * Checks if the given Commercetools Payment object has a valid success charge transaction.
 *
 * @param {CTPayment} ctPayment - The Commercetools Payment object to check.
 * @return {true | CustomError} Returns true if the refund transaction is valid, otherwise exception.
 */
export const checkValidSuccessChargeTransaction = (ctPayment: CTPayment): boolean => {
  const successChargeTransaction = ctPayment.transactions.find(
    (transaction) => transaction.type === CTTransactionType.Charge && transaction.state === CTTransactionState.Success,
  );

  if (!successChargeTransaction?.interactionId) {
    throwError(
      'checkValidSuccessChargeTransaction',
      `No successful charge transaction found, CommerceTools Transaction ID: ${successChargeTransaction?.id}.`,
    );
  }

  return true;
};

/**
 * Checks if the given Commercetools Payment object has a valid initial refund transaction for create.
 *
 * @param {CTPayment} ctPayment - The Commercetools Payment object to check.
 * @return {boolean} Returns true if the refund transaction is valid, otherwise throws an exception.
 * @throws {CustomError} Throws a CustomError with status code 400 if the initial refund transaction is not found or does not have an amount.
 */
export const checkValidRefundTransactionForCreate = (ctPayment: CTPayment): boolean => {
  const initialRefundTransaction = ctPayment.transactions.find(
    (transaction) => transaction.type === CTTransactionType.Refund && transaction.state === CTTransactionState.Initial,
  );

  if (!initialRefundTransaction) {
    throwError('checkValidRefundTransactionForCreate', 'No initial refund transaction found.');
  }

  if (!initialRefundTransaction?.amount?.centAmount) {
    throwError(
      'checkValidRefundTransactionForCreate',
      `No amount found in initial refund transaction, CommerceTools Transaction ID: ${initialRefundTransaction?.id}.`,
    );
  }

  return true;
};

export const checkValidRefundTransactionForCancel = (ctPayment: CTPayment): boolean => {
  const pendingRefundTransaction = ctPayment.transactions.find(
    (transaction) => transaction.type === CTTransactionType.Refund && transaction.state === CTTransactionState.Pending,
  );

  if (!pendingRefundTransaction) {
    throwError('checkValidRefundTransactionForCancel', 'No pending refund transaction found.');
  }

  if (!pendingRefundTransaction?.interactionId || pendingRefundTransaction?.interactionId.trim() === '') {
    throwError(
      'checkValidRefundTransactionForCancel',
      `Cannot get the Mollie refund ID from CommerceTools transaction, transaction ID: ${pendingRefundTransaction?.id}.`,
    );
  }

  return true;
};

/**
 * Checks if the given Commercetools Payment object has a valid success charge transaction.
 *
 * @param {CTPayment} ctPayment - The Commercetools Payment object to check.
 * @return {true | CustomError} Returns true if the refund transaction is valid, otherwise exception.
 */
export const checkValidSuccessAuthorizationTransaction = (ctPayment: CTPayment): boolean => {
  const successAuthorizationTransaction = ctPayment.transactions.find(
    (transaction) =>
      transaction.type === CTTransactionType.Authorization && transaction.state === CTTransactionState.Success,
  );

  if (!successAuthorizationTransaction?.interactionId) {
    throwError(
      'checkValidSuccessAuthorizationTransaction',
      `Cannot get the Mollie payment ID from CommerceTools transaction, CommerceTools Transaction ID: ${successAuthorizationTransaction?.id}.`,
    );
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
export const checkPaymentMethodSpecificParameters = (ctPayment: CTPayment, method: string): void => {
  const paymentCustomFields = parseStringToJsonObject(
    ctPayment.custom?.fields?.[CustomFields.createPayment.request],
    CustomFields.createPayment.request,
    'SCTM - PAYMENT PROCESSING',
    ctPayment.id,
  );

  if (method === MolliePaymentMethods.creditcard) {
    const cardComponentEnabled = toBoolean(readConfiguration().mollie.cardComponent, true);

    if (cardComponentEnabled) {
      validateCardToken(paymentCustomFields?.cardToken, ctPayment);
    }
  } else if (method === MolliePaymentMethods.banktransfer) {
    validateBanktransfer(paymentCustomFields, ctPayment);
  } else if (method === CustomPaymentMethod.blik) {
    validateBlik(paymentCustomFields, ctPayment);
  }
};

export const checkAmountPlanned = (ctPayment: CTPayment): true | CustomError => {
  if (!ctPayment?.amountPlanned) {
    throwError(
      'checkAmountPlanned',
      `Payment {amountPlanned} not found, commerceToolsPaymentId: ${ctPayment.id}.`,
      ctPayment,
    );
  }

  return true;
};

/**
 * Validates the payload of a CommerceTools payment based on the provided action and payment object.
 *
 * @param {string} extensionAction - The action to perform on the payment.
 * @param connectorAction
 * @param {CTPayment} ctPayment - The CommerceTools payment object to validate.
 * @return {void} - An object containing the validated action and an error message if validation fails.
 */
export const validateCommerceToolsPaymentPayload = (
  extensionAction: string,
  connectorAction: DeterminePaymentActionType,
  ctPayment: CTPayment,
): void => {
  checkExtensionAction(extensionAction);

  checkPaymentInterface(ctPayment);

  switch (connectorAction) {
    case ConnectorActions.CreatePayment:
      checkPaymentMethodInput(connectorAction, ctPayment);
      break;
    case ConnectorActions.CancelPayment:
      checkValidSuccessAuthorizationTransaction(ctPayment);
      break;
    case ConnectorActions.CreateRefund:
      checkValidSuccessChargeTransaction(ctPayment);
      checkValidRefundTransactionForCreate(ctPayment);
      break;
    case ConnectorActions.CancelRefund:
      checkValidSuccessChargeTransaction(ctPayment);
      checkValidRefundTransactionForCancel(ctPayment);
      break;
  }

  checkAmountPlanned(ctPayment);
};
