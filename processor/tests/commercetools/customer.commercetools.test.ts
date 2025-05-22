import { Customer } from '@commercetools/platform-sdk';
import { createApiRoot } from '../../src/client/create.client';
import { getCustomerById, createCustomCustomerTypes } from '../../src/commercetools/customer.commercetools';
import { CustomFields } from '../../src/utils/constant.utils';

// Mock dependencies
jest.mock('../../src/client/create.client');

// Mock data
const mockCustomer: Customer = {
  id: 'customer-123',
  version: 1,
  createdAt: '2023-01-01T00:00:00.000Z',
  lastModifiedAt: '2023-01-01T00:00:00.000Z',
  key: 'customer-key',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: 'hashedPassword',
  addresses: [],
  isEmailVerified: false,
  authenticationMode: 'Password',
};

const mockTypeResponse = {
  body: {
    results: [
      {
        id: 'type-123',
        key: CustomFields.customer.key,
      },
    ],
  },
};

const mockEmptyTypeResponse = {
  body: {
    results: [],
  },
};

const mockCustomerResponse = {
  body: mockCustomer,
};

// Test helper functions
const mockApiRoot = {
  types: jest.fn().mockReturnThis(),
  customers: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  post: jest.fn().mockReturnThis(),
  withId: jest.fn().mockReturnThis(),
  execute: jest.fn(),
};

function setupMocks() {
  (createApiRoot as jest.Mock).mockReturnValue(mockApiRoot);
  jest.clearAllMocks();
}

describe('customer.commercetools.ts', () => {
  beforeEach(() => {
    setupMocks();
  });

  describe('createCustomCustomerTypes', () => {
    it('should create custom type when none exists', async () => {
      // Arrange
      mockApiRoot.execute.mockResolvedValueOnce(mockEmptyTypeResponse);
      mockApiRoot.execute.mockResolvedValueOnce({});

      // Act
      await createCustomCustomerTypes();

      // Assert
      expect(mockApiRoot.types).toHaveBeenCalledTimes(2);
      expect(mockApiRoot.get).toHaveBeenCalledTimes(1);
      expect(mockApiRoot.post).toHaveBeenCalledTimes(1);
      expect(mockApiRoot.post).toHaveBeenCalledWith({
        body: {
          key: CustomFields.customer.key,
          name: {
            en: 'SCTM - Customer custom fields',
            de: 'SCTM - Benutzerdefinierte Kundenfelder',
          },
          resourceTypeIds: ['customer'],
          fieldDefinitions: [
            {
              name: CustomFields.customer.registrationNumber,
              label: {
                en: 'Registration Number',
                de: 'Handelsregisternummer',
              },
              required: false,
              type: {
                name: 'String',
              },
              inputHint: 'SingleLine',
            },
          ],
        },
      });
      expect(mockApiRoot.execute).toHaveBeenCalledTimes(2);
    });

    it('should not create custom type when one exists', async () => {
      // Arrange
      mockApiRoot.execute.mockResolvedValueOnce(mockTypeResponse);

      // Act
      await createCustomCustomerTypes();

      // Assert
      expect(mockApiRoot.types).toHaveBeenCalledTimes(1);
      expect(mockApiRoot.get).toHaveBeenCalledTimes(1);
      expect(mockApiRoot.post).not.toHaveBeenCalled();
      expect(mockApiRoot.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when getting types', async () => {
      // Arrange
      const error = new Error('API Error');
      mockApiRoot.execute.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(createCustomCustomerTypes()).rejects.toThrow('API Error');
      expect(mockApiRoot.types).toHaveBeenCalledTimes(1);
      expect(mockApiRoot.get).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when creating types', async () => {
      // Arrange
      mockApiRoot.execute.mockResolvedValueOnce(mockEmptyTypeResponse);
      mockApiRoot.execute.mockRejectedValueOnce(new Error('Creation Error'));

      // Act & Assert
      await expect(createCustomCustomerTypes()).rejects.toThrow('Creation Error');
      expect(mockApiRoot.types).toHaveBeenCalledTimes(2);
      expect(mockApiRoot.get).toHaveBeenCalledTimes(1);
      expect(mockApiRoot.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCustomerById', () => {
    it('should retrieve customer by ID', async () => {
      // Arrange
      const customerId = 'customer-123';
      mockApiRoot.execute.mockResolvedValueOnce(mockCustomerResponse);

      // Act
      const result = await getCustomerById(customerId);

      // Assert
      expect(mockApiRoot.customers).toHaveBeenCalledTimes(1);
      expect(mockApiRoot.withId).toHaveBeenCalledWith({ ID: customerId });
      expect(mockApiRoot.get).toHaveBeenCalledTimes(1);
      expect(mockApiRoot.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCustomer);
    });

    it('should handle error when customer not found', async () => {
      // Arrange
      const customerId = 'non-existent-id';
      mockApiRoot.execute.mockResolvedValueOnce({ body: undefined });

      try {
        const result = await getCustomerById(customerId);
      } catch (error: any) {
        expect(mockApiRoot.customers).toHaveBeenCalledTimes(1);
        expect(mockApiRoot.withId).toHaveBeenCalledWith({ ID: customerId });
        expect(mockApiRoot.get).toHaveBeenCalledTimes(1);
        expect(mockApiRoot.execute).toHaveBeenCalledTimes(1);
        expect(error.message).toEqual('Customer with ID non-existent-id not found');
      }
    });

    it('should handle API errors', async () => {
      // Arrange
      const customerId = 'customer-123';
      const error = new Error('API Error');
      mockApiRoot.execute.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(getCustomerById(customerId)).rejects.toThrow('API Error');
      expect(mockApiRoot.customers).toHaveBeenCalledTimes(1);
      expect(mockApiRoot.withId).toHaveBeenCalledWith({ ID: customerId });
      expect(mockApiRoot.get).toHaveBeenCalledTimes(1);
    });
  });
});
