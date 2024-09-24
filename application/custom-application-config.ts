import {
  PERMISSIONS,
  entryPointUriPath,
  cloudIdentifier,
  applicationId,
  applicationBaseUrl,
} from './src/constants';

/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomApplication}
 */
const config = {
  name: 'Mollie',
  entryPointUriPath,
  cloudIdentifier: cloudIdentifier,
  env: {
    development: {
      initialProjectKey: 'shopm-adv-dev',
    },
    production: {
      applicationId: applicationId,
      url: applicationBaseUrl,
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
  headers: {
    csp: {
      'connect-src': ['api.mollie.com'],
    },
  },
};

export default config;
