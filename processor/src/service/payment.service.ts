import { ControllerResponseType } from '../types/controller.types';
import { CancelRefundStatusText, ConnectorActions, CustomFields, PAY_LATER_ENUMS } from '../utils/constant.utils';
import { List, Method, Payment as MPayment, PaymentMethod, PaymentStatus } from '@mollie/api-client';
import { logger } from '../utils/logger.utils';
import {
  createMollieCreatePaymentParams,
  mapCommercetoolsPaymentCustomFieldsToMollieListParams,
} from '../utils/map.utils';
import { Payment, UpdateAction } from '@commercetools/platform-sdk';
import CustomError from '../errors/custom.error';
import { cancelPaymentRefund, createMolliePayment, getPaymentById, listPaymentMethods } from '../mollie/payment.mollie';
import {
  AddTransaction,
  ChangeTransactionState,
  CTTransaction,
  CTTransactionState,
  CTTransactionType,
  molliePaymentToCTStatusMap,
  UpdateActionKey,
} from '../types/commercetools.types';
import { makeCTMoney, shouldPaymentStatusUpdate } from '../utils/mollie.utils';
import { getPaymentByMolliePaymentId, updatePayment } from '../commercetools/payment.commercetools';
import {
  PaymentUpdateAction,
  Transaction,
} from '@commercetools/platform-sdk/dist/declarations/src/generated/models/payment';
import { v4 as uuid } from 'uuid';
import {
  addInterfaceInteraction,
  changeTransactionInteractionId,
  changeTransactionState,
  changeTransactionTimestamp,
  setCustomFields,
  setTransactionCustomField,
} from '../commercetools/action.commercetools';
import { readConfiguration } from '../utils/config.utils';
import { CancelParameters } from '@mollie/api-client/dist/types/src/binders/payments/refunds/parameters';

/**
 * Handles listing payment methods by payment.
 *
 * @param {Payment} ctPayment - The Commercetools payment object.
 * @return {Promise<{ statusCode: number, actions?: UpdateAction[] }>} - A promise that resolves to an object containing the status code and optional update actions.
 */
export const handleListPaymentMethodsByPayment = async (ctPayment: Payment): Promise<ControllerResponseType> => {
  logger.debug(`SCTM - listPaymentMethodsByPayment - ctPaymentId:${JSON.stringify(ctPayment?.id)}`);
  try {
    const mollieOptions = await mapCommercetoolsPaymentCustomFieldsToMollieListParams(ctPayment);
    const methods: List<Method> = await listPaymentMethods(mollieOptions);

    const availableMethods = JSON.stringify({
      count: methods.length,
      methods: methods.length ? methods : [],
    });

    const ctUpdateActions: UpdateAction[] = [setCustomFields(CustomFields.payment.response, availableMethods)];

    const hasCardPayment = methods.findIndex((method: Method) => method.id === PaymentMethod.creditcard);

    if (hasCardPayment >= 0) {
      ctUpdateActions.push(setCustomFields(CustomFields.payment.profileId, readConfiguration().mollie.profileId));
    }

    return {
      statusCode: 200,
      actions: ctUpdateActions,
    };
  } catch (error: unknown) {
    logger.error(`SCTM - listPaymentMethodsByPayment - ${error}`);
    if (error instanceof CustomError) {
      Promise.reject(error);
    }

    return { statusCode: 200, actions: [] };
  }
};

/**
 * Handles payment webhook events.
 *
 * @param {string} paymentId - The ID of the payment.
 * @return {Promise<void>} A promise that resolves when the payment webhook event is handled.
 */
export const handlePaymentWebhook = async (paymentId: string): Promise<void> => {
  logger.debug(`SCTM - handlePaymentWebhook - paymentId:${paymentId}`);

  const molliePayment = await getPaymentById(paymentId);

  const ctPayment = await getPaymentByMolliePaymentId(molliePayment.id);

  const action = getPaymentStatusUpdateAction(ctPayment.transactions as CTTransaction[], molliePayment);

  if (!action) {
    logger.debug(`handlePaymentWebhook - No actions needed`);
    return;
  }

  logger.info(`handlePaymentWebhook - actions:${JSON.stringify(action)}`);

  await updatePayment(ctPayment, [action] as PaymentUpdateAction[]);
};

const getPaymentStatusUpdateAction = (
  ctTransactions: CTTransaction[],
  molliePayment: MPayment,
): ChangeTransactionState | AddTransaction | void => {
  const { id: molliePaymentId, status: molliePaymentStatus, method: paymentMethod } = molliePayment;

  // Determine if paynow or paylater method
  const isPayLater = PAY_LATER_ENUMS.includes(paymentMethod as PaymentMethod);
  const matchingTransaction = ctTransactions.find((transaction) => transaction.interactionId === molliePaymentId);

  // If no corresponding CT Transaction, create it
  if (matchingTransaction === undefined) {
    return {
      action: UpdateActionKey.AddTransaction,
      transaction: {
        amount: makeCTMoney(molliePayment.amount),
        state: molliePaymentToCTStatusMap[molliePaymentStatus],
        type: isPayLater ? CTTransactionType.Authorization : CTTransactionType.Charge,
        interactionId: molliePaymentId,
      },
    };
  }

  // Corresponding transaction, update it
  const shouldUpdate = shouldPaymentStatusUpdate(molliePaymentStatus, matchingTransaction.state as CTTransactionState);
  if (shouldUpdate) {
    return changeTransactionState(
      matchingTransaction.id as string,
      molliePaymentToCTStatusMap[molliePaymentStatus],
    ) as ChangeTransactionState;
  }
};

