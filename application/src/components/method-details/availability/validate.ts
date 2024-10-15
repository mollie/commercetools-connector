import omitEmpty from 'omit-empty-es';
import type { FormikErrors } from 'formik';
import {
  TAmountPerCountry,
  TAvailabilityObjectValueFormValues,
} from '../../../types';
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

  errors.maxAmount.invalidValue = Object.entries(formikValues).some(
    ([_, currencies]) =>
      Object.entries(currencies).some(
        ([currency, { minAmount, maxAmount }]) => {
          const nMinAmount = convertCurrencyStringToNumber(minAmount);
          const nMaxAmount = convertCurrencyStringToNumber(maxAmount);

          return nMaxAmount < nMinAmount;
        }
      )
  );

  return omitEmpty(errors);
};

export default validate;
