import { HttpDestination } from '@commercetools/platform-sdk';
import { createApiRoot } from '../client/create.client';
import { logger } from '../utils/logger.utils';
import CustomError from '../errors/custom.error';

const PAYMENT_EXTENSION_KEY = 'sctm-payment-create-update-extension';

export async function createPaymentExtension(applicationUrl: string): Promise<void> {
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

  if (extensions.length > 0) {
    const extension = extensions[0];

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

  await apiRoot
    .extensions()
    .post({
      body: {
        key: PAYMENT_EXTENSION_KEY,
        destination: {
          type: 'HTTP',
          url: applicationUrl,
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

export async function deletePaymentExtension(): Promise<void> {
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

  if (extensions.length > 0) {
    const extension = extensions[0];

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

export async function getExtensionUrlByKey(): Promise<string> {
  try {
    const { body: extension } = await createApiRoot()
      .extensions()
      .withKey({ key: PAYMENT_EXTENSION_KEY })
      .get()
      .execute();
    return (extension.destination as HttpDestination).url;
  } catch (error: any) {
    logger.error('Error in getExtensionUrlByKey', error);
    throw new CustomError(error.status, error.message);
  }
}
