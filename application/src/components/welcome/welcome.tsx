import { useCallback, useEffect, useState } from 'react';
import { Switch, useHistory, useRouteMatch } from 'react-router-dom';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import { PageContentFull } from '@commercetools-frontend/application-components';
import {
  useDataTableSortingState,
  usePaginationState,
} from '@commercetools-uikit/hooks';
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
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import MethodDetails from '../method-details';

const columns = [
  { key: 'description', label: 'Payment method' },
  {
    key: 'status',
    label: 'Active',
    headerIcon: (
      <Tootltip
        placement="right-start"
        title={messages.activeHeader.defaultMessage}
      >
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <InfoIcon color="primary40" size="20"></InfoIcon>
        </span>
      </Tootltip>
    ),
  },
  { key: 'image', label: 'Icon' },
  { key: 'order', label: 'Display order' },
];

const Welcome = () => {
  const match = useRouteMatch();
  const { push } = useHistory();
  const customObjectUpdater = useCustomObjectDetailsUpdater();
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({
    key: 'key',
    order: 'asc',
  });
  const { customObjectsPaginatedResult, error, loading } =
    useCustomObjectsFetcher({
      page,
      perPage,
      tableSorting,
      container: OBJECT_CONTAINER_NAME,
    });
  const { extension } = useExtensionDestinationFetcher(EXTENSION_KEY);
  const [viewLoading, setViewLoading] = useState<boolean>(true);
  const [methods, setMethods] = useState<CustomMethodObject[]>([]);
  const [refresh, setRefresh] = useState<number>(0);

  const fetchedData = usePaymentMethodsFetcher(extension?.destination?.url);

  const handleRefresh = useCallback(() => {
    setRefresh((prev) => prev + 1);
  }, []);

  const FetchAndUpdateMethods = useCallback(async () => {
    if (fetchedData && fetchedData.length > 0) {
      const updatedMethods = await Promise.all(
        fetchedData.map(async (method) => {
          const shouldCreate = customObjectsPaginatedResult?.results.every(
            (object) => object.key !== method.id
          );

          if (shouldCreate) {
            await customObjectUpdater.execute({
              container: OBJECT_CONTAINER_NAME,
              key: method.id,
              value: JSON.stringify(method),
            });
            return method;
          } else {
            return customObjectsPaginatedResult?.results.find(
              (obj) => obj.key === method.id
            )?.value as CustomMethodObject;
          }
        })
      );
      setMethods(updatedMethods);
      setViewLoading(false);
    }
  }, [customObjectUpdater, customObjectsPaginatedResult?.results, fetchedData]);

  useEffect(() => {
    if (
      (extension?.destination?.url &&
        methods.length === 0 &&
        customObjectsPaginatedResult) ||
      (refresh > 0 && extension?.destination?.url)
    ) {
      setViewLoading(true);
      FetchAndUpdateMethods();
      setRefresh(0);
    }
  }, [
    extension,
    methods.length,
    customObjectsPaginatedResult,
    refresh,
    FetchAndUpdateMethods,
  ]);

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

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
              case 'status':
                return item.status === 'Active' ? (
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
            push(
              `${match.url}/${
                customObjectsPaginatedResult?.results.filter(
                  (obj) => obj.key === row.id
                )?.[0]?.id
              }`
            );
          }}
        />
        <Switch>
          <SuspendedRoute path={`${match.url}/:id`}>
            <MethodDetails
              onClose={() => {
                push(`${match.url}`);
                handleRefresh();
              }}
            />
          </SuspendedRoute>
        </Switch>
      </Spacings.Stack>
    ) : (
      <ContentNotification
        type="info"
        intlMessage={messages.noData}
      ></ContentNotification>
    );

  return (
    <Spacings.Stack scale="xl">
      <PageContentFull>
        <Spacings.Stack scale="xl">
          <Text.Headline data-cy="title" as="h1" intlMessage={messages.title} />
        </Spacings.Stack>
      </PageContentFull>
      {viewLoading ? (
        <LoadingSpinner data-cy="loading-spinner" scale="l"></LoadingSpinner>
      ) : (
        MollieDataTable
      )}
    </Spacings.Stack>
  );
};
Welcome.displayName = 'Welcome';

export default Welcome;
