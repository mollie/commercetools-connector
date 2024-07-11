/**
 * Auth Middleware Options
 *
 * @description
 * This file configures the Auth Middleware which is used to authenticate
 * requests to the Commercetools platform.
 *
 * @returns {AuthMiddlewareOptions} - The Auth Middleware Options
 */
import { type AuthMiddlewareOptions } from '@commercetools/sdk-client-v2';
import { readConfiguration } from '../utils/config.utils';

export const authMiddlewareOptions: AuthMiddlewareOptions = {
  host: `https://auth.${readConfiguration().commerceTools.region}.commercetools.com`,
  projectKey: readConfiguration().commerceTools.projectKey,
  credentials: {
    clientId: readConfiguration().commerceTools.clientId,
    clientSecret: readConfiguration().commerceTools.clientSecret,
  },
  scopes: [readConfiguration().commerceTools.scope ? (readConfiguration().commerceTools.scope as string) : 'default'],
};
