import { useFormik, type FormikHelpers } from 'formik';
import { ReactElement } from 'react';
import { TMethodObjectValueFormValues } from '../../types';
import { useIntl } from 'react-intl';
import Spacings from '@commercetools-uikit/spacings';

type Formik = ReturnType<typeof useFormik>;
type FormProps = {
  formElements: ReactElement;
  values: Formik['values'];
  isDirty: Formik['dirty'];
  isSubmitting: Formik['isSubmitting'];
  submitForm: Formik['handleSubmit'];
  handleReset: Formik['handleReset'];
};
type TCustomObjectDetailsFormProps = {
  onSubmit: (
    value: TMethodObjectValueFormValues,
    formikHelpers: FormikHelpers<TMethodObjectValueFormValues>
  ) => void | Promise<unknown>;
  initialValues?: TMethodObjectValueFormValues;
  isReadOnly: boolean;
  dataLocale: string;
  children: (formProps: FormProps) => JSX.Element;
};

const MethodDetailsForm = (props: TCustomObjectDetailsFormProps) => {
  if (!props.initialValues) {
    return null;
  }

  const intl = useIntl();
  const formik = useFormik<TMethodObjectValueFormValues>({
    initialValues: props.initialValues,
    onSubmit: props.onSubmit,
    validate: () => {},
    enableReinitialize: true,
  });

  const formElements = (
    <Spacings.Inline scale="l" alignItems="flex-start">
      <p>Content will follow...</p>
    </Spacings.Inline>
  );

  return props.children({
    formElements,
    values: formik.values,
    isDirty: formik.dirty,
    isSubmitting: formik.isSubmitting,
    submitForm: formik.handleSubmit,
    handleReset: formik.handleReset,
  });
};

MethodDetailsForm.displayName = 'MethodDetailsForm';
export default MethodDetailsForm;
