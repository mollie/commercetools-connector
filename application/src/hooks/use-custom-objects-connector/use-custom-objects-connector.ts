/// <reference path="../../../@types/commercetools__sync-actions/index.d.ts" />
/// <reference path="../../../@types-extensions/graphql-ctp/index.d.ts" />

import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import type { TDataTableSortingState } from '@commercetools-uikit/hooks';
import type {
  TFetchCustomObjectsQuery,
  TFetchCustomObjectsQueryVariables,
  TFetchCustomObjectDetailsQueryVariables,
  TFetchCustomObjectDetailsQuery,
  TUpdateCustomObjectDetailsMutation,
  TUpdateCustomObjectDetailsMutationVariables,
  TRemoveCustomObjectDetailsMutation,
  TRemoveCustomObjectDetailsMutationVariables,
} from '../../types/generated/ctp';
import FetchCustomObjectsQuery from './fetch-custom-objects.ctp.graphql';
import FetchCustomObjectDetailsQuery from './fetch-custom-object-details.ctp.graphql';
import UpdateCustomObjectDetailsMutation from './update-custom-object-details.ctp.graphql';
import RemoveCustomObjectDetailsMutation from './remove-custom-object-details.ctp.graphql';
import { ApolloError } from '@apollo/client';
import { extractErrorFromGraphQlResponse } from '../../helpers';

type PaginationAndSortingProps = {
  page: { value: number };
  perPage: { value: number };
  tableSorting: TDataTableSortingState;
  container: string;
};

type TUseCustomObjectsFetcher = (
  paginationAndSortingProps: PaginationAndSortingProps
) => {
  customObjectsPaginatedResult?: TFetchCustomObjectsQuery['customObjects'];
  error?: ApolloError;
  loading: boolean;
  client: any;
};

export const useCustomObjectsFetcher: TUseCustomObjectsFetcher = ({
  page,
  perPage,
  tableSorting,
  container,
}) => {
  const { data, error, loading, client } = useMcQuery<
    TFetchCustomObjectsQuery,
    TFetchCustomObjectsQueryVariables
  >(FetchCustomObjectsQuery, {
    variables: {
      limit: perPage.value,
      offset: (page.value - 1) * perPage.value,
      sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
      container: container,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    customObjectsPaginatedResult: data?.customObjects,
    error,
    loading,
    client,
  };
};
type TUseCustomObjectDetailsFetcher = (id: string) => {
  customObject?: TFetchCustomObjectDetailsQuery['customObject'];
  error?: ApolloError;
  loading: boolean;
};

export const useCustomObjectDetailsFetcher: TUseCustomObjectDetailsFetcher = (
  id
) => {
  const { data, error, loading } = useMcQuery<
    TFetchCustomObjectDetailsQuery,
    TFetchCustomObjectDetailsQueryVariables
  >(FetchCustomObjectDetailsQuery, {
    variables: {
      id,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    customObject: data?.customObject,
    error,
    loading,
  };
};

export const useCustomObjectDetailsUpdater = () => {
  const [updateCustomObjectDetails, { loading }] = useMcMutation<
    TUpdateCustomObjectDetailsMutation,
    TUpdateCustomObjectDetailsMutationVariables
  >(UpdateCustomObjectDetailsMutation);

  const execute = async ({
    container,
    key,
    value,
  }: {
    container: string;
    key: string;
    value: any;
  }) => {
    try {
      return await updateCustomObjectDetails({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          container: container,
          key: key,
          value: value,
        },
      });
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};

export const useCustomObjectDetailsRemover = () => {
  const [removeCustomObjectDetails, { loading }] = useMcMutation<
    TRemoveCustomObjectDetailsMutation,
    TRemoveCustomObjectDetailsMutationVariables
  >(RemoveCustomObjectDetailsMutation);

  const execute = async ({ id }: { id: string }) => {
    try {
      return await removeCustomObjectDetails({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          id: id,
        },
      });
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};
