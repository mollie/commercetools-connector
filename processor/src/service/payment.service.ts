import { ControllerResponseType } from '../types/controller.types';
import { CancelStatusText, ConnectorActions, CustomFields, PAY_LATER_ENUMS } from '../utils/constant.utils';
import { List, Method, Payment as MPayment, PaymentMethod, PaymentStatus, Refund } from '@mollie/api-client';
import { logger } from '../utils/logger.utils';
import {
  createCartUpdateActions,
  createMollieCreatePaymentParams,
  mapCommercetoolsPaymentCustomFieldsToMollieListParams,
} from '../utils/map.utils';
import {
  CartUpdateAction,
  CentPrecisionMoney,
  CustomObject,
  Extension,
  Payment,
  UpdateAction,
} from '@commercetools/platform-sdk';
import CustomError from '../errors/custom.error';
import {
  cancelPayment,
  createMolliePayment,
  createPaymentWithCustomMethod,
  getApplePaySession,
  getPaymentById,
  listPaymentMethods,
} from '../mollie/payment.mollie';
import {
  AddTransaction,
  ChangeTransactionState,
  CTTransaction,
  CTTransactionState,
  CTTransactionType,
  CustomMethod,
  molliePaymentToCTStatusMap,
  mollieRefundToCTStatusMap,
  PricingConstraintItem,
  UpdateActionKey,
} from '../types/commercetools.types';
import {
  makeCTMoney,
  makeMollieAmount,
  shouldPaymentStatusUpdate,
  shouldRefundStatusUpdate,
} from '../utils/mollie.utils';
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
import { ApplePaySessionRequest, CustomPayment, SupportedPaymentMethods } from '../types/mollie.types';
import {
  calculateTotalSurchargeAmount,
  convertCentToEUR,
  parseStringToJsonObject,
  roundSurchargeAmountToCent,
  sortTransactionsByLatestCreationTime,
} from '../utils/app.utils';
import ApplePaySession from '@mollie/api-client/dist/types/src/data/applePaySession/ApplePaySession';
import { getMethodConfigObjects, getSingleMethodConfigObject } from '../commercetools/customObjects.commercetools';
import { getCartFromPayment, updateCart } from '../commercetools/cart.commercetools';
import { removeCartMollieCustomLineItem } from './cart.service';

/**
 * Validates and sorts the payment methods.
 *
 * @param {CustomMethod[]} methods - The list of payment methods.
 * @param {CustomObject[]} configObjects - The configuration objects.
 * @return {CustomMethod[]} - The validated and sorted payment methods.
 */
const validateAndSortMethods = (methods: CustomMethod[], configObjects: CustomObject[]): CustomMethod[] => {
  methods.push({
    id: 'googlepay',
    name: { 'en-GB': 'Google Pay' },
    description: { 'en-GB': '' },
    image: '',
    order: 0,
  });

  if (!configObjects.length) {
    return methods.filter(
      (method: CustomMethod) => SupportedPaymentMethods[method.id.toString() as SupportedPaymentMethods],
    );
  }

  return methods
    .filter((method) => isValidMethod(method, configObjects))
    .map((method) => mapMethodToCustomMethod(method, configObjects))
    .sort((a, b) => b.order - a.order); // Descending order sort
};

/**
 * Checks if a method is valid based on the configuration objects.
 *
 * @param {CustomMethod} method - The payment method.
 * @param {CustomObject[]} configObjects - The configuration objects.
 * @return {boolean} - True if the method is valid, false otherwise.
 */
const isValidMethod = (method: CustomMethod, configObjects: CustomObject[]): boolean => {
  return (
    !!configObjects.find((config) => config.key === method.id && config.value.status === 'Active') &&
    !!SupportedPaymentMethods[method.id.toString() as SupportedPaymentMethods]
  );
};

/**
 * Maps a payment method to a custom method.
 *
 * @param {CustomMethod} method - The payment method.
 * @param {CustomObject[]} configObjects - The configuration objects.
 * @return {CustomMethod} - The custom method.
 */
