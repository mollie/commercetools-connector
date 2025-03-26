// Make sure to import the helper functions from the `ssr` entry point.
import { entryPointUriPathToPermissionKeys } from '@commercetools-frontend/application-shell/ssr';

declare global {
  interface Window {
    app?: {
      [key: string]: string;
      entryPointUriPath: string;
    };
  }
}

const getConfig = (processKey: string, windowKey: string) => {
  return typeof window === 'undefined'
    ? process.env[processKey]
    : window.app?.[windowKey];
};

export const entryPointUriPath =
  getConfig('ENTRY_POINT_URI_PATH', 'entryPointUriPath') ?? 'mollie';

export const PERMISSIONS = entryPointUriPathToPermissionKeys(entryPointUriPath);
export const CLOUD_IDENTIFIER =
  getConfig('CLOUD_IDENTIFIER', 'cloudIdentifier') ?? 'gcp-eu';
export const CUSTOM_APPLICATION_ID =
  getConfig('CUSTOM_APPLICATION_ID', 'customApplicationId') ?? '';
export const APPLICATION_URL =
  getConfig('APPLICATION_URL', 'applicationUrl') ?? 'https://your-app-url.com';

export const OBJECT_CONTAINER_NAME = 'sctm-app-methods';
export const EXTENSION_KEY = 'sctm-payment-create-update-extension';
export const EXTENSION_URL_PATH = '/processor';
export const APPLICATION_URL_PATH = '/application/methods';
export const USER_AGENT = {
  name: 'ShopmacherMollieCommercetoolsConnector/1.3.1',
  version: '1.3.1',
  libraryName: 'ShopmacherMollieCommercetoolsConnector/1.3.1',
  contactEmail: 'info@mollie.com',
};
