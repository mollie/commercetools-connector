import { PERMISSIONS, entryPointUriPath } from './src/constants';

/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomApplication}
 */
const config = {
  name: 'Mollie',
  entryPointUriPath,
  cloudIdentifier: '${env:CLOUD_IDENTIFIER}',
  env: {
    development: {
      initialProjectKey: '${env:PROJECT_KEY}',
    },
    production: {
      applicationId: '${env:CUSTOM_APPLICATION_ID}',
      url: '${env:APPLICATION_URL}',
    },
  },
  oAuthScopes: {
    view: ['view_key_value_documents'],
    manage: ['manage_key_value_documents'],
  },
  icon: '${path:./assets/mollie.svg}',
  mainMenuLink: {
    defaultLabel: 'Mollie',
    labelAllLocales: [],
    permissions: [PERMISSIONS.View],
  },
};

export default config;
