jest.mock('./src/constants', () => {
  return {
    entryPointUriPath: 'mollie',
    PERMISSIONS: {
      View: 'ViewMollie',
      Manage: 'TestMollie',
    },
    projectKey: 'shopm-adv-dev',
  };
});
