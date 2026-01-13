import React, { ReactElement } from 'react';
import { useFormik, type FormikHelpers } from 'formik';
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
import ToggleInput from '@commercetools-uikit/toggle-input';
import Constraints from '@commercetools-uikit/constraints';
import { SupportedPaymentMethods } from '../../types/app';
import FieldLabel from '@commercetools-uikit/field-label';

type Formik = ReturnType<typeof useFormik>;
type FormProps = {
  formElements: ReactElement;
  iconElements: ReactElement;
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
        renderError={(errorKey) => {
          if (errorKey === 'invalidLength') {
            return intl.formatMessage(messages.fieldMethodNameInvalidLength);
          }
          return null;
        }}
        data-testid="name-input"
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
        data-testid="description-input"
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
        data-testid="display-order-input"
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
      {formik.values.id === SupportedPaymentMethods.creditcard && (
        <Constraints.Horizontal>
          <FieldLabel
            title={intl.formatMessage(messages.fieldDisplayCardComponenet)}
            description={intl.formatMessage(
              messages.fieldDisplayCardComponenetDescription
            )}
            htmlFor="displayCardComponent"
          />
          <ToggleInput
            id="displayCardComponent"
            name="displayCardComponent"
            isChecked={formik.values.displayCardComponent}
            onChange={formik.handleChange}
            size="small"
            data-testid="display-card-component"
          />
        </Constraints.Horizontal>
      )}

      {formik.values.id === SupportedPaymentMethods.banktransfer && (
        <TextField
          name="banktransferDueDate"
          maxLength={4}
          title={intl.formatMessage(messages.fieldBanktransaferDueDate)}
          description={intl.formatMessage(
            messages.fieldBanktransaferDueDateDescription
          )}
          value={formik.values.banktransferDueDate || ''}
          errors={
            TextField.toFieldErrors<TMethodObjectValueFormValues>(formik.errors)
              .banktransferDueDate
          }
          touched={Boolean(formik.touched.banktransferDueDate)}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          isReadOnly={props.isReadOnly}
          horizontalConstraint={13}
          renderError={(errorKey) => {
            if (errorKey === 'IsNotAString') {
              return intl.formatMessage(
                messages.fieldBanktransaferDueDateIsNotAString
              );
            }
            return null;
          }}
          data-testid="banktransfer-due-date"
        ></TextField>
      )}
    </Spacings.Stack>
  );

  const iconElements = (
    <Spacings.Inline scale="l" alignItems="center">
      <img
        data-testid="image-preview"
        src={formik.values.imageUrl}
        height={70}
        width={100}
        alt="icon"
      />
      <TextField
        name="imageUrl"
        title={intl.formatMessage(messages.fieldImageUrl)}
        value={formik.values.imageUrl || ''}
        errors={
          TextField.toFieldErrors<TMethodObjectValueFormValues>(formik.errors)
            .imageUrl
        }
        touched={Boolean(formik.touched.imageUrl)}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        isReadOnly={props.isReadOnly}
        horizontalConstraint={13}
        data-testid="image-url-input"
      ></TextField>
    </Spacings.Inline>
  );

  return props.children({
    formElements,
    iconElements,
    values: formik.values,
    isDirty: formik.dirty,
    isSubmitting: formik.isSubmitting,
    submitForm: formik.handleSubmit,
    handleReset: formik.handleReset,
  });
};

MethodDetailsForm.displayName = 'MethodDetailsForm';
export default MethodDetailsForm;
