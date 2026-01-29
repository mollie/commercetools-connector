import { afterEach, describe, expect, jest } from '@jest/globals';
import { createApiRoot } from '../../src/client/create.client';
import {
  createCustomPaymentType,
  checkIfCustomTypeExistsByKey,
  createType,
  updateType,
} from '../../src/commercetools/customFields.commercetools';
import { Type, FieldDefinition } from '@commercetools/platform-sdk';
import { CustomFields } from '../../src/utils/constant.utils';

jest.mock('../../src/client/create.client', () => ({
  createApiRoot: jest.fn(),
}));

describe('Test customFields.commercetools.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.CTP_PAYMENT_CUSTOM_TYPE_KEY;
  });

  const mockType: Type = {
    id: 'mock-id',
    key: 'sctm-payment-custom-type',
    version: 1,
    createdAt: '2021-10-01T00:00:00.000Z',
    lastModifiedAt: '2021-10-01T00:00:00.000Z',
    name: {
      en: 'Test Type',
      de: 'Test Typ',
    },
    resourceTypeIds: ['payment'],
    fieldDefinitions: [],
  };

  const setupMocks = (types: Type[] | null) => {
    let withKeyGetMock: any;

    if (types) {
      withKeyGetMock = jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue({ body: types[0] || types } as never),
      });
    } else {
      withKeyGetMock = jest.fn().mockReturnValue({
        execute: jest.fn().mockRejectedValue({ code: 404, statusCode: 404 } as never),
      });
    }

    const withKeyPostMock = jest.fn().mockReturnValue({
      execute: jest.fn(),
    });

    const withKey = jest.fn().mockReturnValue({
      get: withKeyGetMock,
      post: withKeyPostMock,
    });

    const typesPostMock = jest.fn().mockReturnValue({
      execute: jest.fn(),
    });

    (createApiRoot as jest.Mock).mockReturnValue({
      types: jest.fn().mockReturnValue({
        withKey,
        post: typesPostMock,
      }),
    });

    return { withKey, withKeyPostMock, withKeyGetMock, typesPostMock };
  };

  it('CustomFields.payment.defaultCustomTypeKey should be string and is correct value', () => {
    expect(typeof CustomFields.payment.defaultCustomTypeKey).toBe('string');
    expect(CustomFields.payment.defaultCustomTypeKey).toBe('sctm-payment-custom-type');
  });

  it('createCustomPaymentType should create new type when none exists', async () => {
    const { withKey, typesPostMock } = setupMocks(null);

    await createCustomPaymentType();

    expect(withKey).toHaveBeenCalledWith({ key: CustomFields.payment.defaultCustomTypeKey });
    expect(typesPostMock).toHaveBeenCalled();
  });

  it('createCustomPaymentType should use default key when env var is not set', async () => {
    const { withKey } = setupMocks(null);

    await createCustomPaymentType();

    expect(withKey).toHaveBeenCalledWith({ key: CustomFields.payment.defaultCustomTypeKey });
  });

  it('createCustomPaymentType should use custom key from env var', async () => {
    process.env.CTP_PAYMENT_CUSTOM_TYPE_KEY = 'my-custom-payment-type';
    const { withKey } = setupMocks(null);

    await createCustomPaymentType();

    expect(withKey).toHaveBeenCalledWith({ key: 'my-custom-payment-type' });
  });

  it('createCustomPaymentType should add missing fields to existing type', async () => {
    const typeWithSomeFields: Type = {
      ...mockType,
      fieldDefinitions: [
        {
          name: CustomFields.payment.profileId,
          label: { en: 'Profile ID', de: 'Profil-ID' },
          type: { name: 'String' },
          required: false,
          inputHint: 'MultiLine',
        },
      ],
    };

    const { withKey, withKeyPostMock } = setupMocks([typeWithSomeFields]);

    await createCustomPaymentType();

    expect(withKey).toHaveBeenCalledTimes(2); // Once for check, once for update
    expect(withKeyPostMock).toHaveBeenCalledTimes(1);
    expect(withKeyPostMock).toHaveBeenCalledWith({
      body: {
        version: 1,
        actions: expect.arrayContaining([
          {
            action: 'addFieldDefinition',
            fieldDefinition: expect.objectContaining({
              name: CustomFields.payment.request,
            }),
          },
        ]),
      },
    });
  });

  it('createCustomPaymentType should not add fields when all already exist', async () => {
    const typeWithAllFields: Type = {
      ...mockType,
      fieldDefinitions: [
        {
          name: CustomFields.payment.profileId,
          label: { en: 'Profile ID', de: 'Profil-ID' },
          type: { name: 'String' },
          required: false,
          inputHint: 'MultiLine',
        },
        {
          name: CustomFields.payment.request,
          label: { en: 'Request', de: 'Anfrage' },
          type: { name: 'String' },
          required: false,
          inputHint: 'MultiLine',
        },
        {
          name: CustomFields.payment.response,
          label: { en: 'Response', de: 'Antwort' },
          type: { name: 'String' },
          required: false,
          inputHint: 'MultiLine',
        },
        {
          name: CustomFields.createPayment.request,
          label: { en: 'Create Request', de: 'Erstellungsanfrage' },
          type: { name: 'String' },
          required: false,
          inputHint: 'MultiLine',
        },
        {
          name: CustomFields.applePay.session.request,
          label: { en: 'Apple Pay Request', de: 'Apple Pay Anfrage' },
          type: { name: 'String' },
          required: false,
          inputHint: 'MultiLine',
        },
        {
          name: CustomFields.applePay.session.response,
          label: { en: 'Apple Pay Response', de: 'Apple Pay Antwort' },
          type: { name: 'String' },
          required: false,
          inputHint: 'MultiLine',
        },
      ],
    };

    const { withKeyPostMock } = setupMocks([typeWithAllFields]);

    await createCustomPaymentType();

    expect(withKeyPostMock).not.toHaveBeenCalled();
  });

  it('createCustomPaymentType should use default key when env var is empty', async () => {
    process.env.CTP_PAYMENT_CUSTOM_TYPE_KEY = '';
    const { withKey } = setupMocks(null);

    await createCustomPaymentType();

    expect(withKey).toHaveBeenCalledWith({ key: CustomFields.payment.defaultCustomTypeKey });
  });

  // ==========================================================================
  // Tests for helper functions
  // ==========================================================================

  describe('checkIfCustomTypeExistsByKey', () => {
    it('should return type when it exists', async () => {
      const { withKey } = setupMocks([mockType]);

      const result = await checkIfCustomTypeExistsByKey('sctm-payment-custom-type');

      expect(withKey).toHaveBeenCalledWith({ key: 'sctm-payment-custom-type' });
      expect(result).toEqual(mockType);
    });

    it('should return null when type does not exist', async () => {
      const withKeyGetMock = jest.fn().mockReturnValue({
        execute: jest.fn().mockRejectedValue({ code: 404 } as never),
      });

      const withKey = jest.fn().mockReturnValue({
        get: withKeyGetMock,
      });

      (createApiRoot as jest.Mock).mockReturnValue({
        types: jest.fn().mockReturnValue({
          withKey,
        }),
      });

      const result = await checkIfCustomTypeExistsByKey('non-existent-key');

      expect(result).toBeNull();
    });
  });

  describe('createType', () => {
    it('should create type with correct parameters', async () => {
      const typesPostMock = jest.fn().mockReturnValue({
        execute: jest.fn(),
      });

      (createApiRoot as jest.Mock).mockReturnValue({
        types: jest.fn().mockReturnValue({
          post: typesPostMock,
        }),
      });

      await createType('test-key', { en: 'Test Name', de: 'Test Name DE' }, ['payment'], []);

      expect(typesPostMock).toHaveBeenCalledWith({
        body: {
          key: 'test-key',
          name: { en: 'Test Name', de: 'Test Name DE' },
          resourceTypeIds: ['payment'],
          fieldDefinitions: [],
        },
      });
    });
  });

  describe('updateType', () => {
    it('should add only missing fields by default', async () => {
      const typeWithSomeFields: Type = {
        ...mockType,
        fieldDefinitions: [
          {
            name: 'existing-field',
            label: { en: 'Existing', de: 'Existiert' },
            type: { name: 'String' },
            required: false,
            inputHint: 'SingleLine',
          },
        ],
      };

      const { withKeyPostMock } = setupMocks([typeWithSomeFields]);

      const newFields: FieldDefinition[] = [
        {
          name: 'existing-field',
          label: { en: 'Existing', de: 'Existiert' },
          type: { name: 'String' },
          required: false,
          inputHint: 'SingleLine',
        },
        {
          name: 'new-field',
          label: { en: 'New', de: 'Neu' },
          type: { name: 'String' },
          required: false,
          inputHint: 'SingleLine',
        },
      ];

      await updateType(typeWithSomeFields, newFields);

      expect(withKeyPostMock).toHaveBeenCalledWith({
        body: {
          version: 1,
          actions: [
            {
              action: 'addFieldDefinition',
              fieldDefinition: expect.objectContaining({ name: 'new-field' }),
            },
          ],
        },
      });
    });

    it('should not update when all fields exist', async () => {
      const typeWithAllFields: Type = {
        ...mockType,
        fieldDefinitions: [
          {
            name: 'field1',
            label: { en: 'Field 1', de: 'Feld 1' },
            type: { name: 'String' },
            required: false,
            inputHint: 'SingleLine',
          },
        ],
      };

      const { withKeyPostMock } = setupMocks([typeWithAllFields]);

      const existingFields: FieldDefinition[] = [
        {
          name: 'field1',
          label: { en: 'Field 1', de: 'Feld 1' },
          type: { name: 'String' },
          required: false,
          inputHint: 'SingleLine',
        },
      ];

      await updateType(typeWithAllFields, existingFields);

      expect(withKeyPostMock).not.toHaveBeenCalled();
    });

    it('should replace all fields when replaceAllFields is true', async () => {
      const typeWithOldFields: Type = {
        ...mockType,
        fieldDefinitions: [
          {
            name: 'old-field',
            label: { en: 'Old', de: 'Alt' },
            type: { name: 'String' },
            required: false,
            inputHint: 'SingleLine',
          },
        ],
      };

      const { withKeyPostMock } = setupMocks([typeWithOldFields]);

      const newFields: FieldDefinition[] = [
        {
          name: 'new-field',
          label: { en: 'New', de: 'Neu' },
          type: { name: 'String' },
          required: false,
          inputHint: 'SingleLine',
        },
      ];

      await updateType(typeWithOldFields, newFields, { replaceAllFields: true });

      expect(withKeyPostMock).toHaveBeenCalledWith({
        body: {
          version: 1,
          actions: [
            { action: 'removeFieldDefinition', fieldName: 'old-field' },
            {
              action: 'addFieldDefinition',
              fieldDefinition: expect.objectContaining({ name: 'new-field' }),
            },
          ],
        },
      });
    });
  });
});
