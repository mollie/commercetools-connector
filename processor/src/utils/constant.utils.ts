import { version as PACKAGE_VERSION } from '../../package.json';
import { PaymentMethod } from '@mollie/api-client';

export const LIBRARY_NAME = 'ShopmacherCommercetoolsMollieConnector';

export const LIBRARY_VERSION = PACKAGE_VERSION;

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
};

export enum ConnectorActions {
  GetPaymentMethods = 'getPaymentMethods',
  CreatePayment = 'createPayment',
  NoAction = 'noAction',
}

export const ErrorMessages = {
  paymentObjectNotFound: 'SCTM - Object ctPayment not found',
};

export const PAY_LATER_ENUMS = [PaymentMethod.klarnapaylater, PaymentMethod.klarnasliceit];
