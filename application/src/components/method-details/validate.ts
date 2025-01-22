import omitEmpty from 'omit-empty-es';
import { type FormikErrors } from 'formik';
import type { TMethodObjectValueFormValues } from '../../types';

type TMethodObjectErrors = {
  name: { invalidLength?: boolean };
  description: { invalidLength?: boolean };
  displayOrder: { isNotInteger?: boolean };
  banktransferDueDate: { IsNotAString?: boolean };
};

const validate = (
  formikValues: TMethodObjectValueFormValues
): FormikErrors<TMethodObjectValueFormValues> => {
  const errors: TMethodObjectErrors = {
    name: {},
    description: {},
    displayOrder: {},
    banktransferDueDate: {},
  };

  if (
    Object.keys(formikValues.name).some(
      (language) => formikValues.name[language].length > 50
    )
  ) {
    errors.name.invalidLength = true;
  }
  if (
    Object.keys(formikValues.description).some(
      (language) => formikValues.description[language].length > 100
    )
  ) {
    errors.description.invalidLength = true;
  }
  if (
    !Number.isInteger(formikValues.displayOrder) ||
    formikValues.displayOrder < 0 ||
    formikValues.displayOrder > 100
  ) {
    errors.displayOrder.isNotInteger = true;
  }
  if (formikValues.banktransferDueDate) {
    const dateValue = formikValues.banktransferDueDate.replace('d', '');
    if (
      !formikValues.banktransferDueDate.includes('d') ||
      isNaN(parseInt(dateValue)) ||
      parseInt(dateValue) < 0 ||
      parseInt(dateValue) > 100
    ) {
      errors.banktransferDueDate.IsNotAString = true;
    }
  }

  return omitEmpty(errors);
};

export default validate;
