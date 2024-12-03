import {
  getMethodConfigObjects,
  getSingleMethodConfigObject,
} from './../../src/commercetools/customObjects.commercetools';
import { afterEach, describe, expect, jest, it } from '@jest/globals';
import { CustomObject } from '@commercetools/platform-sdk';
import { createApiRoot } from '../../src/client/create.client';
import { logger } from '../../src/utils/logger.utils';
import CustomError from '../../src/errors/custom.error';
import { CUSTOM_OBJECT_CONTAINER_NAME } from '../../src/utils/constant.utils';

jest.mock('../../src/client/create.client', () => ({
  createApiRoot: jest.fn(),
}));

describe('Test getMethodConfigObjects', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a list of custom objects', async () => {
    const mockWithContainer = jest.fn();
    const mockGet = jest.fn();
    const customObjects = [
      {
        id: '123',
        name: '123',
      },
      {
        id: 'test',
        name: 'test',
      },
    ] as unknown as CustomObject[];

    (createApiRoot as jest.Mock).mockReturnValue({
      customObjects: jest.fn().mockReturnValue({
        withContainer: mockWithContainer,
      }),
    });

    mockWithContainer.mockReturnValue({
      get: mockGet,
    });

    mockGet.mockReturnValue({
      execute: jest.fn().mockReturnValue({
        body: {
          results: customObjects,
        },
      }),
    });

    const result = await getMethodConfigObjects();
    expect(mockWithContainer).toHaveBeenCalledTimes(1);
    expect(mockWithContainer).toHaveBeenCalledWith({ container: CUSTOM_OBJECT_CONTAINER_NAME });
    expect(mockGet).toBeCalledTimes(1);
    expect(result).toBe(customObjects);
  });

  it('should throw error', async () => {
    const error = new Error('dummy error');

    (createApiRoot as jest.Mock).mockReturnValue({
      customObjects: jest.fn().mockImplementation(() => {
        throw error;
      }),
    });

    try {
      await getMethodConfigObjects();
    } catch (error: any) {
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        'getMethodConfigObjects - Error while getting custom objects holding payment methods validation info.',
        error,
      );
    }
  });
});

describe('Test getSingleMethodConfigObject', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return one custom object', async () => {
    const mockWithContainerAndKey = jest.fn();
    const mockGet = jest.fn();
    const key = 'test';

    const customObject = {
      id: '123',
      key,
      name: '123',
    } as unknown as CustomObject[];

    (createApiRoot as jest.Mock).mockReturnValue({
      customObjects: jest.fn().mockReturnValue({
        withContainerAndKey: mockWithContainerAndKey,
      }),
    });

    mockWithContainerAndKey.mockReturnValue({
      get: mockGet,
    });

    mockGet.mockReturnValue({
      execute: jest.fn().mockReturnValue({
        body: customObject,
      }),
    });

    const result = await getSingleMethodConfigObject(key);
    expect(mockWithContainerAndKey).toHaveBeenCalledTimes(1);
    expect(mockWithContainerAndKey).toHaveBeenCalledWith({ container: CUSTOM_OBJECT_CONTAINER_NAME, key });
    expect(mockGet).toBeCalledTimes(1);
    expect(result).toBe(customObject);
  });

  it('should throw error', async () => {
    const key = 'test';

    const mockError = new Error('dummy error');

    (createApiRoot as jest.Mock).mockReturnValue({
      customObjects: jest.fn().mockImplementation(() => {
        throw mockError;
      }),
    });

    try {
      await getSingleMethodConfigObject(key);
    } catch (error: any) {
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toBeCalledWith(
        'getMethodConfigObjects - Error while getting custom object for payment method: ' + key,
        mockError,
      );

      expect(error).toBeInstanceOf(CustomError);
    }
  });
});
