import { ControllerResponseType, DeterminePaymentActionType } from '../types/controller.types';
import { CancelStatusText, ConnectorActions, CustomFields, PAY_LATER_ENUMS } from '../utils/constant.utils';
import { List, Method, Payment as MPayment, PaymentMethod } from '@mollie/api-client';
import { logger } from '../utils/logger.utils';
import {
  createMollieCreatePaymentParams,
  mapCommercetoolsPaymentCustomFieldsToMollieListParams,
} from '../utils/map.utils';
import { CentPrecisionMoney, Extension, Payment, UpdateAction } from '@commercetools/platform-sdk';
import CustomError from '../errors/custom.error';
import {
  cancelPayment,
  createMolliePayment,
  createPaymentWithCustomMethod,
  getPaymentById,
  listPaymentMethods,
} from '../mollie/payment.mollie';
import {
  AddTransaction,
  ChangeTransactionState,
  CTTransaction,
  CTTransactionState,
  CTTransactionType,
  molliePaymentToCTStatusMap,
  UpdateActionKey,
} from '../types/commercetools.types';
import { makeCTMoney, makeMollieAmount, shouldPaymentStatusUpdate } from '../utils/mollie.utils';
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
  setTransactionCustomType,
} from '../commercetools/action.commercetools';
import { readConfiguration } from '../utils/config.utils';
import { toBoolean } from 'validator';
import {
  CancelParameters,
  CreateParameters,
} from '@mollie/api-client/dist/types/src/binders/payments/refunds/parameters';
import { getPaymentExtension } from '../commercetools/extensions.commercetools';
import { HttpDestination } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/extension';
import { cancelPaymentRefund, createPaymentRefund, getPaymentRefund } from '../mollie/refund.mollie';

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
      ctUpdateActions.push(
        setCustomFields(
          CustomFields.payment.profileId,
          toBoolean(readConfiguration().mollie.cardComponent, true) ? readConfiguration().mollie.profileId : '',
        ),
      );
    }

    return {
      statusCode: 200,
      actions: ctUpdateActions,
    };
  } catch (error: unknown) {
    logger.error(
      `SCTM - listPaymentMethodsByPayment - Failed to list payment methods with CommerceTools Payment ID: ${ctPayment.id}`,
      {
        commerceToolsPaymentId: ctPayment.id,
        error: error,
      },
    );
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
  const manualCapture =
    PAY_LATER_ENUMS.includes(paymentMethod as PaymentMethod) ||
    ('captureMode' in molliePayment && molliePayment.captureMode === 'manual');
  const matchingTransaction = ctTransactions.find((transaction) => transaction.interactionId === molliePaymentId);

  if (manualCapture) {
    return {
      action: UpdateActionKey.AddTransaction,
      transaction: {
        amount: makeCTMoney(molliePayment.amount),
        state: molliePaymentToCTStatusMap[molliePaymentStatus],
        type: CTTransactionType.Authorization,
        interactionId: molliePaymentId,
      },
    };
  }

  // If no corresponding CT Transaction, create it
  if (matchingTransaction === undefined) {
    return {
      action: UpdateActionKey.AddTransaction,
      transaction: {
        amount: makeCTMoney(molliePayment.amount),
        state: molliePaymentToCTStatusMap[molliePaymentStatus],
        type: manualCapture ? CTTransactionType.Authorization : CTTransactionType.Charge,
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
  const extensionUrl = (((await getPaymentExtension()) as Extension)?.destination as HttpDestination).url;

  const paymentParams = createMollieCreatePaymentParams(ctPayment, extensionUrl);

  let molliePayment;
  if (PaymentMethod[paymentParams.method as PaymentMethod]) {
    logger.debug('SCTM - handleCreatePayment - Attempt creating a payment with method defined in Mollie NodeJS Client');

    molliePayment = await createMolliePayment(paymentParams);
  } else {
    logger.debug(
      'SCTM - handleCreatePayment - Attempt creating a payment with an unknown method in Mollie NodeJS Client but still supported by Mollie',
    );

    molliePayment = await createPaymentWithCustomMethod(paymentParams);
  }

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
export const getCreatePaymentUpdateAction = async (molliePayment: MPayment | any, CTPayment: Payment) => {
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

export const handleCreateRefund = async (ctPayment: Payment): Promise<ControllerResponseType> => {
  const successChargeTransaction = ctPayment.transactions.find(
    (transaction) => transaction.type === CTTransactionType.Charge && transaction.state === CTTransactionState.Success,
  );

  const initialRefundTransaction = ctPayment.transactions.find(
    (transaction) => transaction.type === CTTransactionType.Refund && transaction.state === CTTransactionState.Initial,
  );

  const paymentCreateRefundParams: CreateParameters = {
    paymentId: successChargeTransaction?.interactionId as string,
    amount: makeMollieAmount(initialRefundTransaction?.amount as CentPrecisionMoney),
  };

  const refund = await createPaymentRefund(paymentCreateRefundParams);

  return {
    statusCode: 201,
    actions: [
      changeTransactionInteractionId(initialRefundTransaction?.id as string, refund.id),
      changeTransactionState(initialRefundTransaction?.id as string, CTTransactionState.Pending),
    ],
  };
};

/**
 * Handles the cancellation of a payment refund.
 *
 * @param {Payment} ctPayment - The CommerceTools payment object.
 * @return {Promise<ControllerResponseType>} A promise that resolves to a ControllerResponseType object.
 * @throws {CustomError} If there is an error in the process.
 */
export const handlePaymentCancelRefund = async (ctPayment: Payment): Promise<ControllerResponseType> => {
  const successChargeTransaction = ctPayment.transactions.find(
    (transaction) => transaction.type === CTTransactionType.Charge && transaction.state === CTTransactionState.Success,
  );

  const pendingRefundTransaction = ctPayment.transactions.find(
    (transaction) => transaction.type === CTTransactionType.Refund && transaction.state === CTTransactionState.Pending,
  );

  const initialCancelAuthorization = ctPayment.transactions.find(
    (transaction) =>
      transaction.type === CTTransactionType.CancelAuthorization && transaction.state === CTTransactionState.Initial,
  );

  const paymentGetRefundParams: CancelParameters = {
    paymentId: successChargeTransaction?.interactionId as string,
  };

  const molliePaymentRefund = await getPaymentRefund(
    pendingRefundTransaction?.interactionId as string,
    paymentGetRefundParams,
  );

  if (!['queued', 'pending'].includes(molliePaymentRefund.status)) {
    logger.error(
      `SCTM - handleCancelRefund - Mollie refund status must be queued or pending, refund ID: ${molliePaymentRefund.id}`,
    );
    throw new CustomError(
      400,
      `SCTM - handleCancelRefund - Mollie refund status must be queued or pending, refund ID: ${molliePaymentRefund.id}`,
    );
  }

  const paymentCancelRefundParams: CancelParameters = {
    paymentId: successChargeTransaction?.interactionId as string,
  };

  await cancelPaymentRefund(molliePaymentRefund.id, paymentCancelRefundParams);

  const ctActions: UpdateAction[] = getPaymentCancelActions(
    pendingRefundTransaction as Transaction,
    initialCancelAuthorization as Transaction,
    ConnectorActions.CancelRefund,
  );

  return {
    statusCode: 200,
    actions: ctActions,
  };
};

/**
 * Retrieves the payment cancel actions based on the provided pending refund transaction.
 * Would be used for cancel a payment or cancel a refund
 *
 * @param {Transaction} transaction - The pending refund transaction.
 * @return {Action[]} An array of actions including updating the transaction state and setting the transaction custom field value.
 * @throws {CustomError} If the JSON string from the custom field cannot be parsed.
 */
export const getPaymentCancelActions = (
  targetTransaction: Transaction,
  triggerTransaction: Transaction,
  action: DeterminePaymentActionType,
) => {
  const transactionCustomFieldName = CustomFields.paymentCancelReason;

  const newTransactionCustomFieldValue = {
    reasonText: triggerTransaction.custom?.fields?.reasonText,
    statusText: CancelStatusText,
  };

  return [
    // Update transaction state to failure
    // For cancelling payment, it will be the successAuthorization
    // For cancelling refund, it will be the pendingRefundTransaction
    changeTransactionState(targetTransaction.id, CTTransactionState.Failure),
    // Update transaction state to success
    // For both cancelling payment and cancelling refund, it will be the InitialCancelAuthorization
    changeTransactionState(triggerTransaction.id, CTTransactionState.Success),
    // Set transaction custom field value
    setTransactionCustomType(targetTransaction.id, transactionCustomFieldName, newTransactionCustomFieldValue),
  ];
};

export const handleCancelPayment = async (ctPayment: Payment): Promise<ControllerResponseType> => {
  const successAuthorizationTransaction = ctPayment.transactions.find(
    (transaction) =>
      transaction.type === CTTransactionType.Authorization && transaction.state === CTTransactionState.Success,
  );

  const initialCancelAuthorizationTransaction = ctPayment.transactions.find(
    (transaction) =>
      transaction.type === CTTransactionType.CancelAuthorization && transaction.state === CTTransactionState.Initial,
  );

  const molliePayment = await getPaymentById(successAuthorizationTransaction?.interactionId as string);

  if (molliePayment.isCancelable === false) {
    logger.error(`SCTM - handleCancelPayment - Payment is not cancelable, Mollie Payment ID: ${molliePayment.id}`, {
      molliePaymentId: molliePayment.id,
      commerceToolsPaymentId: ctPayment.id,
    });

    throw new CustomError(
      400,
      `SCTM - handleCancelPayment - Payment is not cancelable, Mollie Payment ID: ${molliePayment.id}`,
    );
  }

  await cancelPayment(molliePayment.id);

  const ctActions: UpdateAction[] = getPaymentCancelActions(
    successAuthorizationTransaction as Transaction,
    initialCancelAuthorizationTransaction as Transaction,
    ConnectorActions.CancelPayment,
  );

  return {
    statusCode: 200,
    actions: ctActions,
  };
};
