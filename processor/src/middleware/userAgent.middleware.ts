/**
 * User Agent Middleware Options
 *
 * @description
 * This file configures the User Agent Middleware which is used to identify the SDK
 * client in HTTP requests made to the Commercetools platform.
 * This is important for the Commercetools platform team to understand how our
 * customers are using the platform, and to assist with any issues that may arise.
 *
 * @returns {UserAgentMiddlewareOptions} - The User Agent Middleware Options
 */

import { type UserAgentMiddlewareOptions } from '@commercetools/sdk-client-v2';
import { LIBRARY_NAME, LIBRARY_VERSION } from '../utils/constant.utils';

export const userAgentMiddlewareOptions: UserAgentMiddlewareOptions = {
  libraryName: LIBRARY_NAME,
  libraryVersion: LIBRARY_VERSION,
};
