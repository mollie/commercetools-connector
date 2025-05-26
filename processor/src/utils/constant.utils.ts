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
    interfaceInteraction: {
      key: 'sctm_interface_interaction_type',
      fields: {
        id: 'sctm_id',
        actionType: 'sctm_action_type',
        createdAt: 'sctm_created_at',
        request: 'sctm_request',
        response: 'sctm_response',
      },
    },
  },
  applePay: {
    session: {
      request: 'sctm_apple_pay_session_request',
      response: 'sctm_apple_pay_session_response',
    },
  },
  transactions: {
    defaultCustomTypeKey: 'sctm_transactions_custom_type',
    resourceTypeId: 'transaction',
    name: {
      en: '(SCTM) Custom transaction type',
      de: '(SCTM) Benutzerdefinierter Transaktionstyp',
    },
    fields: {
      cancelPaymentReasonText: {
        name: 'reasonText',
        label: {
          en: 'The reason of cancelling the refund, include the user name',
          de: 'Der Grund für die Stornierung der Rückerstattung, den Benutzernamen einschließen',
        },
        required: false,
        type: {
          name: 'String',
        },
        inputHint: 'MultiLine',
      },
      cancelPaymentStatusText: {
        name: 'statusText',
        label: {
          en: 'To differentiate between the “failure” from CommerceTools and the real status',
          de: 'Um zwischen dem „Fehler“ von CommerceTools und dem tatsächlichen Status zu unterscheiden',
        },
        required: false,
        type: {
          name: 'String',
        },
        inputHint: 'MultiLine',
      },
      molliePaymentIdToRefund: {
        name: 'sctm_transaction_refund_for_mollie_payment',
        label: {
          en: 'Identify the Mollie payment which is being refunded by its ID',
          de: 'Identifizieren Sie die Mollie-Zahlung, die zurückerstattet wird durch seine ID',
        },
        required: false,
        type: {
          name: 'String',
        },
        inputHint: 'MultiLine',
      },
      surchargeCost: {
        name: 'surchargeAmountInCent',
        label: {
          en: 'Total surcharge amount in cent',
          de: 'Gesamtbetrag des Zuschlags in Cent',
        },
        required: false,
        type: {
          name: 'Number',
        },
        inputHint: 'MultiLine',
      },
      shouldCapturePayment: {
        name: 'sctm_should_capture',
        label: {
          en: 'Should capture money for this transaction',
          de: 'Soll das Geld für diese Transaktion eingezogen werden',
        },
        required: false,
        type: {
          name: 'Boolean',
        },
      },
      capturePaymentDescription: {
        name: 'sctm_capture_description',
        label: {
          en: 'Capture description',
          de: 'Beschreibung der Einziehung',
        },
        required: false,
        type: {
          name: 'String',
        },
        inputHint: 'MultiLine',
      },
      capturePaymentErrors: {
        name: 'sctm_capture_errors',
        label: {
          en: 'Capture errors',
          de: 'Fehler bei der Einziehung',
        },
        required: false,
        type: {
          name: 'String',
        },
        inputHint: 'MultiLine',
      },
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
  CapturePayment = 'capturePayment',
}

export const ErrorMessages = {
  paymentObjectNotFound: 'Object ctPayment not found',
};

export const PAY_LATER_ENUMS = [PaymentMethod.klarnapaylater, PaymentMethod.klarnasliceit];

export const CancelStatusText = 'Cancelled from shop side';

export const DUE_DATE_PATTERN = /^(\d+)d$/;

export const DEFAULT_DUE_DATE = 14;

export const CUSTOM_OBJECT_CONTAINER_NAME = 'sctm-app-methods';

export const MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM = 'mollie-surcharge-line-item';

export const MOLLIE_SURCHARGE_LINE_DESCRIPTION = 'Total surcharge amount';

export const MOLLIE_SHIPPING_LINE_DESCRIPTION = 'Shipping amount';
