import { ControllerResponseType } from '../types/controller.types';
import { ConnectorActions, CustomFields, PAY_LATER_ENUMS } from '../utils/constant.utils';
import { List, Method, Payment as MPayment, PaymentMethod } from '@mollie/api-client';
import { logger } from '../utils/logger.utils';
import {
  createMollieCreatePaymentParams,
  mapCommercetoolsPaymentCustomFieldsToMollieListParams,
} from '../utils/map.utils';
import { Payment, UpdateAction } from '@commercetools/platform-sdk';
import CustomError from '../errors/custom.error';
import { createMolliePayment, getPaymentById, listPaymentMethods } from '../mollie/payment.mollie';
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
import { PaymentUpdateAction } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/payment';
import { v4 as uuid } from 'uuid';
import {
  addInterfaceInteraction,
  changeTransactionInteractionId,
  changeTransactionState,
  changeTransactionTimestamp,
  setCustomFields,
} from '../commercetools/action.commercetools';

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