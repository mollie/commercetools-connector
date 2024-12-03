import { readConfiguration } from '../utils/config.utils';
import fetch from 'node-fetch';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAccessToken = async (): Promise<any> => {
  const config = readConfiguration();

  const credentials = btoa(config.commerceTools.clientId + ':' + config.commerceTools.clientSecret);

  const headers = {
    Authorization: `Basic ${credentials}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${config.commerceTools.authUrl}/oauth/token?grant_type=client_credentials`, {
    headers: headers,
    method: 'POST',
    redirect: 'follow',
  });

  return await response.json();
};
