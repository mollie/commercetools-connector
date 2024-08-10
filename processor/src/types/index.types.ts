export type Message = {
  code: string;
  message: string;
  referencedBy: string;
};

export type ValidatorCreator = (
  path: string[],
  message: Message,
  overrideConfig?: object,
) => [string[], [[(o: object) => boolean, string, [object]]]];

export type ValidatorFunction = (o: object) => boolean;

export type Wrapper = (validator: ValidatorFunction) => (value: object) => boolean;

export type ConnectorEnvVars = {
  commerceTools: {
    clientId: string;
    clientSecret: string;
    projectKey: string;
    scope: string;
    region: string;
  };
  mollie: {
    testApiKey: string;
    liveApiKey: string;
    mode: string;
    profileId: string;
    debug: string;
    cardComponent: string;
    bankTransferDueDate: string;
  };
};
