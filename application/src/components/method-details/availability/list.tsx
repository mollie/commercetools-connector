import DataTable from '@commercetools-uikit/data-table';
import { useDataTableSortingState } from '@commercetools-uikit/hooks';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import messages from '../messages';
import {
  TPricingConstraintIdentifier,
  TPricingConstraintItem,
} from '../../../types';
import { TFetchCustomObjectDetailsQuery } from '../../../types/generated/ctp';
import { CustomMethodObject } from '../../../types/app';
import {
  PageContentFull,
  useModalState,
} from '@commercetools-frontend/application-components';
import { PlusThinIcon } from '@commercetools-uikit/icons';
import SpacingsInset from '@commercetools-uikit/spacings-inset';
import AvailabilityDetails from './details';
import { type TCurrencyCode } from '@commercetools-uikit/money-input';
import SecondaryButton from '@commercetools-uikit/secondary-button';

type TCustomObjectDetailsFormProps = {
  paymentMethodDetails: TFetchCustomObjectDetailsQuery['customObject'];
};

const AvailabilityList = (props: TCustomObjectDetailsFormProps) => {
  const intl = useIntl();

  const formModalState = useModalState();

  const [identifier, setIdentifier] = useState(
    {} as TPricingConstraintIdentifier
  );

  const paymentMethod = props.paymentMethodDetails
    ?.value as unknown as CustomMethodObject;

  const availabilityColumns = [
    {
      key: 'currencyCode',
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
      key: 'countryCode',
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
    key: 'currencyCode',
    order: 'asc',
  });

  const rows: TPricingConstraintItem[] = useMemo(() => {
    const items = (paymentMethod.pricingConstraints || []).map(
      (item, index) => ({
        id: index + 1,
        ...item,
      })
    ) as TPricingConstraintItem[];

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
    });
  }, [paymentMethod, tableSorting]);

  const handleOnRowClick = (row: TPricingConstraintItem) => {
    setIdentifier({
      countryCode: row.countryCode,
      currencyCode: row.currencyCode as TCurrencyCode,
    });
    formModalState.openModal();
  };
  return (
    <PageContentFull>
      <SpacingsInset>
        <div
          style={{
            display: 'flex',
            marginBottom: '30px',
            justifyContent: 'end',
          }}
        >
          <SecondaryButton
            iconLeft={<PlusThinIcon />}
            label="Add configuration"
            onClick={() => {
              setIdentifier({} as TPricingConstraintIdentifier);
              formModalState.openModal();
            }}
            isDisabled={false}
            data-testid="availability-add-configuration-button"
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
              case 'currencyCode':
                return item.currencyCode ?? '';
              case 'maxAmount':
                return item?.maxAmount ?? '';
              case 'minAmount':
                return item.minAmount;
              case 'countryCode':
                return item.countryCode ?? '';
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
          onRowClick={(row: TPricingConstraintItem) => handleOnRowClick(row)}
        />
        <AvailabilityDetails
          method={props.paymentMethodDetails}
          identifier={identifier}
          formModalState={formModalState}
        ></AvailabilityDetails>
      </SpacingsInset>
    </PageContentFull>
  );
};

AvailabilityList.displayName = 'AvailabilityList';
export default AvailabilityList;