/**
 * Creates a Mollie Payment
 *
 * @return {Promise<CTPayloadValidationResponse>} - A promise that resolves to the created MolliePayment or a CTPayloadValidationResponse if there is an error.
 * @param ctPayment
 */
export const handleCreatePayment = async (ctPayment: Payment): Promise<ControllerResponseType> => {
  const paymentParams = createMollieCreatePaymentParams(ctPayment);

  const molliePayment = await createMolliePayment(paymentParams);

  const ctActions = await getCreatePaymentUpdateAction(molliePayment, ctPayment);

  return {
    statusCode: 201,
    actions: ctActions,
  };
};

/**
 * Retrieves the update action for creating a payment.
 *
 * @param {MPayment} molliePayment - The Mollie payment.
 * @param {Payment} CTPayment - The CommerceTools payment.
 * @return {Promise<UpdateAction[]>} A promise that resolves to an array of update actions.
 * @throws {Error} If the original transaction is not found.
 */
export const getCreatePaymentUpdateAction = async (molliePayment: MPayment, CTPayment: Payment) => {
  try {
    // Find the original transaction which triggered create order
    const originalTransaction = CTPayment.transactions?.find((transaction) => {
      return (
        (transaction.type === CTTransactionType.Charge || transaction.type === CTTransactionType.Authorization) &&
        transaction.state === CTTransactionState.Initial
      );
    });

    if (!originalTransaction) {
      return Promise.reject({
        status: 400,
        title: 'Cannot find original transaction',
        field: 'Payment.transactions',
      });
    }

    const interfaceInteractionRequest = {
      transactionId: originalTransaction.id ?? '',
      paymentMethod: CTPayment.paymentMethodInfo.method,
    };
    const interfaceInteractionResponse = {
      molliePaymentId: molliePayment.id,
      checkoutUrl: molliePayment._links?.checkout?.href,
      transactionId: originalTransaction.id,
    };

    const interfaceInteractionParams = {
      actionType: ConnectorActions.CreatePayment,
      requestValue: JSON.stringify(interfaceInteractionRequest),
      responseValue: JSON.stringify(interfaceInteractionResponse),
      id: uuid(),
      timestamp: molliePayment.createdAt,
    };

    return Promise.resolve([
      // Add interface interaction
      addInterfaceInteraction(interfaceInteractionParams),
      // Update transaction interactionId
      changeTransactionInteractionId(originalTransaction.id, molliePayment.id),
      // Update transaction timestamp
      changeTransactionTimestamp(originalTransaction.id, molliePayment.createdAt),
      // Update transaction state
      changeTransactionState(originalTransaction.id, CTTransactionState.Pending),
    ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return Promise.reject(error);
  }
};

export const handlePaymentCancelRefund = async (ctPayment: Payment): Promise<ControllerResponseType> => {
  const successChargeTransaction = ctPayment.transactions.find(
    (transaction) => transaction.type === CTTransactionType.Charge && transaction.state === CTTransactionState.Success,
  );

  const pendingRefundTransaction = ctPayment.transactions.find(
    (transaction) => transaction.type === CTTransactionType.Refund && transaction.state === CTTransactionState.Pending,
  );

  const molliePayment = await getPaymentById(successChargeTransaction?.interactionId as string);

  if (molliePayment.status !== PaymentStatus.pending) {
    logger.error(`SCTM - handleCancelRefund - Mollie Payment status must be pending, payment ID: ${molliePayment.id}`);
    throw new CustomError(
      400,
      `SCTM - handleCancelRefund - Mollie Payment status must be pending, payment ID: ${molliePayment.id}`,
    );
  }

  const paymentCancelRefundParams: CancelParameters = {
    paymentId: molliePayment.id,
  };

  await cancelPaymentRefund(pendingRefundTransaction?.interactionId as string, paymentCancelRefundParams);

  const ctActions: UpdateAction[] = getPaymentCancelRefundActions(pendingRefundTransaction as Transaction);

  return {
    statusCode: 200,
    actions: ctActions,
  };
};

export const getPaymentCancelRefundActions = (pendingRefundTransaction: Transaction) => {
  const transactionCustomFieldName = CustomFields.paymentCancelRefund;

  let transactionCustomFieldValue;
  try {
    transactionCustomFieldValue = !pendingRefundTransaction.custom?.fields[transactionCustomFieldName]
      ? {}
      : JSON.parse(pendingRefundTransaction.custom?.fields[transactionCustomFieldName]);
  } catch (error: unknown) {
    logger.error(
      `SCTM - handleCancelRefund - Failed to parse the JSON string from the custom field ${transactionCustomFieldName}.`,
    );
    throw new CustomError(
      400,
      `SCTM - handleCancelRefund - Failed to parse the JSON string from the custom field ${transactionCustomFieldName}.`,
    );
  }

  const newTransactionCustomFieldValue = {
    reasonText: transactionCustomFieldValue.reasonText,
    statusText: CancelRefundStatusText,
  };

  return [
    // Update transaction state
    changeTransactionState(pendingRefundTransaction.id, CTTransactionState.Failure),
    // Set transaction custom field value
    setTransactionCustomField(
      pendingRefundTransaction.id,
      transactionCustomFieldName,
      JSON.stringify(newTransactionCustomFieldValue),
    ),
  ];
};
