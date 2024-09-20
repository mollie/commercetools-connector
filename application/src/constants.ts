// Make sure to import the helper functions from the `ssr` entry point.
import { entryPointUriPathToPermissionKeys } from '@commercetools-frontend/application-shell/ssr';

export const entryPointUriPath = process.env.ENTRY_POINT_URI_PATH ?? '';

export const PERMISSIONS = entryPointUriPathToPermissionKeys(entryPointUriPath);

export const projectKey = process.env.PROJECT_KEY;
