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
import { MollieMethod, CustomMethodObject } from '../../types/app';

// TODO should check these harcode value
const config = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export const usePaymentMethodsFetcher = async (targetUrl: string) => {
  const userAgent = createHttpUserAgent(USER_AGENT);

  return await executeHttpClientRequest(
    async (options) => {
      const res = await fetch(buildApiUrl('/proxy/forward-to'), {
        method: 'POST',
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
    .then((res) => convertMollieMethodToCustomObject(res))
    .catch((error) => logger.error(error));
};

const convertMollieMethodToCustomObject = (
  methods: any
): CustomMethodObject[] => {
  return methods.map((method: MollieMethod) => ({
    id: method.id,
    description: method.description,
    minimumAmount: method.minimumAmount,
    maximumAmount: method.maximumAmount,
    pricing: method.pricing,
    image: {
      url: method.image.svg,
    },
    status: method.status === 'activated' ? true : false,
    displayOrder: undefined,
  }));
};