const mapMethodToCustomMethod = (method: CustomMethod, configObjects: CustomObject[]): CustomMethod => {
  const config = configObjects.find((config) => config.key === method.id);

  return {
    id: method.id,
    name: config?.value?.name,
    description: config?.value?.description,
    image: config?.value?.imageUrl,
    order: config?.value?.displayOrder || 0,
  };
};

/**
 * Determines if the card component should be enabled.
 *
 * @param {CustomMethod[]} validatedMethods - The validated payment methods.
 * @return {boolean} - True if the card component should be enabled, false otherwise.
 */
const shouldEnableCardComponent = (validatedMethods: CustomMethod[]): boolean => {
  return (
    toBoolean(readConfiguration().mollie.cardComponent, true) &&
    validatedMethods.some((method) => method.id === PaymentMethod.creditcard)
  );
};

const mapMollieMethodToCustomMethod = (method: Method) => ({
  id: method.id,
  name: { 'en-GB': method.description },
  description: { 'en-GB': '' },
  image: method.image.svg,
  order: 0,
});

const getBillingCountry = (ctPayment: Payment): string | undefined => {
  const requestField = ctPayment.custom?.fields[CustomFields.payment.request];
  return requestField ? JSON.parse(requestField).billingCountry : undefined;
};

const filterMethodsByPricingConstraints = (
  methods: CustomMethod[],
  configObjects: CustomObject[],
  ctPayment: Payment,
  billingCountry: string,
) => {
  const currencyCode = ctPayment.amountPlanned.currencyCode;
  const amount = convertCentToEUR(ctPayment.amountPlanned.centAmount, ctPayment.amountPlanned.fractionDigits);

  configObjects.forEach((item: CustomObject) => {
    const pricingConstraint = item.value.pricingConstraints?.find((constraint: PricingConstraintItem) => {
      return constraint.countryCode === billingCountry && constraint.currencyCode === currencyCode;
    }) as PricingConstraintItem;

    if (pricingConstraint) {
      const surchargeAmount = calculateTotalSurchargeAmount(ctPayment, pricingConstraint.surchargeCost);
      const amountIncludedSurcharge = amount + surchargeAmount;

      if (
        (pricingConstraint.minAmount && amount < pricingConstraint.minAmount) ||
        (pricingConstraint.maxAmount && amount > pricingConstraint.maxAmount) ||
        (pricingConstraint.maxAmount && amountIncludedSurcharge > pricingConstraint.maxAmount)
      ) {
        const index = methods.findIndex((method) => method.id === item.value.id);
        if (index !== -1) {
          methods.splice(index, 1);
        }
      }
    }
  });
};

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
    const configObjects: CustomObject[] = await getMethodConfigObjects();

    const billingCountry = getBillingCountry(ctPayment);

    if (!billingCountry) {
      logger.error(`SCTM - listPaymentMethodsByPayment - billingCountry is not provided.`, {
        commerceToolsPaymentId: ctPayment.id,
      });
      throw new CustomError(400, 'billingCountry is not provided.');
    }

    const customMethods = methods.map(mapMollieMethodToCustomMethod);

    const validatedMethods = validateAndSortMethods(customMethods, configObjects);

    const enableCardComponent = shouldEnableCardComponent(validatedMethods);

    if (billingCountry) {
      filterMethodsByPricingConstraints(validatedMethods, configObjects, ctPayment, billingCountry);
    }

    const availableMethods = JSON.stringify({
      count: validatedMethods.length,
      methods: validatedMethods.length ? validatedMethods : [],
    });

    const ctUpdateActions: UpdateAction[] = [
      setCustomFields(CustomFields.payment.profileId, enableCardComponent ? readConfiguration().mollie.profileId : ''),
      setCustomFields(CustomFields.payment.response, availableMethods),
    ];

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
      return Promise.reject(error);
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
export const handlePaymentWebhook = async (paymentId: string): Promise<boolean> => {
  logger.debug(`SCTM - handlePaymentWebhook - paymentId:${paymentId}`);

  const molliePayment = await getPaymentById(paymentId);

  const ctPayment = await getPaymentByMolliePaymentId(molliePayment.id);

  const pendingChargeTransaction = ctPayment.transactions.find(
    (transaction) => transaction.type === CTTransactionType.Charge && transaction.state === CTTransactionState.Pending,
  );

  const initialCancelAuthorizationTransaction = ctPayment.transactions.find(
    (transaction) =>
      transaction.type === CTTransactionType.CancelAuthorization && transaction.state === CTTransactionState.Initial,
  );

  if (
    molliePayment.status === PaymentStatus.canceled &&
    !pendingChargeTransaction &&
    !initialCancelAuthorizationTransaction
  ) {
    logger.warn(
      `SCTM - handlePaymentWebhook - Pending Charge transaction or Initial CancelAuthorization transaction is not found, CommerceTools Payment ID: ${ctPayment.id}`,
    );
    return false;
  }

  const action = getPaymentStatusUpdateAction(ctPayment.transactions as CTTransaction[], molliePayment);

  // If refunds are present, update their status
  const refunds = molliePayment._embedded?.refunds;
  if (refunds?.length) {
    const refundUpdateActions = getRefundStatusUpdateActions(ctPayment.transactions as CTTransaction[], refunds);
    action.push(...refundUpdateActions);
  }

  if (action.length === 0) {
    logger.debug(`handlePaymentWebhook - No actions needed`);

    return true;
  }

  logger.info(`handlePaymentWebhook - actions:${JSON.stringify(action)}`);

  await updatePayment(ctPayment, action as PaymentUpdateAction[]);

  if (molliePayment.status === PaymentStatus.canceled) {
    await removeCartMollieCustomLineItem(ctPayment);
  }

  return true;
};

