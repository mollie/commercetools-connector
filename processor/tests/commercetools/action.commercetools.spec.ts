import { ConnectorActions } from '../../src/utils/constant.utils';
import { describe, test, expect, jest } from '@jest/globals';
import {
  addInterfaceInteraction,
  changeTransactionInteractionId,
  changeTransactionState,
  changeTransactionTimestamp,
  setCustomFields,
  setTransactionCustomType,
} from '../../src/commercetools/action.commercetools';
import { CTTransactionState, CreateInterfaceInteractionParams } from '../../src/types/commercetools.types';

const mockDate = new Date().toISOString();
jest.mock('../../src/utils/app.utils', () => ({
  createDateNowString: () => mockDate,
}));

const uuid = '5c8b0375-305a-4f19-ae8e-07806b101999';
jest.mock('uuid', () => ({
  v4: () => uuid,
}));

describe('Test actions.utils.ts', () => {
  test.each([
    {
      fieldName: 'example_custom_field_name',
      fieldValue: 'example_custom_field_value',
    },
    {
      fieldName: 'example_custom_field_name',
      fieldValue: '',
    },
  ])('call setCustomFields with fieldName:%s and fieldValue:%s', async ({ fieldName, fieldValue }) => {
    const response = setCustomFields(fieldName, fieldValue);
    expect(response).toBeDefined();
    expect(response.action).toBe('setCustomField');
    expect(response.name).toBe(fieldName);
    expect(response.value).toBe(fieldValue);
  });

  test('call setCustomFields with no empty fields', async () => {
    const response = setCustomFields('', '');
    expect(response).toBeDefined();
    expect(response.action).toBe('setCustomField');
    expect(response.name).toBeFalsy();
    expect(response.value).toBeFalsy();
  });

  test('should able to return the correct addInterfaceInteraction action', () => {
    const requestValueObject = {
      transactionId: 'commercetools-payment-transaction-id',
      paymentMethod: 'creditcard',
    };

    const responseValueObject = {
      molliePaymentId: 'tr_7UhSN1zuXS',
      checkoutUrl: 'https://www.mollie.com/checkout/creditcard/7UhSN1zuXS',
      transactionId: 'commercetools-payment-transaction-id',
    };

    const params: CreateInterfaceInteractionParams = {
      sctm_id: '123456789',
      sctm_action_type: ConnectorActions.CreatePayment,
      sctm_request: JSON.stringify(requestValueObject),
      sctm_response: JSON.stringify(responseValueObject),
      sctm_created_at: '2024-07-04T14:07:35+00:00',
    };

    const actual = addInterfaceInteraction(params);

    expect(actual).toEqual({
      action: 'addInterfaceInteraction',
      type: {
        key: 'sctm_interface_interaction_type',
      },
      fields: {
        sctm_id: params.sctm_id,
        sctm_action_type: params.sctm_action_type,
        sctm_created_at: params.sctm_created_at,
        sctm_request: params.sctm_request,
        sctm_response: params.sctm_response,
      },
    });
  });

  test('should able to return the correct changeTransactionInteractionId action', () => {
    const id = 'commerce-tools-transaction-id';
    const interactionId = 'mollie-payment-id';

    const actual = changeTransactionInteractionId(id, interactionId);

    expect(actual).toEqual({
      action: 'changeTransactionInteractionId',
      transactionId: id,
      interactionId,
    });
  });

  test('should able to return the correct changeTransactionTimestamp action', () => {
    const transactionId = 'commerce-tools-transaction-id';
    const timestamp = '2024-07-04T14:07:35+00:00';

    const actual = changeTransactionTimestamp(transactionId, timestamp);

    expect(actual).toEqual({
      action: 'changeTransactionTimestamp',
      transactionId,
      timestamp,
    });
  });

  test('should able to return the correct changeTransactionTimestamp action with default timestamp', () => {
    const transactionId = 'commerce-tools-transaction-id';

    const actual = changeTransactionTimestamp(transactionId);

    expect(actual).toEqual({
      action: 'changeTransactionTimestamp',
      transactionId,
      timestamp: mockDate,
    });
  });

  test('should able to return the correct changeTransactionState action', () => {
    const id = 'commerce-tools-transaction-id';
    const state = CTTransactionState.Success;

    const actual = changeTransactionState(id, state);

    expect(actual).toEqual({
      action: 'changeTransactionState',
      transactionId: id,
      state: state,
    });
  });

  test('should be able to return the correct setTransactionCustomType action', () => {
    const transactionId = 'trasnsactionId';
    const key = 'transactionCustomFieldKey';
    const fields = {
      reasonText: 'Cancel refund reason',
      statusText: 'Cancel refund status',
    };

    expect(setTransactionCustomType(transactionId, key, fields)).toEqual({
      action: 'setTransactionCustomType',
      type: {
        key,
      },
      fields,
      transactionId,
    });
  });
});
