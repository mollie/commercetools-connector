/// <reference path="../../../@types/commercetools__sync-actions/index.d.ts" />
/// <reference path="../../../@types-extensions/graphql-ctp/index.d.ts" />

import { useMcQuery } from '@commercetools-frontend/application-shell-connectors';
import {
  TFetchExtensionDestinationQuery,
  TFetchExtensionDestinationQueryVariables,
} from '../../types/generated/ctp';
import FetchExtensionDestinationQuery from './fetch-extension-destination.ctp.graphql';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { ApolloError } from '@apollo/client';

type TUseExtensionDestinationFetcher = (key: string) => {
  extension?: TFetchExtensionDestinationQuery['extension'];
  error?: ApolloError;
  loading: boolean;
};

export const useExtensionDestinationFetcher: TUseExtensionDestinationFetcher = (
  key
) => {
  const { data, error, loading } = useMcQuery<
    TFetchExtensionDestinationQuery,
    TFetchExtensionDestinationQueryVariables
  >(FetchExtensionDestinationQuery, {
    variables: {
      key,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    extension: data?.extension,
    error,
    loading,
  };
};
