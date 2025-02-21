import { v4 as uuid } from 'uuid';
import { createDateNowString } from '../utils/app.utils';
import { CustomFields } from '../utils/constant.utils';
import { CTTransactionState, CreateInterfaceInteractionParams } from '../types/commercetools.types';
import {
  CartAddCustomLineItemAction,
  CartRemoveCustomLineItemAction,
  LocalizedString,
  TaxCategoryResourceIdentifier,
  _Money,
} from '@commercetools/platform-sdk';

/**
 * A function that sets custom fields with the given field name and field value.
 *
 * @param {string} fieldName - The name of the custom field.
 * @param {string} fieldValue - The value of the custom field.
 * @return {object} An object containing the action, name, and value of the custom field.
 */
export const setCustomFields = (fieldName: string, fieldValue: string) => {
  return {
    action: 'setCustomField',
    name: fieldName,
    value: fieldValue,
  };
};

/**
 * @param parameters type createInterfaceInteractionParams, which contains
 * id string, optional
 * actionType ConnectorActions
 * requestValue string
 * responseValue string
 * timestamp string, optional
 *
 * If the responseValue is an API response, JSON Stringify it before passing it
 */
export const addInterfaceInteraction = (params: CreateInterfaceInteractionParams) => {
  const { sctm_action_type, sctm_request, sctm_response, sctm_id, sctm_created_at } = params;
  const interfaceInteractionId = sctm_id ?? uuid();
  const interfaceInteractionTimestamp = sctm_created_at ?? createDateNowString();

  return {
    action: 'addInterfaceInteraction',
    type: {
      key: CustomFields.createPayment.interfaceInteraction.key,
    },
    fields: {
      sctm_id: interfaceInteractionId,
      sctm_action_type,
      sctm_created_at: interfaceInteractionTimestamp,
      sctm_request: sctm_request,
      sctm_response: sctm_response,
    },
  };
};

/**
 *
 * @param id transaction to be updated
 * @param interactionId either the mollie payment id, or the corresponding interfaceInteraction's id
 */
export const changeTransactionInteractionId = (id: string, interactionId: string) => {
  return {
    action: 'changeTransactionInteractionId',
    transactionId: id,
    interactionId,
  };
};

/**
 *
 * @param id transaction to be updated
 * @param timestamp CT DateTime is a JSON string representation of UTC date & time in ISO 8601 format (YYYY-MM-DDThh:mm:ss.sssZ)
 * for example: "2018-10-12T14:00:00.000Z"
 */
export const changeTransactionTimestamp = (id: string, timestamp?: string) => {
  return {
    action: 'changeTransactionTimestamp',
    transactionId: id,
    timestamp: timestamp ? timestamp : createDateNowString(),
  };
};

/**
 *
 * @param id transaction to be updated
 * @param newState CTTransactionState
 */
export const changeTransactionState = (id: string, newState: CTTransactionState) => {
  return {
    action: 'changeTransactionState',
    transactionId: id,
    state: newState,
  };
};

export const setTransactionCustomType = (transactionId: string, key: string, fields: object) => {
  return {
    action: 'setTransactionCustomType',
    type: {
      key,
    },
    fields,
    transactionId,
  };
};

export const removeCustomLineItem = (customLineItemId: string): CartRemoveCustomLineItemAction => {
  return {
    action: 'removeCustomLineItem',
    customLineItemId: customLineItemId,
  };
};

export const addCustomLineItem = (
  name: LocalizedString,
  quantity: number,
  money: _Money,
  slug: string,
  taxCategory?: TaxCategoryResourceIdentifier,
): CartAddCustomLineItemAction => {
  if (!taxCategory) {
    return {
      action: 'addCustomLineItem',
      name,
      quantity,
      money,
      slug,
    };
  }

  return {
    action: 'addCustomLineItem',
    name,
    quantity,
    money,
    slug,
    taxCategory,
  };
};

export const setTransactionCustomField = (name: string, value: string | boolean, transactionId: string) => {
  return {
    action: 'setTransactionCustomField',
    name,
    value,
    transactionId,
  };
};
