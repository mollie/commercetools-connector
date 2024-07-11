/**
 * Http Middleware Options
 *
 * @description
 * This file configures the HTTP Middleware which is used to set the host
 * for the HTTP requests made to the Commercetools platform.
 *
 * @returns {HttpMiddlewareOptions} - The HTTP Middleware Options
 */

import { type HttpMiddlewareOptions } from '@commercetools/sdk-client-v2'; // Required for sending HTTP requests
import { readConfiguration } from '../utils/config.utils';

export const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: `https://api.${readConfiguration().commerceTools.region}.commercetools.com`,
};
