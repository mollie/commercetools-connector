import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import SelectField from '@commercetools-uikit/select-field';
import messages from '../messages';
import { useIntl } from 'react-intl';
import MoneyField from '@commercetools-uikit/money-field';
import { type TCurrencyCode } from '@commercetools-uikit/money-input';
import { useEffect, useState } from 'react';
import Spacings from '@commercetools-uikit/spacings';
import TextField from '@commercetools-uikit/text-field';
import { useFormik, type FormikHelpers } from 'formik';
import {
  TAmountPerCountry,
  TPricingConstraintIdentifier,
  TAmountPerCurrency,
} from '../../../types';
import { ReactElement } from 'react';
import validate from './validate';

type Formik = ReturnType<typeof useFormik>;
type FormProps = {
  formElements: ReactElement;
  values: Formik['values'];
  isDirty: Formik['dirty'];
  isSubmitting: Formik['isSubmitting'];
  submitForm: Formik['handleSubmit'];
  handleReset: Formik['handleReset'];
  deleteItem: () => void;
  identifier?: TPricingConstraintIdentifier;
};
type TAvailabilityDetailsFormProps = {
  onSubmit: (
    value: TAmountPerCountry,
    formikHelpers: FormikHelpers<TAmountPerCountry>
  ) => void | Promise<unknown>;
  initialValues?: TAmountPerCountry;
  identifier?: TPricingConstraintIdentifier;
  // isReadOnly: boolean;
  // dataLocale: string;
  children: (formProps: FormProps) => JSX.Element;
};

