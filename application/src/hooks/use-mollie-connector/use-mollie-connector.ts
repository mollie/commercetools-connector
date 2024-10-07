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
} from '../../types/app';

/**
 * For local development using ngrok forwards the requests to the connector
 * please consider to add 'ngrok-skip-browser-warning': 'true' in your header config below
 * to bypass ERR_NGROK_6024
 */
const config = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const convertMollieMethodToCustomMethod = (
  results: MollieResult
): CustomMethodObject[] => {
  const methods = results['_embedded']['methods'];
  const availableMethods = methods.filter(
    (method: MollieMethod) => method.status === 'activated'
  );
  return availableMethods.map((method: MollieMethod) => ({
    id: method.id,
    description: method.description,
    imageUrl: method.image.svg,
    status: 'Inactive',
    displayOrder: 0,
  }));
};

const getMethods = async (targetUrl?: string) => {
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
      convertMollieMethodToCustomMethod(res as unknown as MollieResult)
    )
    .catch((error) => logger.error(error));
};

export const usePaymentMethodsFetcher = (url: string | undefined) => {
  const [fetchedData, setFetchedData] = useState<CustomMethodObject[]>([]);
  const [fetchedDataLoading, setFetchedDataLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = (await getMethods(url)) ?? [];
      setFetchedData(data);
      setFetchedDataLoading(false);
    };

    if (url) {
      fetchData();
    }
  }, [url]);

  return { fetchedData, fetchedDataLoading };
};
