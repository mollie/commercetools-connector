import { createApiRoot } from '../client/create.client';
import { Extension, HttpDestination } from '@commercetools/platform-sdk';
import { logger } from '../utils/logger.utils';

export const PAYMENT_EXTENSION_KEY = 'sctm-payment-create-update-extension';

export async function updatePaymentExtension(
  accessToken: string
): Promise<void> {
  const apiRoot = createApiRoot();

  const extension = await getPaymentExtension();

  if (!extension) {
    logger.info(
      'Could not find extension URL with key: ' + PAYMENT_EXTENSION_KEY
    );

    return;
  }

  await apiRoot
    .extensions()
    .withId({ ID: extension.id })
    .post({
      body: {
        version: extension.version,
        actions: [
          {
            action: 'changeDestination',
            destination: {
              type: 'HTTP',
              url: (extension.destination as HttpDestination).url,
              authentication: {
                type: 'AuthorizationHeader',
                headerValue: `Bearer ${accessToken}`,
              },
            },
          },
        ],
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