const AvailabilityDetailsForm = (props: TAvailabilityDetailsFormProps) => {
  const intl = useIntl();
  const formik = useFormik<TAmountPerCountry>({
    initialValues: props.initialValues || ({} as TAmountPerCountry),
    onSubmit: props.onSubmit,
    validate,
    enableReinitialize: true,
  });

  const { projectCountries, projectCurrencies } = useApplicationContext(
    (context) => ({
      projectCountries: context.project?.countries ?? [],
      projectCurrencies: context.project?.currencies ?? ([] as string[]),
    })
  );

  const [selectedCountry, setSelectedCountry] = useState<string>(
    projectCountries[0]
  );
  const [selectedCurrency, setSelectedCurrency] = useState<TCurrencyCode>(
    projectCurrencies[0] as TCurrencyCode
  );
  const [countryOptions, setCountryOptions] = useState<
    { value: string; label: string }[]
  >(
    projectCountries.map((item) => ({
      value: item,
      label: item,
    })) ?? []
  );
  const [currencyOptions, setCurrencyOptions] = useState<
    { value: string; label: string }[]
  >(
    projectCurrencies.map((item) => ({
      value: item,
      label: item,
    })) ?? []
  );

  useEffect(() => {
    if (props.identifier?.countryCode && props.identifier?.currencyCode) {
      setSelectedCountry(props.identifier.countryCode);
      setSelectedCurrency(props.identifier.currencyCode as TCurrencyCode);
      setCountryOptions([
        {
          value: props.identifier.countryCode,
          label: props.identifier.countryCode,
        },
      ]);
      setCurrencyOptions([
        {
          value: props.identifier.currencyCode,
          label: props.identifier.currencyCode,
        },
      ]);
    } else {
      setCountryOptions(
        projectCountries.map((item) => ({
          value: item,
          label: item,
        })) ?? []
      );
      setCurrencyOptions(
        projectCurrencies.map((item) => ({
          value: item,
          label: item,
        })) ?? []
      );
    }
  }, [props.identifier]);

  const [countryHint, setCountryHint] = useState<boolean>(false);
  const [currencyHint, setCurrencyHint] = useState<boolean>(false);
  const [minAmountHint, setMinAmountHint] = useState<boolean>(false);
  const [maxAmountHint, setMaxAmountHint] = useState<boolean>(false);

  const handleOnDeleteItem = () => {
    const clonedObject: { [key: string]: TAmountPerCurrency } = Object.assign(
      {},
      formik.values
    );

    clonedObject[selectedCountry][selectedCurrency].minAmount = '';
    clonedObject[selectedCountry][selectedCurrency].maxAmount = '';

    formik.setValues(clonedObject);
  };

  const formElements = (
    <Spacings.Stack scale="l" alignItems="flex-start">
      <SelectField
        title={intl.formatMessage(messages.headerCountry)}
        name="country"
        onInfoButtonClick={() => {
          setCountryHint(!countryHint);
        }}
        hint={
          countryHint &&
          'Specification of the country for which the settings are to apply. \nPlease note that not all payment methods are available for all countries. You can find specifications in the mollie documentation.'
        }
        value={selectedCountry}
        onChange={(event) => {
          setSelectedCountry(event.target.value as string);
        }}
        options={countryOptions}
        horizontalConstraint={15}
        controlShouldRenderValue={true}
        isSearchable={false}
      ></SelectField>

      <SelectField
        title={intl.formatMessage(messages.headerCurrency)}
        name="currency"
        onInfoButtonClick={() => {
          setCurrencyHint(!currencyHint);
        }}
        hint={
          currencyHint &&
          'Specification of the currency for which the settings are to apply. Please note that not all payment methods are available for all currencies. You can find specifications in the mollie documentation.'
        }
        value={selectedCurrency}
        onChange={(event) => {
          setSelectedCurrency(event.target.value as TCurrencyCode);
        }}
        options={currencyOptions}
        horizontalConstraint={15}
        controlShouldRenderValue={true}
        isSearchable={false}
      ></SelectField>

      <MoneyField
        title={intl.formatMessage(messages.headerMinAmount)}
        name="minAmount"
        onInfoButtonClick={() => {
          setMinAmountHint(!minAmountHint);
        }}
        hint={
          minAmountHint &&
          'Specification of the minimum transaction amount that must be reached for this payment method, in order to be offered during checkout. Please note that the amount must be within the range specified by mollie. You can find more details in the mollie documentation.'
        }
        horizontalConstraint={15}
        currencies={
          currencyOptions.length === 1
            ? [currencyOptions[0].value]
            : projectCurrencies
        }
        value={{
          amount: formik.values[selectedCountry][selectedCurrency].minAmount,
          currencyCode: selectedCurrency,
        }}
        onChange={(event) => {
          const formikOnChangeEvent = {
            target: {
              name: `${selectedCountry}.${selectedCurrency}.minAmount`,
              value: event.target.value,
            },
          };
          formik.handleChange(formikOnChangeEvent);

          if (event.target.name === 'minAmount.currencyCode') {
            setSelectedCurrency(event.target.value as TCurrencyCode);
          }
        }}
        onBlur={() => {}}
      />

      <MoneyField
        title={intl.formatMessage(messages.headerMaxAmount)}
        name="maxAmount"
        onInfoButtonClick={() => {
          setMaxAmountHint(!maxAmountHint);
        }}
        hint={
          maxAmountHint &&
          'Specification of the maximum transaction amount that may not be exceeded for this payment type, in order to be offered during checkout. Please note that the amount must be within the range specified by mollie. You can find more details in the mollie documentation.'
        }
        horizontalConstraint={15}
        currencies={
          currencyOptions.length === 1
            ? [currencyOptions[0].value]
            : projectCurrencies
        }
        value={{
          amount: formik.values[selectedCountry][selectedCurrency].maxAmount,
          currencyCode: selectedCurrency,
        }}
        onChange={(event) => {
          const formikOnChangeEvent = {
            target: {
              name: `${selectedCountry}.${selectedCurrency}.maxAmount`,
              value: event.target.value,
            },
          };
          formik.handleChange(formikOnChangeEvent);

          if (event.target.name === 'maxAmount.currencyCode') {
            formik.handleChange(event);
            setSelectedCurrency(event.target.value as TCurrencyCode);
          }
        }}
        errors={
          TextField.toFieldErrors<TAmountPerCountry>(formik.errors).maxAmount
        }
        touched={{
          amount: true,
          currencyCode: true,
        }}
        renderError={(errorKey) => {
          if (errorKey === 'invalidValue') {
            return intl.formatMessage(messages.fieldMethodNameInvalidLength);
          }
          return null;
        }}
      />
    </Spacings.Stack>
  );

  return props.children({
    formElements,
    values: formik.values,
    isDirty: formik.dirty,
    isSubmitting: formik.isSubmitting,
    submitForm: formik.handleSubmit,
    handleReset: formik.handleReset,
    deleteItem: () => handleOnDeleteItem(),
    identifier: props?.identifier,
  });
};

export default AvailabilityDetailsForm;
