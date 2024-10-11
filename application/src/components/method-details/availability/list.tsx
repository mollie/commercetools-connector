import DataTable from "@commercetools-uikit/data-table";
import { useDataTableSortingState } from "@commercetools-uikit/hooks";
import { ReactElement, useMemo } from 'react';
import { useIntl } from "react-intl";
import messages from '../messages';
import { TMethodObjectValueFormValues } from "../../../types";
import { useFormik, type FormikHelpers } from 'formik';
import { TFetchCustomObjectDetailsQuery } from "../../../types/generated/ctp";
import { CustomMethodObject } from "../../../types/app";
import { CustomFormModalPage, PageContentFull, useModalState } from "@commercetools-frontend/application-components";
import PrimaryButton from '@commercetools-uikit/primary-button';
import { PlusThinIcon } from '@commercetools-uikit/icons';
import SpacingsInset from '@commercetools-uikit/spacings-inset';
import AvailabilityDetail from "./detail";

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
  paymentMethodDetails: TFetchCustomObjectDetailsQuery['customObject'];
};

const AvailabilityList = (props: TCustomObjectDetailsFormProps) => {
  const intl = useIntl();

  const paymentMethod = (props.paymentMethodDetails?.value as unknown as CustomMethodObject);

  const availabilityColumns = [
    {
      key: 'currency',
      label: intl.formatMessage(messages.headerCurrency),
      isSortable: true,
    },
    {
      key: 'minAmount',
      label: intl.formatMessage(messages.headerMinAmount),
    },
    {
      key: 'maxAmount',
      label: intl.formatMessage(messages.headerMaxAmount),
    },
    {
      key: 'country',
      label: intl.formatMessage(messages.headerCountry),
      isSortable: true,
    },
    {
      key: 'surchargeCost',
      label: intl.formatMessage(messages.headerSurchargeCost),
      isSortable: true,
    },
  ];

  const tableSorting = useDataTableSortingState({
    key: 'currency',
    order: 'asc',
  });

  const rows = useMemo(() => {
    const items = paymentMethod.pricingConstraints || [];

    if (!tableSorting) {
      return items;
    }

    return items.slice().sort((a, b) => {
      const sort = tableSorting.value;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((a as any)[sort.key] > (b as any)[sort.key]) {
        return sort.order === 'asc' ? 1 : -1;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((a as any)[sort.key] < (b as any)[sort.key]) {
        return sort.order === 'asc' ? -1 : 1;
      }

      return 0;
    })
  }, [tableSorting]);

  const formModalState = useModalState();

  console.log('formModalState log', formModalState);

  return (
    <PageContentFull>
      <SpacingsInset>
        <div style={{display: 'flex', marginBottom: '30px', justifyContent: 'end'}}>
          <PrimaryButton 
              iconLeft={<PlusThinIcon />}
              label="Add configuration"
              onClick={() => formModalState.openModal()}
              isDisabled={false}
          />
        </div>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <DataTable<NonNullable<any>>
          isCondensed
          verticalCellAlignment="center"
          columns={availabilityColumns}
          rows={rows}
          itemRenderer={(item, column) => {
            switch (column.key) {
              case 'currency':
                return item.currency ?? '';
              case 'maxAmount':
                return item.maxAmount;
              case 'minAmount':
                return item.minAmount;
              case 'country':
                return item.country ?? '';
              case 'surchargeCost':
                return item.surchargeCost ?? '';
              default:
                return null;
            }
          }}
          sortedBy={tableSorting.value.key}
          sortDirection={tableSorting.value.order}
          onSortChange={(column, direction) => {
            tableSorting.onChange(column, direction);
          }}
        />
        <CustomFormModalPage
          title={'Edit form test'}
          isOpen={formModalState.isModalOpen}
          onClose={formModalState.closeModal}
        >
          <AvailabilityDetail></AvailabilityDetail>
        </CustomFormModalPage>
      </SpacingsInset>
    </PageContentFull>
  );
}

AvailabilityList.displayName = 'AvailabilityList';
export default AvailabilityList;