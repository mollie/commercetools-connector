import { v4 as uuid } from 'uuid';
import { createDateNowString } from '../utils/app.utils';
import { CustomFields } from '../utils/constant.utils';
import { CTTransactionState, CreateInterfaceInteractionParams } from '../types/commercetools.types';

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
  const { actionType, requestValue, responseValue, id, timestamp } = params;
  const interfaceInteractionId = id ? id : uuid();
  const interfaceInteractionTimestamp = timestamp ? timestamp : createDateNowString();

  return {
    action: 'addInterfaceInteraction',
    type: {
      key: CustomFields.createPayment.interfaceInteraction,
    },
    fields: {
      id: interfaceInteractionId,
      actionType,
      createdAt: interfaceInteractionTimestamp,
      request: requestValue,
      response: responseValue,
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

export const setTransactionCustomField = (transactionId: string, name: string, value: string) => {
  return {
    action: 'setTransactionCustomField',
    transactionId: transactionId,
    name: name,
    value: value,
  };
};