export const getPaymentStatusUpdateAction = (
  ctTransactions: CTTransaction[],
  molliePayment: MPayment,
): UpdateAction[] => {
  const { id: molliePaymentId, status: molliePaymentStatus, method: paymentMethod } = molliePayment;
  // Determine if paynow or paylater method
  const manualCapture =
    PAY_LATER_ENUMS.includes(paymentMethod as PaymentMethod) ||
    ('captureMode' in molliePayment && molliePayment.captureMode === 'manual');
  const matchingTransaction = ctTransactions.find((transaction) => transaction.interactionId === molliePaymentId);

  // Handle for cancel payment case
  if (molliePayment.status === PaymentStatus.canceled) {
    const pendingChargeTransaction = ctTransactions.find(
      (transaction) =>
        transaction.type === CTTransactionType.Charge && transaction.state === CTTransactionState.Pending,
    );

    const initialCancelAuthorizationTransaction = ctTransactions.find(
      (transaction) =>
        transaction.type === CTTransactionType.CancelAuthorization && transaction.state === CTTransactionState.Initial,
    );

    return getPaymentCancelActions(
      pendingChargeTransaction as Transaction,
      initialCancelAuthorizationTransaction as Transaction,
    );
  }

  if (manualCapture) {
    return [
      {
        action: UpdateActionKey.AddTransaction,
        transaction: {
          amount: makeCTMoney(molliePayment.amount),
          state: molliePaymentToCTStatusMap[molliePaymentStatus],
          type: CTTransactionType.Authorization,
          interactionId: molliePaymentId,
        },
      } as UpdateAction,
    ];
  }

  // If no corresponding CT Transaction, create it
  if (matchingTransaction === undefined) {
    return [
      {
        action: UpdateActionKey.AddTransaction,
        transaction: {
          amount: makeCTMoney(molliePayment.amount),
          state: molliePaymentToCTStatusMap[molliePaymentStatus],
          type: manualCapture ? CTTransactionType.Authorization : CTTransactionType.Charge,
          interactionId: molliePaymentId,
        },
      } as UpdateAction,
    ];
  }

  // Corresponding transaction, update it
  const shouldUpdate = shouldPaymentStatusUpdate(molliePaymentStatus, matchingTransaction.state as CTTransactionState);
  if (shouldUpdate) {
    return [
      changeTransactionState(
        matchingTransaction.id as string,
        molliePaymentToCTStatusMap[molliePaymentStatus],
      ) as ChangeTransactionState,
    ];
  }

  return [];
};

