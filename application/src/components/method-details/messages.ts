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
  fieldMethodNameInvalidLength: {
    id: 'MethodDetails.fieldMethodNameInvalidLength',
    defaultMessage: 'Maximum 50 characters allowed.',
  },
  fieldMethodNameDescription: {
    id: 'MethodDetails.fieldMethodNameDescription',
    defaultMessage: 'Enter payment name in their corresponding locals.',
  },
  fieldMethodDescription: {
    id: 'MethodDetails.fieldMethodDescription',
    defaultMessage: 'Payment description',
  },
  fieldMethodDescriptionInvalidLength: {
    id: 'MethodDetails.fieldMethodDescriptionInvalidLength',
    defaultMessage: 'Maximum 100 characters allowed.',
  },
  fieldMethodDescriptionDescription: {
    id: 'MethodDetails.fieldMethodDescriptionDescription',
    defaultMessage: 'Describe payment method in their corresponding locals.',
  },
  fieldMethodDisplayOrder: {
    id: 'MethodDetails.fieldMethodDisplayOrder',
    defaultMessage: 'Display order in checkout',
  },
  fieldMethodDisplayOrderIsNotInteger: {
    id: 'MethodDetails.fieldMethodDisplayOrderIsNotInteger',
    defaultMessage: 'Choose natural integer between 0 and 100.',
  },
  fieldMethodDisplayOrderInfoTitle: {
    id: 'MethodDetails.fieldMethodDisplayOrderInfoTitle',
    defaultMessage: 'Display order in checkout',
  },
  availabilityTitle: {
    id: 'MethodDetails.Availability',
    defaultMessage: 'Availability',
  },
  headerCountry: {
    id: 'MethodDetails.Availability.headerCountry',
    defaultMessage: 'Country',
  },
  headerCurrency: {
    id: 'MethodDetails.Availability.headerCurrency',
    defaultMessage: 'Currency',
  },
  headerMinAmount: {
    id: 'MethodDetails.Availability.headerMinAmount',
    defaultMessage: 'Min amount',
  },
  headerMaxAmount: {
    id: 'MethodDetails.Availability.headerMaxAmount',
    defaultMessage: 'Max amount',
  },
  headerSurchargeCost: {
    id: 'MethodDetails.Availability.headerSurchargeCost',
    defaultMessage: 'Surcharge transaction cost',
  },
  fieldMaxAmountInvalidValue: {
    id: 'MethodDetails.fieldMaxAmountInvalidValue',
    defaultMessage: 'Maximum amount has to be higher then minimum amount.',
  },
  fieldImageUrl: {
    id: 'MethodDetails.fieldImageUrl',
    defaultMessage: 'URL',
  },
  fieldMustBeEqualOrGreaterThanZero: {
    id: 'MethodDetails.fieldMustBeEqualOrGreaterThanZero',
    defaultMessage: 'The amount must be equal or greater than 0',
  },
  fieldDisplayCardComponenet: {
    id: 'MethodDetails.fieldDisplayCardComponent',
    defaultMessage: 'Display card component',
  },
  fieldDisplayCardComponenetDescription: {
    id: 'MethodDetails.fieldDisplayCardComponenetDescription',
    defaultMessage:
      'Enable Mollie card components (0 = disabled or 1 = enabled)',
  },
  fieldBanktransaferDueDate: {
    id: 'MethodDetails.fieldBanktransaferDueDate',
    defaultMessage: 'Banktransfer due date',
  },
  fieldBanktransaferDueDateDescription: {
    id: 'MethodDetails.fieldBankDueDateDescription',
    defaultMessage: 'Set due date between (1d -> 100d)',
  },
  fieldBanktransaferDueDateIsNotAString: {
    id: 'MethodDetails.fieldBanktransaferDueDateIsNotAString',
    defaultMessage: 'Due date must be a string e.g. 25d, 9d',
  },
  fieldSurchargeRestrictionNotificationKlarna: {
    id: 'MethodDetails.fieldSurchargeRestrictionNotificationKlarna',
    defaultMessage:
      'Payment surcharge for BNPL payment methods are restricted by law in the Netherlands.',
  },
});
