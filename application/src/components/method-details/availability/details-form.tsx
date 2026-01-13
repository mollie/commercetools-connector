import React from 'react';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import SelectField from '@commercetools-uikit/select-field';
import messages from '../messages';
import { useIntl } from 'react-intl';
import MoneyField from '@commercetools-uikit/money-field';
import { type TCurrencyCode } from '@commercetools-uikit/money-input';
import { useEffect, useState, ReactElement } from 'react';
import Spacings from '@commercetools-uikit/spacings';
import TextField from '@commercetools-uikit/text-field';
import { useFormik, type FormikHelpers } from 'formik';
import {
  TAmountPerCountry,
  TPricingConstraintIdentifier,
  TAmountPerCurrency,
  TMethodObjectValueFormValues,
} from '../../../types';
import validate from './validate';
import FieldLabel from '@commercetools-uikit/field-label';
import NumberField from '@commercetools-uikit/number-field';
import { PlusThinIcon } from '@commercetools-uikit/icons';
import { convertCurrencyStringToNumber } from '../../../helpers';
import { ContentNotification } from '@commercetools-uikit/notifications';

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
  children: (formProps: FormProps) => JSX.Element;
  isSurchargeRestricted: boolean;
  currentMethod: TMethodObjectValueFormValues;
};

const AvailabilityDetailsForm = (props: TAvailabilityDetailsFormProps) => {
  const intl = useIntl();
  const formik = useFormik<TAmountPerCountry>({
    initialValues: props.initialValues || ({} as TAmountPerCountry),
    onSubmit: props.onSubmit,
    validate,
    enableReinitialize: true,
  });

  let surchargeRestrictionMessage = '';

  switch (props.currentMethod.id) {
    case 'klarna':
      surchargeRestrictionMessage = intl.formatMessage(
        messages.fieldSurchargeRestrictionNotificationKlarna
      );
      break;
    case 'in3':
      surchargeRestrictionMessage = intl.formatMessage(
        messages.fieldSurchargeRestrictionNotificationIn3
      );
      break;
    case 'alma':
      surchargeRestrictionMessage = intl.formatMessage(
        messages.fieldSurchargeRestrictionNotificationAlma
      );
      break;
    default:
      surchargeRestrictionMessage = '';
  }

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
  }, [projectCountries, projectCurrencies, props.identifier]);

  const [countryHint, setCountryHint] = useState<boolean>(false);
  const [currencyHint, setCurrencyHint] = useState<boolean>(false);
  const [minAmountHint, setMinAmountHint] = useState<boolean>(false);
  const [maxAmountHint, setMaxAmountHint] = useState<boolean>(false);
  const [surchargeCostHint, setSurchargeCostHint] = useState<boolean>(false);

  const handleOnDeleteItem = () => {
    const clonedObject: { [key: string]: TAmountPerCurrency } = Object.assign(
      {},
      formik.values
    );

    clonedObject[selectedCountry][selectedCurrency].minAmount = '';
    clonedObject[selectedCountry][selectedCurrency].maxAmount = '';
    clonedObject[selectedCountry][selectedCurrency].surchargeCost = {
      percentageAmount: 0,
      fixedAmount: '',
    };

    formik.setValues(clonedObject);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFormikOnChangeEvent = (event: any) => {
    let eventName = undefined;
    // let value = event.target.value;
    switch (event?.target?.name) {
      case 'minAmount.amount':
        eventName = `${selectedCountry}.${selectedCurrency}.minAmount`;
        break;

      case 'maxAmount.amount':
        eventName = `${selectedCountry}.${selectedCurrency}.maxAmount`;
        break;

      case 'surchargeCost.percentageAmount':
        eventName = `${selectedCountry}.${selectedCurrency}.surchargeCost.percentageAmount`;
        break;

      case 'surchargeCost.fixedAmount.amount':
        eventName = `${selectedCountry}.${selectedCurrency}.surchargeCost.fixedAmount`;
        break;

      default:
        break;
    }

    if (!eventName) {
      console.error('Invalid event', event);
    }

    return {
      target: {
        name: eventName,
        value: event.target.value,
      },
    };
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
        data-testid="select-country"
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
        data-testid="select-currency"
      ></SelectField>

      <MoneyField
        data-testid="money-field-minAmount"
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
          const formikOnChangeEvent = getFormikOnChangeEvent(event);
          formik.handleChange(formikOnChangeEvent);

          if (event.target.name === 'minAmount.currencyCode') {
            setSelectedCurrency(event.target.value as TCurrencyCode);
          }
        }}
      />

      <MoneyField
        data-testid="money-field-maxAmount"
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
          amount:
            formik.values[selectedCountry][selectedCurrency].maxAmount ?? '',
          currencyCode: selectedCurrency,
        }}
        onChange={(event) => {
          const formikOnChangeEvent = getFormikOnChangeEvent(event);
          formik.handleChange(formikOnChangeEvent);

          if (event.target.name === 'maxAmount.currencyCode') {
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
            return intl.formatMessage(messages.fieldMaxAmountInvalidValue);
          }
          return null;
        }}
      />

      <FieldLabel
        title={intl.formatMessage(messages.headerSurchargeCost)}
        onInfoButtonClick={() => {
          setSurchargeCostHint(!surchargeCostHint);
        }}
        hint={
          surchargeCostHint &&
          'If additional surcharge transaction costs are to be charged to the customer, these can be configured here. The default is 0.00. If additional fees are to be charged, please refer to the legal requirements for transparent communication with your customers.'
        }
      />

      {props.isSurchargeRestricted ? (
        <ContentNotification type="warning" data-testid="surcharge-restriction">
          {surchargeRestrictionMessage}
        </ContentNotification>
      ) : (
        <Spacings.Inline
          scale="xl"
          alignItems="center"
          justifyContent="space-around"
        >
          <span
            style={{
              fontSize: '20px',
              marginRight: '-20px',
            }}
          >
            %
          </span>
          <NumberField
            data-testid="money-field-surchargeCost--percentageAmount"
            name="surchargeCost.percentageAmount"
            title={''}
            value={
              formik.values[selectedCountry][selectedCurrency].surchargeCost
                .percentageAmount
            }
            horizontalConstraint={12}
            onChange={(event) => {
              const formikOnChangeEvent = getFormikOnChangeEvent(event);
              formik.handleChange(formikOnChangeEvent);
            }}
            onBlur={(event) => {
              const percentageAmountOnBlurEvent = {
                target: {
                  name: `${selectedCountry}.${selectedCurrency}.surchargeCost.percentageAmount`,
                  value:
                    Number(event.target.value) >= 0
                      ? Number(event.target.value)
                      : 0,
                },
              };

              formik.handleChange(percentageAmountOnBlurEvent);
            }}
          />

          <PlusThinIcon />

          <MoneyField
            data-testid="money-field-surchargeCost--fixedAmount"
            name="surchargeCost.fixedAmount"
            title={''}
            horizontalConstraint={14}
            currencies={
              currencyOptions.length === 1
                ? [currencyOptions[0].value]
                : projectCurrencies
            }
            value={{
              amount:
                formik.values[selectedCountry][selectedCurrency].surchargeCost
                  .fixedAmount,
              currencyCode: selectedCurrency,
            }}
            onChange={(event) => {
              const formikOnChangeEvent = getFormikOnChangeEvent(event);
              formik.handleChange(formikOnChangeEvent);

              if (
                event.target.name === 'surchargeCost.fixedAmount.currencyCode'
              ) {
                setSelectedCurrency(event.target.value as TCurrencyCode);
              }
            }}
            onBlur={(event) => {
              if (event.target.name === 'surchargeCost.fixedAmount.amount') {
                const convertedValue = convertCurrencyStringToNumber(
                  formik.values[selectedCountry][selectedCurrency].surchargeCost
                    .fixedAmount
                );
                const validatedValue =
                  convertedValue >= 0 ? convertedValue.toFixed(2) : '0';

                const fixedAmountOnBlurEvent = {
                  target: {
                    name: `${selectedCountry}.${selectedCurrency}.surchargeCost.fixedAmount`,
                    value: validatedValue,
                  },
                };

                formik.handleChange(fixedAmountOnBlurEvent);
              }
            }}
          />
        </Spacings.Inline>
      )}
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
