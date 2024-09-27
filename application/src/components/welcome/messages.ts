import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'Welcome.title',
    defaultMessage: 'Mollie payment methods',
  },
  subtitle: {
    id: 'Welcome.subtitle',
    defaultMessage:
      'Welcome to the Mollie Custom Application. This application allows you to manage your Mollie payments in the Commercetools Merchant Center.',
  },
  notice: {
    id: 'Welcome.notice',
    defaultMessage: 'Content will follow...',
  },
  noData: {
    id: 'Welcome.noData',
    defaultMessage:
      'There are no active payment methods available. Please activate them in your mollie dashboard first.',
  },
  activeHeader: {
    id: 'Welcome.activeHeader',
    defaultMessage:
      'Payment method is only available for checkout if the status is set to “Active”. Please make sure that the payment method is also enabled in the Mollie Dashboard.',
  },
});
