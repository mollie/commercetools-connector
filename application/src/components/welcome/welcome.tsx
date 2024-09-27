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
import { TFetchCustomObjectsQuery } from '../../types/generated/ctp';
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
import { useCustomObjectDetailsRemover } from '../../hooks/use-custom-objects-connector/use-custom-objects-connector';
import { useExtensionDestinationFetcher } from '../../hooks/use-extensions-connector';
import { getErrorMessage } from '../../helpers';

const columns = [
  { key: 'description', label: 'Payment method' },
  {
    key: 'status',
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
  const customObjectRemover = useCustomObjectDetailsRemover();

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

  useEffect(() => {
    if (
      customObjectsPaginatedResult &&
      customObjectsPaginatedResult?.total === 0 &&
      extension?.destination?.url
    ) {
      usePaymentMethodsFetcher(extension.destination.url)
        .then((data) => {
          if (data && data.length > 0) {
            data.forEach(async (method) => {
              await customObjectUpdater.execute({
                container: OBJECT_CONTAINER_NAME,
                key: method.id,
                value: JSON.stringify(method),
              });
            });
          }
        })
        .catch((error) => console.error(error))
        .finally(() => {
          client.reFetchObservableQueries();
          setViewLoading(false);
        });
    }
    if (
      customObjectsPaginatedResult &&
      customObjectsPaginatedResult?.total > 0 &&
      extension?.destination?.url
    ) {
      usePaymentMethodsFetcher(extension?.destination?.url)
        .then((data) => {
          if (data && data?.length !== customObjectsPaginatedResult?.total) {
            const dontHaveCustomObject = data.filter(
              (datum: CustomMethodObject) =>
                !customObjectsPaginatedResult.results.some(
                  (customObject) => customObject.key === datum.id
                )
            );

            const hasDisabledCustomObject =
              customObjectsPaginatedResult.results.filter(
                (obj) => !data.some((datum) => obj.key === datum.id)
              );

            if (dontHaveCustomObject && dontHaveCustomObject.length > 0) {
              dontHaveCustomObject.forEach(async (method) => {
                await customObjectUpdater
                  .execute({
                    container: OBJECT_CONTAINER_NAME,
                    key: method.id,
                    value: JSON.stringify(method),
                  })
                  .then(() => {
                    client.reFetchObservableQueries();
                    setViewLoading(false);
                  });
              });
            }

            if (hasDisabledCustomObject && hasDisabledCustomObject.length > 0) {
              hasDisabledCustomObject.forEach(async (method) => {
                await customObjectRemover
                  .execute({
                    id: method.id,
                  })
                  .then(() => {
                    client.reFetchObservableQueries();
                    setViewLoading(false);
                  });
              });
            }
          } else {
            setViewLoading(false);
          }
        })
        .catch((error) => console.error(error));
    }
  }, [
    usePaymentMethodsFetcher,
    customObjectsPaginatedResult,
    customObjectsPaginatedResult?.total,
    extension?.destination?.url,
  ]);

  const MollieDataTable =
    !loading &&
    customObjectsPaginatedResult &&
    customObjectsPaginatedResult?.total > 0 ? (
      <Spacings.Stack scale="l">
        <DataTable<
          NonNullable<TFetchCustomObjectsQuery['customObjects']['results']>[0]
        >
          isCondensed
          verticalCellAlignment="center"
          columns={columns}
          rows={customObjectsPaginatedResult.results}
          itemRenderer={(item, column) => {
            switch (column.key) {
              case 'status':
                return (item.value as CustomMethodObject).status ? (
                  <CheckActiveIcon color="success"></CheckActiveIcon>
                ) : (
                  <CheckInactiveIcon color="surface"></CheckInactiveIcon>
                );
              case 'description':
                return item.value.description;
              case 'image':
                return (
                  <IconButton
                    style={{ cursor: 'pointer' }}
                    isDisabled={true}
                    icon={
                      <img
                        src={(item.value as CustomMethodObject).image.url}
                        width="40"
                        height="40"
                        alt={item.id}
                      />
                    }
                    label={item.id}
                  ></IconButton>
                );
              case 'order':
                return item.value.displayOrder ?? 0;
              default:
                return null;
            }
          }}
          sortedBy={tableSorting.value.key}
          sortDirection={tableSorting.value.order}
          onSortChange={tableSorting.onChange}
          onRowClick={(row) => {
            alert(
              `Detail view for ${
                (row.value as CustomMethodObject).description
              } is not implemented yet!`
            );
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
