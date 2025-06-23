import { createApiRoot } from '../client/create.client';
import { Extension } from '@commercetools/platform-sdk';
import { readConfiguration } from '../utils/config.utils';

export const PAYMENT_EXTENSION_KEY = 'sctm-payment-create-update-extension';

export async function createPaymentExtension(applicationUrl: string): Promise<void> {
  const apiRoot = createApiRoot();
  const { clientId, clientSecret } = readConfiguration().commerceTools;

  const extension = await getPaymentExtension();

  if (extension) {
    await deletePaymentExtension(extension);
  }

  const basicAuthToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  await apiRoot
    .extensions()
    .post({
      body: {
        key: PAYMENT_EXTENSION_KEY,
        destination: {
          type: 'HTTP',
          url: applicationUrl,
          authentication: {
            type: 'AuthorizationHeader',
            headerValue: `Basic ${basicAuthToken}`,
          },
        },
        triggers: [
          {
            resourceTypeId: 'payment',
            actions: ['Create', 'Update'],
          },
        ],
        timeoutInMs: 10000,
      },
    })
    .execute();
}

export async function getPaymentExtension(): Promise<Extension | null> {
  const apiRoot = createApiRoot();

  const {
    body: { results: extensions },
  } = await apiRoot
    .extensions()
    .get({
      queryArgs: {
        where: `key = "${PAYMENT_EXTENSION_KEY}"`,
      },
    })
    .execute();

  return extensions[0] || null;
}

export async function deletePaymentExtension(extension?: Extension | null): Promise<void> {
  const apiRoot = createApiRoot();

  if (!extension) {
    extension = await getPaymentExtension();
  }

  if (extension) {
    await apiRoot
      .extensions()
      .withKey({ key: PAYMENT_EXTENSION_KEY })
      .delete({
        queryArgs: {
          version: extension.version,
        },
      })
      .execute();
  }
}