/**
 * Creates a Mollie Payment
 *
 * @return {Promise<CTPayloadValidationResponse>} - A promise that resolves to the created MolliePayment or a CTPayloadValidationResponse if there is an error.
 * @param ctPayment
 */
export const handleCreatePayment = async (ctPayment: Payment): Promise<ControllerResponseType> => {
  const extensionUrl = (((await getPaymentExtension()) as Extension)?.destination as HttpDestination).url;

  const cart = await getCartFromPayment(ctPayment.id);

  const [method] = ctPayment?.paymentMethodInfo?.method?.split(',') ?? [null, null];

  logger.debug(`SCTM - handleCreatePayment - Getting customized configuration for payment method: ${method}`);
  const paymentMethodConfig = await getSingleMethodConfigObject(method as string);
  const billingCountry = getBillingCountry(ctPayment);

  const pricingConstraint = paymentMethodConfig.value.pricingConstraints?.find((constraint: PricingConstraintItem) => {
    return (
      constraint.countryCode === billingCountry && constraint.currencyCode === ctPayment.amountPlanned.currencyCode
    );
  }) as PricingConstraintItem;

  logger.debug(`SCTM - handleCreatePayment - Calculating total surcharge amount`);
  const surchargeAmountInCent = pricingConstraint
    ? roundSurchargeAmountToCent(
        calculateTotalSurchargeAmount(ctPayment, pricingConstraint.surchargeCost),
        ctPayment.amountPlanned.fractionDigits,
      )
    : 0;

  const paymentParams = createMollieCreatePaymentParams(ctPayment, extensionUrl, surchargeAmountInCent, cart);

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

  const cartUpdateActions = createCartUpdateActions(cart, ctPayment, surchargeAmountInCent);
  if (cartUpdateActions.length > 0) {
    await updateCart(cart, cartUpdateActions as CartUpdateAction[]);
  }

  const ctActions = await getCreatePaymentUpdateAction(molliePayment, ctPayment, surchargeAmountInCent);

  logger.debug('SCTM - handleCreatePayment - actionslogging', ctActions);

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
export const getCreatePaymentUpdateAction = async (
  molliePayment: MPayment | CustomPayment,
  CTPayment: Payment,
  surchargeAmountInCent: number,
) => {
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
      sctm_action_type: ConnectorActions.CreatePayment,
      sctm_request: JSON.stringify(interfaceInteractionRequest),
      sctm_response: JSON.stringify(interfaceInteractionResponse),
      sctm_id: uuid(),
      sctm_created_at: molliePayment.createdAt,
    };

    const actions: UpdateAction[] = [
      // Add interface interaction
      addInterfaceInteraction(interfaceInteractionParams),
      // Update transaction interactionId
      changeTransactionInteractionId(originalTransaction.id, molliePayment.id),
      // Update transaction timestamp
      changeTransactionTimestamp(originalTransaction.id, molliePayment.createdAt),
      // Update transaction state
      changeTransactionState(originalTransaction.id, CTTransactionState.Pending),
    ];

    if (surchargeAmountInCent > 0) {
      // Add surcharge amount to the custom field of the transaction
      actions.push(
        setTransactionCustomType(originalTransaction.id, CustomFields.transactionSurchargeCost, {
          surchargeAmountInCent,
        }),
      );
    }

    return Promise.resolve(actions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return Promise.reject(error);
  }
};

