/// <reference path="../../../@types/commercetools__sync-actions/index.d.ts" />
/// <reference path="../../../@types-extensions/graphql-ctp/index.d.ts" />

import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
// import { createSyncCustomObjects } from '@commercetools/sync-actions';
import type { TDataTableSortingState } from '@commercetools-uikit/hooks';
import type {
  TFetchCustomObjectsQuery,
  TFetchCustomObjectsQueryVariables,
} from '../../types/generated/ctp';
import FetchCustomObjectsQuery from './fetch-custom-objects.ctp.graphql';
import { ApolloError } from '@apollo/client';

// const syncCustomObjects = createSyncCustomObjects();

type PaginationAndSortingProps = {
  page: { value: number };
  perPage: { value: number };
  tableSorting: TDataTableSortingState;
};

type TUseCustomObjectsFetcher = (
  paginationAndSortingProps: PaginationAndSortingProps
) => {
  customObjectsPaginatedResult?: TFetchCustomObjectsQuery['customObjects'];
  error?: ApolloError;
  loading: boolean;
};

export const useCustomObjectsFetcher: TUseCustomObjectsFetcher = ({
  page,
  perPage,
  tableSorting,
}) => {
  const { data, error, loading } = useMcQuery<
    TFetchCustomObjectsQuery,
    TFetchCustomObjectsQueryVariables
  >(FetchCustomObjectsQuery, {
    variables: {
      limit: perPage.value,
      offset: (page.value - 1) * perPage.value,
      sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
      container: 'sctm-test',
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    customObjectsPaginatedResult: data?.customObjects,
    error,
    loading,
  };
};
