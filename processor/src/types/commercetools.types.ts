import { ConnectorActions } from '../utils/constant.utils';

export enum CTEnumErrors {
  General = 'General',
  InvalidInput = 'InvalidInput',
  InvalidOperation = 'InvalidOperation',
  Unauthorized = 'Unauthorized',
  SyntaxError = 'SyntaxError',
  SemanticError = 'SemanticError',
  ObjectNotFound = 'ObjectNotFound',
}

export type CTError = {
  code: CTEnumErrors;
  message: string;
  extensionExtraInfo?: CTErrorExtensionExtraInfo;
};

export type CTErrorExtensionExtraInfo = {
  originalStatusCode: number;
  title: string;
  field: string;
  links?: string;
};

export enum CTTransactionState {
  Initial = 'Initial',
  Pending = 'Pending',
  Success = 'Success',
  Failure = 'Failure',
}

export type CTPayloadValidationResponse = {
  error?: CTError;
};

export type CTUpdatesRequestedResponse = {
  status: number;
  actions?: Action[];
  errors?: CTError[];
};

export enum CTTransactionType {
  Authorization = 'Authorization',
  CancelAuthorization = 'CancelAuthorization',
  Charge = 'Charge',
  Refund = 'Refund',
  Chargeback = 'Chargeback',
}

export type CTMoney = {
  type?: 'centPrecision';
  currencyCode: string;
  centAmount: number;
  fractionDigits?: number;
};

export type CTTransaction = {
  id?: string;
  timestamp?: string;
  type: CTTransactionType;
  amount: CTMoney;
  interactionId?: string;
  state?: 'Initial' | 'Pending' | 'Success' | 'Failure';
  custom?: {
    fields: {
      lineIds?: string;
      includeShipping?: boolean;
      description?: string;
      metadata?: string;
    };
  };
};

export type CreateInterfaceInteractionParams = {
  sctm_action_type: ConnectorActions;
  sctm_request: string;
  sctm_response: string;
  sctm_id?: string;
  sctm_created_at?: string;
};

export type Action = {
  action: string;
  type?: {
    key: string;
  };
  fields?: {
    actionType: string;
    request?: string;
    response?: string;
    createdAt?: string;
  };
  name?: string;
  value?: string;
  key?: string;
  transaction?: CTTransaction;
  transactionId?: string;
  interactionId?: string;
  state?: CTTransactionState;
  paymentMethodsResponse?: string;
};

export type CTTransactionDraft = {
  type: CTTransactionType;
  amount: CTMoney;
  interactionId?: string;
  timestamp?: string;
  state?: CTTransactionState;
};

export type AddTransaction = {
  action: UpdateActionKey.AddTransaction;
  transaction: CTTransactionDraft;
};

export type ChangeTransactionState = {
  action: UpdateActionKey.ChangeTransactionState;
  transactionId: string;
  state: CTTransactionState;
};

export enum UpdateActionKey {
  SetCustomField = 'setCustomField',
  ChangeTransactionState = 'changeTransactionState',
  AddTransaction = 'addTransaction',
  SetStatusInterfaceText = 'setStatusInterfaceText',
}

interface StatusMap {
  [key: string]: CTTransactionState;
}

export const molliePaymentToCTStatusMap: StatusMap = {
  paid: CTTransactionState.Success,
  authorized: CTTransactionState.Success,
  canceled: CTTransactionState.Failure,
  failed: CTTransactionState.Failure,
  expired: CTTransactionState.Failure,
  open: CTTransactionState.Initial,
  pending: CTTransactionState.Pending,
};

export const mollieRefundToCTStatusMap: StatusMap = {
  refunded: CTTransactionState.Success,
  failed: CTTransactionState.Failure,
  queued: CTTransactionState.Pending,
  pending: CTTransactionState.Pending,
  processing: CTTransactionState.Pending,
};

export type WebhookRequest = {
  id: string;
};
