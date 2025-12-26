import { DeterminePaymentActionType } from '../types/controller.types';
import { logger } from './logger.utils';
import { Payment } from '@commercetools/platform-sdk';
import { CustomFields, ConnectorActions, ErrorMessages } from './constant.utils';
import { CTTransactionState, CTTransactionType, TransactionGroups } from '../types/commercetools.types';
import CustomError from '../errors/custom.error';
import { Transaction } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/payment';

const isMarkedForCapture = (transaction: Transaction): boolean => {
  return !!transaction.custom?.fields?.[CustomFields.transactions.fields.shouldCapturePayment.name];
};

const hasCaptureErrors = (transaction: Transaction): boolean => {
  return (transaction.custom?.fields?.[CustomFields.transactions.fields.capturePaymentErrors.name]?.length ?? 0) >= 1;
};

const isFailedCapture = (transaction: Transaction): boolean => {
  return (
    (transaction.type === CTTransactionType.Charge && hasCaptureErrors(transaction)) ||
    isMarkedForCapture(transaction)
  );
};

const categorizeInitialTransaction = (transaction: Transaction, groups: TransactionGroups): void => {
  if (transaction.type === CTTransactionType.Charge) {
    groups.initialCharge.push(transaction);
  } else if (transaction.type === CTTransactionType.Refund) {
    groups.initialRefund.push(transaction);
  } else if (transaction.type === CTTransactionType.CancelAuthorization) {
    groups.initialCancelAuthorization.push(transaction);
  }
};

const categorizePendingTransaction = (transaction: Transaction, groups: TransactionGroups): void => {
  if (transaction.type === CTTransactionType.Charge) {
    isMarkedForCapture(transaction) ? groups.pendingCapture.push(transaction) : groups.pendingCharge.push(transaction);
  } else if (transaction.type === CTTransactionType.Refund) {
    groups.pendingRefund.push(transaction);
  }
};

const categorizeSuccessTransaction = (transaction: Transaction, groups: TransactionGroups): void => {
  if (transaction.type === CTTransactionType.Charge) {
    groups.successCharge.push(transaction);
  } else if (transaction.type === CTTransactionType.Authorization) {
    groups.successAuthorization.push(transaction);
  }
};

const categorizeFailureTransaction = (transaction: Transaction, groups: TransactionGroups): void => {
  if (isFailedCapture(transaction)) {
    groups.failureCapture.push(transaction);
  }
};

const getTransactionGroups = (transactions: Transaction[]): TransactionGroups => {
  const groups: TransactionGroups = {
    initialCharge: [],
    pendingCharge: [],
    successCharge: [],
    initialRefund: [],
    pendingRefund: [],
    initialCancelAuthorization: [],
    successAuthorization: [],
    failureCapture: [],
    pendingCapture: [],
  };

  transactions?.forEach((transaction) => {
    switch (transaction.state) {
      case CTTransactionState.Initial:
        categorizeInitialTransaction(transaction, groups);
        break;
      case CTTransactionState.Pending:
        categorizePendingTransaction(transaction, groups);
        break;
      case CTTransactionState.Success:
        categorizeSuccessTransaction(transaction, groups);
        break;
      case CTTransactionState.Failure:
        categorizeFailureTransaction(transaction, groups);
        break;
    }
  });

  return groups;
};

const validateTransactionRules = (groups: TransactionGroups): void => {
  if (groups.initialCharge.length > 1) {
    throw new CustomError(400, 'Only one transaction can be in "Initial" state at any time');
  }

  if (groups.initialCharge.length === 1 && groups.pendingCharge.length >= 1) {
    throw new CustomError(
      400,
      'Must only have one Charge transaction processing (i.e. in state "Initial" or "Pending") at a time',
    );
  }
};

const shouldCreatePayment = (groups: TransactionGroups): boolean => {
  return groups.initialCharge.length === 1 && !groups.successCharge.length && !groups.pendingCharge.length;
};

const shouldCancelPayment = (groups: TransactionGroups): boolean => {
  return (
    groups.successAuthorization.length === 1 &&
    groups.initialCancelAuthorization.length === 1 &&
    groups.pendingRefund.length !== 1
  );
};

const shouldCreateRefund = (groups: TransactionGroups): boolean => {
  return groups.successCharge.length >= 1 && groups.initialRefund.length > 0;
};

const shouldCancelRefund = (groups: TransactionGroups): boolean => {
  return (
    groups.successCharge.length >= 1 &&
    groups.pendingRefund.length >= 1 &&
    groups.initialCancelAuthorization.length === 1
  );
};

const shouldCapturePayment = (groups: TransactionGroups): boolean => {
  return (
    (groups.failureCapture.length >= 1 || groups.pendingCapture.length >= 1) &&
    groups.successAuthorization.length >= 1
  );
};

const determineAction = (groups: TransactionGroups): DeterminePaymentActionType => {
  validateTransactionRules(groups);

  if (shouldCreatePayment(groups)) {
    return ConnectorActions.CreatePayment;
  }

  if (shouldCancelPayment(groups)) {
    return ConnectorActions.CancelPayment;
  }

  if (shouldCreateRefund(groups)) {
    return ConnectorActions.CreateRefund;
  }

  if (shouldCancelRefund(groups)) {
    return ConnectorActions.CancelRefund;
  }

  if (shouldCapturePayment(groups)) {
    return ConnectorActions.CapturePayment;
  }

  logger.warn('SCTM - No payment actions matched');
  return ConnectorActions.NoAction;
};

const shouldGetPaymentMethods = (ctPayment: Payment): boolean => {
  return (
    !!ctPayment.custom?.fields?.[CustomFields.payment.request] &&
    !ctPayment.custom?.fields?.[CustomFields.payment.response]
  );
};

const shouldGetApplePaySession = (ctPayment: Payment): boolean => {
  const applePayRequest = ctPayment.custom?.fields?.[CustomFields.applePay.session.request];
  return !!applePayRequest && applePayRequest.length > 0;
};

export const determinePaymentAction = (ctPayment?: Payment): DeterminePaymentActionType => {
  if (!ctPayment) {
    logger.error(ErrorMessages.paymentObjectNotFound);
    throw new CustomError(400, ErrorMessages.paymentObjectNotFound);
  }

  if (shouldGetPaymentMethods(ctPayment)) {
    return ConnectorActions.GetPaymentMethods;
  }

  if (shouldGetApplePaySession(ctPayment)) {
    return ConnectorActions.GetApplePaySession;
  }

  const groups = getTransactionGroups(ctPayment.transactions);
  return determineAction(groups);
};
