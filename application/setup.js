jest.mock('./src/constants', () => {
  return {
    entryPointUriPath: 'mollie',
    PERMISSIONS: {
      View: 'ViewMollie',
      Manage: 'TestMollie',
    },
    PROJECT_KEY: 'your-project-key',
    CLOUD_IDENTIFIER: 'gcp-eu',
    CUSTOM_APPLICATION_ID: '',
    APPLICATION_URL: 'http://localhost:3001',
    OBJECT_CONTAINER_NAME: 'sctm-app-methods',
    EXTENSION_KEY: 'sctm-payment-create-update-extension',
    EXTENSION_URL_PATH: '/processor',
    APPLICATION_URL_PATH: '/application/methods',
    USER_AGENT: {
      name: 'ShopmacherMollieCommercetoolsConnector/1.2.0',
      version: '1.2.0',
      libraryName: 'ShopmacherMollieCommercetoolsConnector/1.2.0',
      contactEmail: 'info@mollie.com',
    },
  };
});
