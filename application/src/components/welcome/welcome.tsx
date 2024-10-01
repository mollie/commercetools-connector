import { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import { PageContentFull } from '@commercetools-frontend/application-components';
import {
  useDataTableSortingState,
  usePaginationState,
} from '@commercetools-uikit/hooks';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  useCustomObjectsFetcher,
  useCustomObjectDetailsUpdater,
} from '../../hooks/use-custom-objects-connector';
import { EXTENSION_KEY, OBJECT_CONTAINER_NAME } from '../../constants';
import DataTable from '@commercetools-uikit/data-table';
import IconButton from '@commercetools-uikit/icon-button';
import { usePaymentMethodsFetcher } from '../../hooks/use-mollie-connector';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { CustomMethodObject } from '../../types/app';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import Tootltip from '@commercetools-uikit/tooltip';
import {
  InfoIcon,
  CheckActiveIcon,
  CheckInactiveIcon,
} from '@commercetools-uikit/icons';
import { useExtensionDestinationFetcher } from '../../hooks/use-extensions-connector';
import { getErrorMessage } from '../../helpers';

const columns = [
  { key: 'description', label: 'Payment method' },
  {
    key: 'active',
    label: 'Active',
    headerIcon: (
      <Tootltip
        placement="right-start"
        title={messages.activeHeader.defaultMessage}
        children={
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon color="primary40" size="20"></InfoIcon>
          </span>
        }
      ></Tootltip>
    ),
  },
  { key: 'image', label: 'Icon' },
  { key: 'order', label: 'Display order' },
];

const Welcome = () => {
  const match = useRouteMatch();
  const context = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages,
  }));
  const customObjectUpdater = useCustomObjectDetailsUpdater();

  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({
    key: 'key',
    order: 'asc',
  });
  const { customObjectsPaginatedResult, error, loading, client } =
    useCustomObjectsFetcher({
      page,
      perPage,
      tableSorting,
      container: OBJECT_CONTAINER_NAME,
    });
  const { extension } = useExtensionDestinationFetcher(EXTENSION_KEY);
  const [viewLoading, setViewLoading] = useState<boolean>(true);
  const [methods, setMethods] = useState<CustomMethodObject[]>([]);

  useEffect(() => {
    if (
      extension?.destination?.url &&
      methods.length === 0 &&
      customObjectsPaginatedResult
    ) {
      usePaymentMethodsFetcher(extension.destination.url)
        .then((data) => {
          if (data && data.length > 0) {
            data.forEach(async (method) => {
              const shouldCreate = customObjectsPaginatedResult.results.every(
                (object) => {
                  return object.key !== method.id ? true : false;
                }
              );

              if (shouldCreate) {
                await customObjectUpdater.execute({
                  container: OBJECT_CONTAINER_NAME,
                  key: method.id,
                  value: JSON.stringify(method),
                });
                client.reFetchObservableQueries();
              }
            });
            setMethods(data);
          }
        })
        .catch((error) => console.error(error))
        .finally(() => setViewLoading(false));
    }
  }, [
    usePaymentMethodsFetcher,
    customObjectsPaginatedResult,
    customObjectsPaginatedResult?.total,
    extension?.destination?.url,
    setMethods,
    methods,
  ]);

  const MollieDataTable =
    !loading && methods && methods.length > 0 ? (
      <Spacings.Stack scale="l">
        <DataTable<NonNullable<CustomMethodObject>>
          isCondensed
          verticalCellAlignment="center"
          columns={columns}
          rows={methods}
          itemRenderer={(item, column) => {
            switch (column.key) {
              case 'active':
                return item.active ? (
                  <CheckActiveIcon color="success"></CheckActiveIcon>
                ) : (
                  <CheckInactiveIcon color="neutral60"></CheckInactiveIcon>
                );
              case 'description':
                return item.description;
              case 'image':
                return (
                  <IconButton
                    style={{ cursor: 'pointer' }}
                    isDisabled={true}
                    icon={
                      <img
                        src={item.imageUrl}
                        width="40"
                        height="40"
                        alt={item.id}
                      />
                    }
                    label={item.id}
                  ></IconButton>
                );
              case 'order':
                return item.displayOrder;
              default:
                return null;
            }
          }}
          sortedBy={tableSorting.value.key}
          sortDirection={tableSorting.value.order}
          onSortChange={tableSorting.onChange}
          onRowClick={(row) => {
            alert(`Detail view for ${row.description} is not implemented yet!`);
          }}
        />
      </Spacings.Stack>
    ) : (
      <ContentNotification
        type="info"
        intlMessage={messages.noData}
      ></ContentNotification>
    );

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  return (
    <Spacings.Stack scale="xl">
      <PageContentFull>
        <Spacings.Stack scale="xl">
          <Text.Headline as="h1" intlMessage={messages.title} />
        </Spacings.Stack>
      </PageContentFull>
      {viewLoading ? (
        <LoadingSpinner scale="l"></LoadingSpinner>
      ) : (
        MollieDataTable
      )}
    </Spacings.Stack>
  );
};
Welcome.displayName = 'Welcome';

export default Welcome;
