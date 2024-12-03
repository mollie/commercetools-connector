import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import messages from '../messages';
import { useIntl } from 'react-intl';
import { useState, useCallback } from 'react';
import {
  DOMAINS,
  NO_VALUE_FALLBACK,
  NOTIFICATION_KINDS_SIDE,
} from '@commercetools-frontend/constants';
import { CustomFormModalPage } from '@commercetools-frontend/application-components';

import AvailabilityDetailsForm from './details-form';
import {
  TAmountPerCountry,
  TAmountPerCurrency,
  TAvailabilityAmount,
  TMethodObjectValueFormValues,
  TPricingConstraintIdentifier,
  TPricingConstraintItem,
} from '../../../types';
import { TFetchCustomObjectDetailsQuery } from '../../../types/generated/ctp';
import { convertCurrencyStringToNumber } from '../../../helpers';
import { useCustomObjectDetailsUpdater } from '../../../hooks/use-custom-objects-connector';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { formatLocalizedString } from '@commercetools-frontend/l10n';

type TAvailabilityDetailFormProps = {
  method: TFetchCustomObjectDetailsQuery['customObject'];
  identifier?: TPricingConstraintIdentifier;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formModalState: any;
};

const AvailabilityDetails = (props: TAvailabilityDetailFormProps) => {
  const intl = useIntl();

  const { projectCountries, projectCurrencies, dataLocale, projectLanguages } =
    useApplicationContext((context) => {
      return {
        projectCountries: context.project?.countries ?? [],
        projectCurrencies: context.project?.currencies ?? ([] as string[]),
        dataLocale: context.dataLocale ?? '',
        projectLanguages: context.project?.languages ?? [],
      };
    });

  const [amountPerCountry, setAmountPerCountry] = useState(
    projectCountries.reduce((obj: TAmountPerCountry, country: string) => {
      const amountPerCurrency = projectCurrencies.reduce(
        (obj: TAmountPerCurrency, currency: string) => {
          obj[currency] = {
            minAmount: '0',
            maxAmount: '',
            surchargeCost: {
              percentageAmount: 0,
              fixedAmount: '0',
            },
          };

          return obj;
        },
        {}
      );

      obj[country] = amountPerCurrency;

      return obj;
    }, {})
  );

  const existingPricingConstraints = (
    props.method?.value as unknown as TMethodObjectValueFormValues
  ).pricingConstraints?.reduce(
    (
      acc,
      { countryCode, currencyCode, minAmount, maxAmount, surchargeCost }
    ) => {
      // Initialize the country if it doesn't exist
      if (!acc[countryCode]) {
        acc[countryCode] = {};
      }

      // Set the currency object with min and max amount
      acc[countryCode][currencyCode] = {
        minAmount: minAmount.toString(),
        maxAmount: maxAmount?.toString(),
        surchargeCost: {
          percentageAmount: surchargeCost?.percentageAmount ?? 0,
          fixedAmount: surchargeCost?.fixedAmount.toString() ?? '0',
        },
      };

      return acc;
    },
    amountPerCountry
  );

  let detailsFormInitialValues;
  if (!existingPricingConstraints) {
    detailsFormInitialValues = amountPerCountry;
  } else {
    detailsFormInitialValues = Object.keys(amountPerCountry).reduce(
      (result: TAmountPerCountry, country) => {
        result[country] = Object.keys(amountPerCountry[country]).reduce(
          (currencyResult, currency: string) => {
            const initialValues = amountPerCountry[country][currency];
            const submittedValues = existingPricingConstraints[country][
              currency
            ] as TAvailabilityAmount;

            // Merge values, prioritizing submitted values if available
            currencyResult[currency] = {
              minAmount: submittedValues.minAmount ?? initialValues.maxAmount,
              maxAmount: submittedValues.maxAmount ?? initialValues.maxAmount,
              surchargeCost: {
                percentageAmount:
                  submittedValues?.surchargeCost?.percentageAmount ??
                  initialValues?.surchargeCost?.percentageAmount,
                fixedAmount:
                  submittedValues?.surchargeCost?.fixedAmount ??
                  initialValues?.surchargeCost?.fixedAmount,
              },
            };

            return currencyResult;
          },
          {} as TAmountPerCurrency
        );

        return result;
      },
      amountPerCountry
    );
  }

  const customObjectUpdater = useCustomObjectDetailsUpdater();
  const showNotification = useShowNotification();

  const generatePricingConstraints = (
    formikValues: TAmountPerCountry
  ): TPricingConstraintItem[] => {
    return Object.entries(formikValues).reduce(
      (constraints, [country, currencies]) => {
        Object.entries(currencies ?? {}).forEach(
          ([currency, { minAmount, maxAmount, surchargeCost }]) => {
            const nMinAmount = convertCurrencyStringToNumber(minAmount);
            const nMaxAmount = convertCurrencyStringToNumber(maxAmount ?? '');
            const nFixedAmount = convertCurrencyStringToNumber(
              surchargeCost.fixedAmount
            );

            if (
              nMinAmount === 0 &&
              nMaxAmount === 0 &&
              surchargeCost.percentageAmount === 0 &&
              nFixedAmount === 0
            )
              return;

            constraints.push({
              countryCode: country,
              currencyCode: currency,
              minAmount: nMinAmount,
              maxAmount: nMaxAmount > 0 ? nMaxAmount : undefined,
              surchargeCost: {
                percentageAmount: surchargeCost.percentageAmount,
                fixedAmount: nFixedAmount,
              },
            });
          }
        );

        return constraints;
      },
      [] as TPricingConstraintItem[]
    );
  };

  const handleSubmit = async (formikValues: TAmountPerCountry) => {
    let updateObject = Object.assign({}, props.method);

    const newPricingConstraints = generatePricingConstraints(formikValues);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let clonedValue: any = Object.assign({}, updateObject.value);
    clonedValue.pricingConstraints = newPricingConstraints;

    if (props.method?.container && props.method?.key && formikValues) {
      await customObjectUpdater.execute({
        container: props.method.container,
        key: props.method.key,
        value: JSON.stringify(clonedValue),
      });
      showNotification({
        kind: NOTIFICATION_KINDS_SIDE.success,
        domain: DOMAINS.SIDE,
        text: intl.formatMessage(messages.methodDetailsUpdated, {
          methodName: formatLocalizedString(
            {
              name: clonedValue.name,
            },
            {
              key: 'name',
              locale: dataLocale,
              fallbackOrder: projectLanguages,
              fallback: NO_VALUE_FALLBACK,
            }
          ),
        }),
      });
      props.formModalState.closeModal();
    }
  };

  const handleSubmitCallback = useCallback(handleSubmit, [
    props.method,
    props.formModalState,
    customObjectUpdater,
    showNotification,
    intl,
    dataLocale,
    projectLanguages,
  ]);

  return (
    <AvailabilityDetailsForm
      initialValues={detailsFormInitialValues as TAmountPerCountry}
      onSubmit={handleSubmitCallback}
      identifier={props?.identifier}
    >
      {(formProps) => {
        return (
          <CustomFormModalPage
            title={intl.formatMessage(messages.availabilityTitle)}
            isOpen={props.formModalState.isModalOpen}
            onClose={props.formModalState.closeModal}
            formControls={
              <>
                <CustomFormModalPage.FormSecondaryButton
                  label={CustomFormModalPage.Intl.revert}
                  onClick={formProps.handleReset}
                  isDisabled={!formProps.isDirty}
                  dataAttributes={{
                    'data-testid': 'availability-revert-button',
                  }}
                />
                <CustomFormModalPage.FormPrimaryButton
                  label={CustomFormModalPage.Intl.save}
                  onClick={() => formProps.submitForm()}
                  isDisabled={formProps.isSubmitting || !formProps.isDirty}
                  dataAttributes={{ 'data-testid': 'availability-save-button' }}
                />
                <CustomFormModalPage.FormDeleteButton
                  onClick={() => {
                    formProps.deleteItem();
                    formProps.submitForm();
                  }}
                  isDisabled={!props?.identifier?.countryCode}
                  dataAttributes={{
                    'data-testid': 'availability-delete-button',
                  }}
                />
              </>
            }
          >
            {formProps.formElements}
          </CustomFormModalPage>
        );
      }}
    </AvailabilityDetailsForm>
  );
};

export default AvailabilityDetails;
