// Make sure to import the helper functions from the `ssr` entry point.
import { entryPointUriPathToPermissionKeys } from '@commercetools-frontend/application-shell/ssr';

export const entryPointUriPath = process.env.ENTRY_POINT_URI_PATH ?? 'mollie';
export const PERMISSIONS = entryPointUriPathToPermissionKeys(entryPointUriPath);
export const CLOUD_IDENTIFIER = process.env.CLOUD_IDENTIFIER ?? 'gcp-eu';
export const CUSTOM_APPLICATION_ID = process.env.CUSTOM_APPLICATION_ID ?? '';
export const APPLICATION_URL =
  process.env.APPLICATION_URL ?? 'https://mollie.app';
export const OBJECT_CONTAINER_NAME = 'sctm-app-methods';
export const EXTENSION_KEY = 'sctm-payment-create-update-extension';
export const EXTENSION_URL_PATH = '/processor';
export const APPLICATION_URL_PATH = '/application/methods';
export const USER_AGENT = {
  name: 'ShopmacherMollieCommercetoolsConnector/1.4.2',
  version: '1.4.2',
  libraryName: 'ShopmacherMollieCommercetoolsConnector/1.4.2',
  contactEmail: 'info@mollie.com',
};
