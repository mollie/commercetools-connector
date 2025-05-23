import { useState, useEffect } from 'react';
import {
  buildApiUrl,
  executeHttpClientRequest,
  logger,
} from '@commercetools-frontend/application-shell-connectors';
import createHttpUserAgent from '@commercetools/http-user-agent';
import {
  USER_AGENT,
  EXTENSION_URL_PATH,
  APPLICATION_URL_PATH,
} from '../../constants';
import {
  MollieMethod,
  CustomMethodObject,
  MollieResult,
  SupportedPaymentMethods,
} from '../../types/app';

const config = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const convertMollieMethodToCustomMethod = (
  results: MollieResult,
  projectLanguages: string[]
): CustomMethodObject[] => {
  const methods = results['_embedded']['methods'];
  const availableMethods = methods.filter(
    (method: MollieMethod) =>
      method.status === 'activated' &&
      SupportedPaymentMethods[method.id as SupportedPaymentMethods]
  );
  return availableMethods.map((method: MollieMethod) => ({
    id: method.id,
    technicalName: method.description,
    name: projectLanguages.reduce((acc, lang) => {
      acc[lang] = method.description;
      return acc;
    }, {} as Record<string, string>),
    description: projectLanguages.reduce((acc, lang) => {
      acc[lang] = '';
      return acc;
    }, {} as Record<string, string>),
    imageUrl: method.image.svg || '',
    status: 'Inactive',
    displayOrder: 0,
  }));
};

const getMethods = async (projectLanguages: string[], targetUrl?: string) => {
  if (!targetUrl) {
    logger.error('usePaymentMethodsFetcher - No target URL provided');
    return [];
  }

  const userAgent = createHttpUserAgent(USER_AGENT);

  return await executeHttpClientRequest(
    async (options) => {
      const res = await fetch(buildApiUrl('/proxy/forward-to'), {
        ...options,
      });
      const data = res.json();
      return {
        data,
        statusCode: res.status,
        getHeader: (key) => res.headers.get(key),
      };
    },
    {
      userAgent,
      headers: config.headers,
      forwardToConfig: {
        uri: targetUrl.replace(EXTENSION_URL_PATH, APPLICATION_URL_PATH),
      },
    }
  )
    .then((res) =>
      convertMollieMethodToCustomMethod(
        res as unknown as MollieResult,
        projectLanguages
      )
    )
    .catch((error) => logger.error(error));
};

export const usePaymentMethodsFetcher = (
  url: string | undefined,
  projectLanguages: string[]
) => {
  const [fetchedData, setFetchedData] = useState<CustomMethodObject[]>([]);
  const [fetchedDataLoading, setFetchedDataLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = (await getMethods(projectLanguages, url)) ?? [];
      setFetchedData(data);
      setFetchedDataLoading(false);
    };

    if (url) {
      fetchData();
    }
  }, [url, projectLanguages]);

  return { fetchedData, fetchedDataLoading };
};
