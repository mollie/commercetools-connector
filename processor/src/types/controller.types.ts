import { UpdateAction } from '@commercetools/platform-sdk';

export type ControllerResponseType = {
  statusCode: number;
  actions?: UpdateAction[];
};

export type DeterminePaymentActionType =
  | 'getPaymentMethods'
  | 'createPayment'
  | 'createRefund'
  | 'cancelRefund'
  | 'noAction';
