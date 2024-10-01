import { defineMessages } from 'react-intl';

export default defineMessages({
  methodDetailsErrorMessage: {
    id: 'MethodDetails.methodDetailsErrorMessage',
    defaultMessage: 'We were unable to fetch the custom object details. Please check your connection, the provided custom object ID and try again.',
  },
  methodDetailsUpdated: {
    id: 'MethodDetails.methodDetailsUpdated',
    defaultMessage: '{methodName} updated',
  },
  methodDetailsStatusUpdated: {
    id: 'MethodDetails.methodDetailsStatusUpdated',
    defaultMessage: '{methodName} {status}',
  },
});
