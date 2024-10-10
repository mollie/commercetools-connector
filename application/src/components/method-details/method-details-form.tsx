import { useFormik, type FormikHelpers } from 'formik';
import { ReactElement } from 'react';
import { TMethodObjectValueFormValues } from '../../types';
import Spacings from '@commercetools-uikit/spacings';
import TextField from '@commercetools-uikit/text-field';
import NumberField from '@commercetools-uikit/number-field';
import { useIntl } from 'react-intl';
import messages from './messages';
import LocalizedTextField from '@commercetools-uikit/localized-text-field';
import {
  InfoDialog,
  useModalState,
} from '@commercetools-frontend/application-components';
import Text from '@commercetools-uikit/text';
import validate from './validate';

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
  const intl = useIntl();
  const formik = useFormik<TMethodObjectValueFormValues>({
    initialValues: props.initialValues || ({} as TMethodObjectValueFormValues),
    onSubmit: props.onSubmit,
    validate,
    enableReinitialize: true,
  });
  const infoModalState = useModalState();

  if (!props.initialValues) {
    return null;
  }

  const formElements = (
    <Spacings.Stack scale="l" alignItems="flex-start">
      <LocalizedTextField
        name="name"
        title={intl.formatMessage(messages.fieldMethodName)}
        description={intl.formatMessage(messages.fieldMethodNameDescription)}
        selectedLanguage={props.dataLocale}
        value={formik.values.name || {}}
        errors={
          TextField.toFieldErrors<TMethodObjectValueFormValues>(formik.errors)
            .name
        }
        touched={Boolean(formik.touched.name)}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        isReadOnly={props.isReadOnly}
        horizontalConstraint={13}
        isRequired={false}
        renderError={(errorKey) => {
          if (errorKey === 'invalidLength') {
            return intl.formatMessage(messages.fieldMethodNameInvalidLength);
          }
          return null;
        }}
      />
      <LocalizedTextField
        name="description"
        title={intl.formatMessage(messages.fieldMethodDescription)}
        description={intl.formatMessage(
          messages.fieldMethodDescriptionDescription
        )}
        selectedLanguage={props.dataLocale}
        value={formik.values.description || {}}
        errors={
          TextField.toFieldErrors<TMethodObjectValueFormValues>(formik.errors)
            .description
        }
        touched={Boolean(formik.touched.description)}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        isReadOnly={props.isReadOnly}
        horizontalConstraint={13}
        renderError={(errorKey) => {
          if (errorKey === 'invalidLength') {
            return intl.formatMessage(
              messages.fieldMethodDescriptionInvalidLength
            );
          }
          return null;
        }}
      />
      <NumberField
        name="displayOrder"
        title={intl.formatMessage(messages.fieldMethodDisplayOrder)}
        value={formik.values.displayOrder ?? 0}
        errors={
          TextField.toFieldErrors<TMethodObjectValueFormValues>(formik.errors)
            .displayOrder
        }
        touched={Boolean(formik.touched.displayOrder)}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        isReadOnly={props.isReadOnly}
        horizontalConstraint={13}
        step={1}
        isRequired={true}
        onInfoButtonClick={() => {
          infoModalState.openModal();
        }}
        renderError={(errorKey) => {
          if (errorKey === 'isNotInteger') {
            return intl.formatMessage(
              messages.fieldMethodDisplayOrderIsNotInteger
            );
          }
          return null;
        }}
      ></NumberField>
      <InfoDialog
        title={intl.formatMessage(messages.fieldMethodDisplayOrderInfoTitle)}
        isOpen={infoModalState.isModalOpen}
        onClose={infoModalState.closeModal}
      >
        <Spacings.Stack scale="m">
          <Text.Wrap>
            <Text.Body>
              Assigning an order number to payment methods will allow you to
              more easily use sorting your payment methods.
            </Text.Body>
          </Text.Wrap>
          <Text.Wrap>
            <Text.Body>
              Payment method order values can be a calue between 0 and 100.
            </Text.Body>
          </Text.Wrap>
          <Text.Wrap>
            <Text.Body>
              The higher the value, the higher the position in the checkout.
            </Text.Body>
          </Text.Wrap>
          <Text.Wrap>
            <Text.Body>
              <strong>For example:</strong>
            </Text.Body>
          </Text.Wrap>
          <Text.Wrap>
            <Text.Body>Payment Method A has rank value: 25</Text.Body>
          </Text.Wrap>
          <Text.Wrap>
            <Text.Body>Payment Method B has rank value: 80</Text.Body>
          </Text.Wrap>
          <Text.Wrap>
            <Text.Body>
              Therefor Payment Method B will be displayed above A in the
              checkout.
            </Text.Body>
          </Text.Wrap>
        </Spacings.Stack>
      </InfoDialog>
    </Spacings.Stack>
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
