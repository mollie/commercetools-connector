import {
  PERMISSIONS,
  entryPointUriPath,
  CLOUD_IDENTIFIER,
  CUSTOM_APPLICATION_ID,
  APPLICATION_URL,
} from './src/constants';

/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomApplication}
 */
const config = {
  name: 'Mollie',
  entryPointUriPath,
  cloudIdentifier: CLOUD_IDENTIFIER,
  env: {
    development: {
      initialProjectKey: 'your_project_key',
    },
    production: {
      applicationId: CUSTOM_APPLICATION_ID,
      url: APPLICATION_URL,
    },
  },
  oAuthScopes: {
    view: ['view_key_value_documents'],
    manage: ['manage_key_value_documents', 'manage_extensions'],
  },
  icon: '${path:./assets/mollie.svg}',
  mainMenuLink: {
    defaultLabel: 'Mollie',
    labelAllLocales: [],
    permissions: [PERMISSIONS.Manage],
  },
};

export default config;
