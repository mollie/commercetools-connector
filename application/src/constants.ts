// Make sure to import the helper functions from the `ssr` entry point.
import { entryPointUriPathToPermissionKeys } from '@commercetools-frontend/application-shell/ssr';

export const entryPointUriPath = process.env.ENTRY_POINT_URI_PATH ?? 'mollie';

export const PERMISSIONS = entryPointUriPathToPermissionKeys(entryPointUriPath);

export const cloudIdentifier = process.env.CLOUD_IDENTIFIER ?? 'gcp-eu';

export const applicationId = process.env.CUSTOM_APPLICATION_ID ?? '';

export const applicationBaseUrl =
  process.env.APPLICATION_URL ?? 'https://mollie.app';
