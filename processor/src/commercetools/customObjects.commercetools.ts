import { createApiRoot } from '../client/create.client';
import { CustomObject } from '@commercetools/platform-sdk';
import { CUSTOM_OBJECT_CONTAINER_NAME } from '../utils/constant.utils';
import { logger } from '../utils/logger.utils';
import CustomError from '../errors/custom.error';

export const getMethodConfigObjects = async (): Promise<CustomObject[]> => {
  try {
    logger.debug('getMethodConfigObjects - Get all custom objects holding payment methods validation info.');
    const apiRoot = createApiRoot();
    const {
      body: { results: methodObjects },
    } = await apiRoot
      .customObjects()
      .withContainer({
        container: CUSTOM_OBJECT_CONTAINER_NAME,
      })
      .get({
        queryArgs: {
          limit: 50,
        },
      })
      .execute();

    return methodObjects;
  } catch (error: unknown) {
    logger.error(
      'getMethodConfigObjects - Error while getting custom objects holding payment methods validation info.',
      error,
    );
  }

  return [];
};

export const getSingleMethodConfigObject = async (key: string): Promise<CustomObject> => {
  try {
    logger.debug('getMethodConfigObjects - Get all custom objects holding payment methods validation info.');
    const apiRoot = createApiRoot();
    const { body: methodObjects } = await apiRoot
      .customObjects()
      .withContainerAndKey({
        container: CUSTOM_OBJECT_CONTAINER_NAME,
        key,
      })
      .get()
      .execute();

    return methodObjects;
  } catch (error: unknown) {
    logger.error('getMethodConfigObjects - Error while getting custom object for payment method: ' + key, error);

    throw new CustomError(400, 'getMethodConfigObjects - Error while getting custom object for payment method: ' + key);
  }
};
