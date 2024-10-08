import { defineMessages } from 'react-intl';

export default defineMessages({
  methodDetailsErrorMessage: {
    id: 'MethodDetails.methodDetailsErrorMessage',
    defaultMessage:
      'We were unable to fetch the custom object details. Please check your connection, the provided custom object ID and try again.',
  },
  methodDetailsUpdated: {
    id: 'MethodDetails.methodDetailsUpdated',
    defaultMessage: '{methodName} updated',
  },
  methodDetailsStatusUpdated: {
    id: 'MethodDetails.methodDetailsStatusUpdated',
    defaultMessage: '{methodName} {status}',
  },
  fieldMethodName: {
    id: 'MethodDetails.fieldMethodName',
    defaultMessage: 'Payment name',
  },
  fieldMethodNameDescription: {
    id: 'MethodDetails.fieldMethodNameDescription',
    defaultMessage: 'Enter payment name in their corresponding locals.',
  },
  fieldMethodDescription: {
    id: 'MethodDetails.fieldMethodDescription',
    defaultMessage: 'Payment description',
  },
  fieldMethodDescriptionDescription: {
    id: 'MethodDetails.fieldMethodDescriptionDescription',
    defaultMessage: 'Describe payment method in their corresponding locals.',
  },
  fieldMethodDisplayOrder: {
    id: 'MethodDetails.fieldMethodDisplayOrder',
    defaultMessage: 'Display order in checkout',
  },
  fieldMethodDisplayOrderInfoTitle: {
    id: 'MethodDetails.fieldMethodDisplayOrderInfoTitle',
    defaultMessage: 'Display order in checkout',
  },
});
