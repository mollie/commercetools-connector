import { createApiRoot } from '../client/create.client';
import { CustomObject } from '@commercetools/platform-sdk';
import { CUSTOM_OBJECT_CONTAINER_NAME } from '../utils/constant.utils';
import { logger } from '../utils/logger.utils';

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
      .get()
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
