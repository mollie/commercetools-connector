import { version as PACKAGE_VERSION } from '../../package.json';
import { PaymentMethod } from '@mollie/api-client';

export const LIBRARY_NAME = 'ShopmacherCommercetoolsMollieConnector';

export const LIBRARY_VERSION = PACKAGE_VERSION;

export const MOLLIE_AGENT_INFO = 'uap/NJTCs6RvSnqbvawh';

export const VERSION_STRING = `${LIBRARY_NAME}/${LIBRARY_VERSION}`;

export const MOLLIE_VERSION_STRINGS = [VERSION_STRING, MOLLIE_AGENT_INFO];

export const CustomFields = {
  payment: {
    error: 'sctm_payment_methods_error',
    request: 'sctm_payment_methods_request',
    response: 'sctm_payment_methods_response',
    profileId: 'sctm_mollie_profile_id',
  },
  createPayment: {
    request: 'sctm_create_payment_request',
    interfaceInteraction: 'sctm_interface_interaction_type',
  },
  paymentCancelReason: 'sctm_payment_cancel_reason',
  applePay: {
    session: {
      request: 'sctm_apple_pay_session_request',
      response: 'sctm_apple_pay_session_response',
    },
  },
};

export enum ConnectorActions {
  GetPaymentMethods = 'getPaymentMethods',
  CreatePayment = 'createPayment',
  CancelPayment = 'cancelPayment',
  CreateRefund = 'createRefund',
  CancelRefund = 'cancelRefund',
  NoAction = 'noAction',
  GetApplePaySession = 'getApplePaySession',
}

export const ErrorMessages = {
  paymentObjectNotFound: 'Object ctPayment not found',
};

export const PAY_LATER_ENUMS = [PaymentMethod.klarnapaylater, PaymentMethod.klarnasliceit];

export const CancelStatusText = 'Cancelled from shop side';

export const DUE_DATE_PATTERN = /^(\d+)d$/;

export const DEFAULT_DUE_DATE = 14;
