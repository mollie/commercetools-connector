import { DeterminePaymentActionType } from '../types/controller.types';
import { logger } from './logger.utils';
import { Payment } from '@commercetools/platform-sdk';
import { CustomFields, ConnectorActions } from './constant.utils';
import { CTTransaction, CTTransactionState, CTTransactionType } from '../types/commercetools.types';

/**
 * Determines the payment action based on the provided Payment object.
 *
 * @param {Payment} ctPayment - The Payment object to determine the action for
 * @return {DeterminePaymentActionType} The determined payment action and error message if applicable
 */
export const determinePaymentAction = (ctPayment?: Payment): DeterminePaymentActionType => {
  if (!ctPayment) {
    logger.error('SCTM - Object ctPayment not found');
    return {
      action: ConnectorActions.NoAction,
      errorMessage: 'SCTM - Object ctPayment not found',
    };
  }

  // To list payment methods
  const shouldGetPaymentMethods =
    ctPayment.custom?.fields?.[CustomFields.payment.request] &&
    !ctPayment.custom?.fields?.[CustomFields.payment.response];

  if (shouldGetPaymentMethods) {
    return {
      action: ConnectorActions.GetPaymentMethods,
    };
  }

  const { id, key, transactions } = ctPayment;

  const initialChargeTransactions: CTTransaction[] = [];
  const pendingChargeTransactions: CTTransaction[] = [];
  const successChargeTransactions: CTTransaction[] = [];

  const chargeTransactions =
    transactions?.filter(
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      (transaction: any) => transaction.type === CTTransactionType.Charge,
    ) ?? [];
  chargeTransactions?.forEach((transaction: any) => {
    if (transaction.state === CTTransactionState.Initial) initialChargeTransactions.push(transaction);
    if (transaction.state === CTTransactionState.Pending) pendingChargeTransactions.push(transaction);
    if (transaction.state === CTTransactionState.Success) successChargeTransactions.push(transaction);
  });

  const initialTransactions = transactions?.filter(({ state }) => state === CTTransactionState.Initial) ?? [];

  let action;
  let errorMessage = '';

  switch (true) {
    // Error cases
    case initialTransactions.length > 1:
      action = ConnectorActions.NoAction;
      errorMessage = 'Only one transaction can be in "Initial" state at any time';
      break;
    case initialChargeTransactions.length === 1 && pendingChargeTransactions.length >= 1:
      action = ConnectorActions.NoAction;
      errorMessage =
        'Must only have one Charge transaction processing (i.e. in state "Initial" or "Pending") at a time';
      break;
    case !!pendingChargeTransactions.length && !key:
      action = ConnectorActions.NoAction;
      errorMessage =
        'Cannot create a Transaction in state "Pending". This state is reserved to indicate the transaction has been accepted by the payment service provider';
      break;

    // Create Payment
    case (!!key || !!id) &&
      initialChargeTransactions.length === 1 &&
      !successChargeTransactions.length &&
      !pendingChargeTransactions.length:
      action = ConnectorActions.CreatePayment;
      break;
    default:
      action = ConnectorActions.NoAction;
      logger.warn('SCTM - No payment actions matched');
  }

  return {
    action,
    errorMessage,
  };
};
