import { DeterminePaymentActionType } from '../types/controller.types';
import { logger } from './logger.utils';
import { Payment } from '@commercetools/platform-sdk';
import { CustomFields, ConnectorActions, ErrorMessages } from './constant.utils';
import { CTTransactionState, CTTransactionType } from '../types/commercetools.types';
import CustomError from '../errors/custom.error';
import { Transaction } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/payment';

const getTransactionGroups = (transactions: Transaction[]) => {
  const groups = {
    initialCharge: [] as Transaction[],
    pendingCharge: [] as Transaction[],
    successCharge: [] as Transaction[],
    initialRefund: [] as Transaction[],
    pendingRefund: [] as Transaction[],
    initialCancelAuthorization: [] as Transaction[],
    successAuthorization: [] as Transaction[],
    failureCapture: [] as Transaction[],
    pendingCapture: [] as Transaction[],
  };

  transactions?.forEach((transaction) => {
    switch (transaction.state) {
      case CTTransactionState.Initial:
        if (transaction.type === CTTransactionType.Charge) {
          groups.initialCharge.push(transaction);
        } else if (transaction.type === CTTransactionType.Refund) {
          groups.initialRefund.push(transaction);
        } else if (transaction.type === CTTransactionType.CancelAuthorization) {
          groups.initialCancelAuthorization.push(transaction);
        }
        break;
      case CTTransactionState.Pending:
        if (transaction.type === CTTransactionType.Charge) {
          transaction.custom?.fields?.[CustomFields.surchargeAndCapture.fields.shouldCapture.name]
            ? groups.pendingCapture.push(transaction)
            : groups.pendingCharge.push(transaction);
        } else if (transaction.type === CTTransactionType.Refund) {
          groups.pendingRefund.push(transaction);
        }
        break;
      case CTTransactionState.Success:
        if (transaction.type === CTTransactionType.Charge) {
          groups.successCharge.push(transaction);
        } else if (transaction.type === CTTransactionType.Authorization) {
          groups.successAuthorization.push(transaction);
        }
        break;
      case CTTransactionState.Failure:
        if (
          (transaction.type === CTTransactionType.Charge &&
            transaction.custom?.fields?.[CustomFields.surchargeAndCapture.fields.captureErrors.name]?.length >= 1) ||
          transaction.custom?.fields?.[CustomFields.surchargeAndCapture.fields.shouldCapture.name]
        ) {
          groups.failureCapture.push(transaction);
        }
        break;
    }
  });

  return groups;
};

const determineAction = (groups: ReturnType<typeof getTransactionGroups>): DeterminePaymentActionType => {
  if (groups.initialCharge.length > 1) {
    throw new CustomError(400, 'Only one transaction can be in "Initial" state at any time');
  }

  if (groups.initialCharge.length === 1 && groups.pendingCharge.length >= 1) {
    throw new CustomError(
      400,
      'Must only have one Charge transaction processing (i.e. in state "Initial" or "Pending") at a time',
    );
  }

  if (groups.initialCharge.length === 1 && !groups.successCharge.length && !groups.pendingCharge.length) {
    return ConnectorActions.CreatePayment;
  }

  if (groups.successAuthorization.length === 1 && groups.initialCancelAuthorization.length === 1) {
    return ConnectorActions.CancelPayment;
  }

  if (groups.successCharge.length >= 1 && groups.initialRefund.length) {
    return ConnectorActions.CreateRefund;
  }

  if (
    groups.successCharge.length >= 1 &&
    groups.pendingRefund.length >= 1 &&
    groups.initialCancelAuthorization.length === 1
  ) {
    return ConnectorActions.CancelRefund;
  }

  if (
    (groups.failureCapture.length >= 1 || groups.pendingCapture.length >= 1) &&
    groups.successAuthorization.length >= 1
  ) {
    return ConnectorActions.CapturePayment;
  }

  logger.warn('SCTM - No payment actions matched');
  return ConnectorActions.NoAction;
};

export const determinePaymentAction = (ctPayment?: Payment): DeterminePaymentActionType => {
  if (!ctPayment) {
    logger.error(ErrorMessages.paymentObjectNotFound);

    throw new CustomError(400, ErrorMessages.paymentObjectNotFound);
  }

  const shouldGetPaymentMethods =
    ctPayment.custom?.fields?.[CustomFields.payment.request] &&
    !ctPayment.custom?.fields?.[CustomFields.payment.response];

  if (shouldGetPaymentMethods) {
    return ConnectorActions.GetPaymentMethods;
  }

  const shouldGetAppleSession =
    ctPayment.custom?.fields?.[CustomFields.applePay.session.request] &&
    ctPayment.custom?.fields?.[CustomFields.applePay.session.request].length > 0;

  if (shouldGetAppleSession) {
    return ConnectorActions.GetApplePaySession;
  }

  const { transactions } = ctPayment;
  const groups = getTransactionGroups(transactions);

  return determineAction(groups);
};