export const handleCreateRefund = async (ctPayment: Payment): Promise<ControllerResponseType> => {
  let successChargeTransaction;
  const updateActions = [] as UpdateAction[];

  const initialRefundTransaction = ctPayment.transactions.find(
    (transaction) => transaction.type === CTTransactionType.Refund && transaction.state === CTTransactionState.Initial,
  );

  if (initialRefundTransaction?.custom?.fields[CustomFields.transactionRefundForMolliePayment]) {
    logger.debug('SCTM - handleCreateRefund - creating a refund with specific payment id');

    successChargeTransaction = ctPayment.transactions.find(
      (transaction) =>
        transaction.type === CTTransactionType.Charge &&
        transaction.state === CTTransactionState.Success &&
        transaction.interactionId ===
          initialRefundTransaction?.custom?.fields[CustomFields.transactionRefundForMolliePayment],
    );
  } else {
    logger.debug('SCTM - handleCreateRefund - creating a refund for the latest success charge transaction');

    const latestTransactions = sortTransactionsByLatestCreationTime(ctPayment.transactions);

    successChargeTransaction = latestTransactions.find(
      (transaction) =>
        transaction.type === CTTransactionType.Charge && transaction.state === CTTransactionState.Success,
    );

    updateActions.push(
      setTransactionCustomType(initialRefundTransaction?.id as string, CustomFields.transactionRefundForMolliePayment, {
        [CustomFields.transactionRefundForMolliePayment]: successChargeTransaction?.interactionId,
      }),
    );
  }

  if (!successChargeTransaction) {
    throw new CustomError(400, 'SCTM - handleCreateRefund - Cannot find valid success charge transaction');
  }

  const paymentCreateRefundParams: CreateParameters = {
    paymentId: successChargeTransaction?.interactionId as string,
    amount: makeMollieAmount(initialRefundTransaction?.amount as CentPrecisionMoney),
  };

  const refund = await createPaymentRefund(paymentCreateRefundParams);

  updateActions.push(
    changeTransactionInteractionId(initialRefundTransaction?.id as string, refund.id),
    changeTransactionState(initialRefundTransaction?.id as string, CTTransactionState.Pending),
  );

  return {
    statusCode: 201,
    actions: updateActions,
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
  let pendingRefundTransaction: any;
  let successChargeTransaction: any;

  const initialCancelAuthorization = ctPayment.transactions.find(
    (transaction) =>
      transaction.type === CTTransactionType.CancelAuthorization && transaction.state === CTTransactionState.Initial,
  );

  if (initialCancelAuthorization?.interactionId) {
    pendingRefundTransaction = ctPayment.transactions.find(
      (transaction) =>
        transaction.type === CTTransactionType.Refund &&
        transaction.state === CTTransactionState.Pending &&
        transaction?.interactionId === initialCancelAuthorization.interactionId,
    ) as Transaction;

    if (pendingRefundTransaction) {
      successChargeTransaction = ctPayment.transactions.find(
        (transaction) =>
          transaction.type === CTTransactionType.Charge &&
          transaction.state === CTTransactionState.Success &&
          transaction.interactionId ===
            pendingRefundTransaction?.custom?.fields[CustomFields.transactionRefundForMolliePayment],
      ) as Transaction;
    }

    if (!successChargeTransaction) {
      throw new CustomError(
        400,
        'SCTM - handlePaymentCancelRefund - Cannot find the valid Success Charge transaction.',
      );
    }
  }

  /**
   * @deprecated v1.2 - Will be remove in the next version
   */
  if (!pendingRefundTransaction || !successChargeTransaction) {
    const latestTransactions = sortTransactionsByLatestCreationTime(ctPayment.transactions);

    pendingRefundTransaction = latestTransactions.find(
      (transaction) =>
        transaction.type === CTTransactionType.Refund && transaction.state === CTTransactionState.Pending,
    );

    successChargeTransaction = latestTransactions.find(
      (transaction) =>
        transaction.type === CTTransactionType.Charge && transaction.state === CTTransactionState.Success,
    );
  }
  /**
   * end deprecated
   */

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
 * @return {Action[]} An array of actions including updating the transaction state and setting the transaction custom field value.
 * @throws {CustomError} If the JSON string from the custom field cannot be parsed.
 * @param targetTransaction
 * @param triggerTransaction
 */
export const getPaymentCancelActions = (targetTransaction: Transaction, triggerTransaction: Transaction) => {
  const transactionCustomFieldName = CustomFields?.paymentCancelReason;

  const newTransactionCustomFieldValue = {
    reasonText: triggerTransaction?.custom?.fields?.reasonText,
    statusText: CancelStatusText,
  };

  // Update transaction state to failure
  // For cancelling payment, it will be the pendingChargeTransaction
  // For cancelling refund, it will be the pendingRefundTransaction
  const actions: UpdateAction[] = [];

  if (targetTransaction?.id) {
    actions.push(changeTransactionState(targetTransaction?.id, CTTransactionState.Failure));
  }

  // Update transaction state to success
  // For both cancelling payment and cancelling refund, it will be the InitialCancelAuthorization
  if (triggerTransaction?.id) {
    actions.push(changeTransactionState(triggerTransaction?.id, CTTransactionState.Success));
  }

  // Set transaction custom field value
  if (transactionCustomFieldName) {
    actions.push(
      setTransactionCustomType(targetTransaction?.id, transactionCustomFieldName, newTransactionCustomFieldValue),
    );
  }

  return actions;
};

/**
 * @param ctTransactions
 * @param mollieRefunds
 *
 * Process mollie refunds and match to corresponding commercetools transaction
 * Update the existing transactions if the status has changed
 * If there is a refund and no corresponding transaction, add it to commercetools
 */
export const getRefundStatusUpdateActions = (
  ctTransactions: CTTransaction[],
  mollieRefunds: Refund[],
): (ChangeTransactionState | AddTransaction)[] => {
  const updateActions: (ChangeTransactionState | AddTransaction)[] = [];
  const refundTransactions = ctTransactions?.filter((ctTransaction) => ctTransaction.type === CTTransactionType.Refund);

  mollieRefunds.forEach((mollieRefund) => {
    const { id: mollieRefundId, status: mollieRefundStatus } = mollieRefund;
    const matchingCTTransaction = refundTransactions.find((rt) => rt.interactionId === mollieRefundId);

    if (matchingCTTransaction) {
      const shouldUpdate = shouldRefundStatusUpdate(
        mollieRefundStatus,
        matchingCTTransaction.state as CTTransactionState,
      );

      if (shouldUpdate) {
        const updateAction = changeTransactionState(
          matchingCTTransaction.id as string,
          mollieRefundToCTStatusMap[mollieRefundStatus],
        ) as ChangeTransactionState;

        updateActions.push(updateAction);
      }
    } else {
      const updateAction: AddTransaction = {
        action: UpdateActionKey.AddTransaction,
        transaction: {
          type: CTTransactionType.Refund,

          amount: makeCTMoney(mollieRefund.amount),
          interactionId: mollieRefundId,
          state: mollieRefundToCTStatusMap[mollieRefundStatus],
        },
      };

      updateActions.push(updateAction);
    }
  });

  return updateActions;
};

/**
 * Handles the cancellation of a payment.
 *
 * @param {Payment} ctPayment - The CommerceTools payment object.
 * @return {Promise<ControllerResponseType>} - A promise that resolves to the controller response type.
 * The response includes the status code and the actions to update the payment in CommerceTools.
 * @throws {CustomError} - If the payment is not cancelable.
 */
export const handleCancelPayment = async (ctPayment: Payment): Promise<ControllerResponseType> => {
  logger.debug(`SCTM - handleCancelPayment - ctPaymentId:${JSON.stringify(ctPayment?.id)}`);
  const successAuthorizationTransaction = ctPayment.transactions.find(
    (transaction) =>
      transaction.type === CTTransactionType.Authorization && transaction.state === CTTransactionState.Success,
  );

  const molliePayment = await getPaymentById(successAuthorizationTransaction?.interactionId as string);

  if (!molliePayment.isCancelable) {
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

  await removeCartMollieCustomLineItem(ctPayment);

  return {
    statusCode: 200,
    actions: [],
  };
};

export const handleGetApplePaySession = async (ctPayment: Payment): Promise<ControllerResponseType> => {
  const requestOptions: ApplePaySessionRequest = parseStringToJsonObject(
    ctPayment.custom?.fields[CustomFields.applePay.session.request],
    CustomFields.applePay.session.request,
    'SCTM - handleGetApplePaySession',
    ctPayment.id,
  );

  const session: ApplePaySession = await getApplePaySession(requestOptions);

  const ctActions: UpdateAction[] = [
    setCustomFields(CustomFields.applePay.session.response, JSON.stringify(session)),
    setCustomFields(CustomFields.applePay.session.request, ''),
  ];

  return {
    statusCode: 200,
    actions: ctActions,
  };
};