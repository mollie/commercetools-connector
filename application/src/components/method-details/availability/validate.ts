import omitEmpty from 'omit-empty-es';
import type { FormikErrors } from 'formik';
import { TAmountPerCountry } from '../../../types';
import { convertCurrencyStringToNumber } from '../../../helpers';
import { type TCurrencyCode } from '@commercetools-uikit/money-input';

type TMethodObjectErrors = {
  maxAmount: { invalidValue?: boolean };
};

export type TErrorByCurrency = {
  [key in TCurrencyCode as string]: boolean;
};

const validate = (
  formikValues: TAmountPerCountry
): FormikErrors<TAmountPerCountry> => {
  const errors: TMethodObjectErrors = {
    maxAmount: {},
  };

  for (const currencies of Object.values(formikValues)) {
    for (const { minAmount, maxAmount } of Object.values(currencies)) {
      if (maxAmount === '') {
        continue;
      }

      const nMinAmount = convertCurrencyStringToNumber(minAmount);
      const nMaxAmount = convertCurrencyStringToNumber(maxAmount);

      if (nMaxAmount < nMinAmount) {
        errors.maxAmount.invalidValue = true;
        break;
      }
    }
    if (errors.maxAmount.invalidValue) break;
  }

  return omitEmpty(errors);
};

export default validate;
