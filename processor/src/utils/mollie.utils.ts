import { CentPrecisionMoney } from '@commercetools/platform-sdk';
import { Amount } from '@mollie/api-client/dist/types/src/data/global';
import { CTMoney, CTTransactionState } from '../types/commercetools.types';
import { PaymentStatus } from '@mollie/api-client';

function convertCTToMollieAmountValue(ctValue: number, fractionDigits = 2): string {
  const divider = Math.pow(10, fractionDigits);
  return (ctValue / divider).toFixed(fractionDigits);
}

export const makeMollieAmount = ({ centAmount, fractionDigits, currencyCode }: CentPrecisionMoney): Amount => {
  return {
    value: convertCTToMollieAmountValue(centAmount, fractionDigits),
    currency: currencyCode,
  };
};

export const makeCTMoney = (mollieAmount: Amount): CTMoney => {
  // Get the fraction digits (aka number of decimal places)
  const fractionDigits = mollieAmount.value.split('.')[1]?.length ?? 0;
  const convertedMollieAmountValue = parseFloat(mollieAmount.value) * Math.pow(10, fractionDigits);
  return {
    type: 'centPrecision',
    currencyCode: mollieAmount.currency,
    // If the value is negative, round down, else round up
    centAmount:
      convertedMollieAmountValue > 0 ? Math.ceil(convertedMollieAmountValue) : Math.floor(convertedMollieAmountValue),
    fractionDigits,
  };
};

export const isPayment = (resourceId: string): boolean => {
  const paymentRegex = new RegExp('^tr_');

  return paymentRegex.test(resourceId);
};

export const shouldPaymentStatusUpdate = (
  molliePaymentStatus: PaymentStatus,
  ctTransactionState: CTTransactionState,
): boolean => {
  let shouldUpdate: boolean;

  switch (molliePaymentStatus) {
    // Success statuses
    case PaymentStatus.paid:
    case PaymentStatus.authorized:
      shouldUpdate = ctTransactionState !== CTTransactionState.Success;
      break;

    // Failure statuses
    case PaymentStatus.canceled:
    case PaymentStatus.failed:
    case PaymentStatus.expired:
      shouldUpdate = ctTransactionState !== CTTransactionState.Failure;
      break;

    default:
      shouldUpdate = false;
      break;
  }
  return shouldUpdate;
};