import { Payment as CTPayment } from '@commercetools/platform-sdk';
import { PaymentMethod as MolliePaymentMethods, PaymentMethod } from '@mollie/api-client';
import SkipError from '../errors/skip.error';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { ConnectorActions, CustomFields } from '../utils/constant.utils';
import { DeterminePaymentActionType } from '../types/controller.types';
import { CTTransactionState, CTTransactionType } from '../types/commercetools.types';
import { parseStringToJsonObject } from '../utils/app.utils';

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
    logger.error(
      `SCTM - PAYMENT PROCESSING - Payment method must be set in order to create a Mollie payment, CommerceTools Payment ID: ${ctPayment.id}.`,
      {
        commerceToolsPaymentId: ctPayment.id,
      },
    );
    throw new CustomError(
      400,
      `SCTM - PAYMENT PROCESSING - Payment method must be set in order to create a Mollie payment, CommerceTools Payment ID: ${ctPayment.id}.`,
    );
  }

  if (!hasValidPaymentMethod(ctPayment.paymentMethodInfo?.method)) {
    logger.error(
      `SCTM - PAYMENT PROCESSING - Invalid paymentMethodInfo.method "${method}", CommerceTools Payment ID: ${ctPayment.id}.`,
      {
        commerceToolsPaymentId: ctPayment.id,
      },
    );
    throw new CustomError(
      400,
      `SCTM - PAYMENT PROCESSING - Invalid paymentMethodInfo.method "${method}", CommerceTools Payment ID: ${ctPayment.id}.`,
    );
  }

  if (method === PaymentMethod.creditcard) {
    checkPaymentMethodSpecificParameters(ctPayment);
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
    logger.error(
      `SCTM - handleCreateRefund - No successful charge transaction found, CommerceTools Transaction ID: ${successChargeTransaction?.id}.`,
    );
    throw new CustomError(
      400,
      `SCTM - handleCreateRefund - No successful charge transaction found, CommerceTools Transaction ID: ${successChargeTransaction?.id}.`,
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
    logger.error(`SCTM - handleCreateRefund - No initial refund transaction found.`);
    throw new CustomError(400, 'SCTM - handleCreateRefund - No initial refund transaction found');
  }

  if (!initialRefundTransaction?.amount || !initialRefundTransaction?.amount.centAmount) {
    logger.error(
      `SCTM - handleCreateRefund - No amount found in initial refund transaction, CommerceTools Transaction ID: ${initialRefundTransaction?.id}`,
    );
    throw new CustomError(
      400,
      `SCTM - handleCreateRefund - No amount found in initial refund transaction, CommerceTools Transaction ID: ${initialRefundTransaction?.id}`,
    );
  }

  return true;
};

export const checkValidRefundTransactionForCancel = (ctPayment: CTPayment): boolean => {
  const pendingRefundTransaction = ctPayment.transactions.find(
    (transaction) => transaction.type === CTTransactionType.Refund && transaction.state === CTTransactionState.Pending,
  );

  if (!pendingRefundTransaction) {
    logger.error('SCTM - handleCancelRefund - No pending refund transaction found');
    throw new CustomError(400, 'SCTM - handleCancelRefund - No pending refund transaction found');
  }

  if (!pendingRefundTransaction?.interactionId || pendingRefundTransaction?.interactionId.trim() === '') {
    logger.error(
      `SCTM - handleCancelRefund - Cannot get the Mollie refund ID from CommerceTools transaction, transaction ID: ${pendingRefundTransaction?.id}`,
    );
    throw new CustomError(
      400,
      `SCTM - handleCancelRefund - Cannot get the Mollie refund ID from CommerceTools transaction, transaction ID: ${pendingRefundTransaction?.id}`,
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
export const checkPaymentMethodSpecificParameters = (ctPayment: CTPayment): void => {
  const paymentCustomFields = parseStringToJsonObject(
    ctPayment.custom?.fields?.[CustomFields.createPayment.request],
    CustomFields.createPayment.request,
    'SCTM - PAYMENT PROCESSING',
    ctPayment.id,
  );

  if (!paymentCustomFields?.cardToken) {
    logger.error(
      `SCTM - PAYMENT PROCESSING - cardToken is required for payment method creditcard, CommerceTools Payment ID: ${ctPayment.id}`,
      {
        commerceToolsPaymentId: ctPayment.id,
        cardToken: paymentCustomFields?.cardToken,
      },
    );

    throw new CustomError(400, 'SCTM - PAYMENT PROCESSING - cardToken is required for payment method creditcard');
  }

  if (typeof paymentCustomFields?.cardToken !== 'string' || paymentCustomFields?.cardToken.trim() === '') {
    logger.error(
      `SCTM - PAYMENT PROCESSING - cardToken must be a string and not empty for payment method creditcard, CommerceTools Payment ID: ${ctPayment.id}`,
      {
        commerceToolsPaymentId: ctPayment.id,
        cardToken: paymentCustomFields?.cardToken,
      },
    );

    throw new CustomError(
      400,
      'SCTM - PAYMENT PROCESSING - cardToken must be a string and not empty for payment method creditcard',
    );
  }
};

export const checkAmountPlanned = (ctPayment: CTPayment): true | CustomError => {
  if (!ctPayment?.amountPlanned) {
    logger.error(
      `SCTM - PAYMENT PROCESSING - Payment {amountPlanned} not found, commerceToolsPaymentId: ${ctPayment.id}.`,
      {
        commerceToolsPaymentId: ctPayment.id,
      },
    );
    throw new CustomError(400, 'SCTM - PAYMENT PROCESSING - Payment {amountPlanned} not found.');
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
