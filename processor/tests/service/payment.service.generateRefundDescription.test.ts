// We need to mock config before it's used by other modules
jest.mock('../../src/utils/config.utils', () => ({
  readConfiguration: jest.fn().mockReturnValue({
    commerceTools: {
      brandName: 'TestBrand',
      projectKey: 'test-project',
      region: 'eu-central-1',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      scope: 'test-scope',
      authUrl: 'https://auth.example.com',
      authMode: 'test',
      sessionAudience: 'test-audience',
      sessionIssuer: 'test-issuer',
      transactionCustomTypeKey: 'test-key',
    },
    mollie: {
      testApiKey: 'test-api-key',
      liveApiKey: 'live-api-key',
      mode: 'test',
      profileId: 'test-profile-id',
      debug: 'false',
    },
  }),
  getApiKey: jest.fn().mockReturnValue('test-api-key'),
  getTransactionCustomTypeKey: jest.fn().mockReturnValue('test-key'),
}));

// Mock PaymentMethod for constant.utils
jest.mock('@mollie/api-client', () => ({
  PaymentMethod: {
    klarnapaylater: 'klarnapaylater',
    klarnasliceit: 'klarnasliceit',
    klarna: 'klarna',
    creditcard: 'creditcard',
  },
  PaymentStatus: {},
}));

// Mock other dependencies
jest.mock('../../src/client/build.client.ts', () => ({}));
jest.mock('../../src/middleware/auth.middleware.ts', () => ({}));
jest.mock('../../src/client/create.client.ts', () => ({}));
jest.mock('../../src/commercetools/payment.commercetools.ts', () => ({}));
jest.mock('../../src/mollie/payment.mollie', () => ({}));
jest.mock('../../src/mollie/refund.mollie', () => ({}));

// Mock order.commercetools separately to use in tests
jest.mock('../../src/commercetools/order.commercetools', () => ({
  getOrderByPaymentId: jest.fn(),
}));

// After all the mocks, import these
import { FULL_REFUND, PARTIAL_REFUND } from '../../src/utils/constant.utils';
import { RefundDescriptionParams } from '../../src/types/index.types';

// Now we can import our function to test
import { generateRefundDescription } from '../../src/service/payment.service';

// Import mock functions for type assertion
import { getOrderByPaymentId } from '../../src/commercetools/order.commercetools';
import { readConfiguration } from '../../src/utils/config.utils';

describe('generateRefundDescription', () => {
  // Common test data
  const mockPaymentId = 'payment-123';
  const mockOrderNumber = 'order-456';
  const mockBrandName = 'TestBrand';
  const mockProjectKey = 'test-project';
  const mockCustomerMessage = 'Customer requested refund';

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    (getOrderByPaymentId as jest.Mock).mockResolvedValue({ orderNumber: mockOrderNumber });
  });

  test('should generate full refund description when totalAmount equals refundAmount', async () => {
    // Arrange
    const params: RefundDescriptionParams = {
      paymentId: mockPaymentId,
      totalAmount: { value: '100.00', currency: 'EUR' },
      refundAmount: { value: '100.00', currency: 'EUR' },
      customerMessage: mockCustomerMessage,
    };

    // Act
    const result = await generateRefundDescription(params);

    // Assert
    expect(getOrderByPaymentId).toHaveBeenCalledWith(mockPaymentId);
    expect(readConfiguration).toHaveBeenCalled();
    expect(result).toBe(`${mockBrandName} | ${mockOrderNumber} | ${FULL_REFUND} | ${mockCustomerMessage}`);
  });

  test('should generate partial refund description when totalAmount is greater than refundAmount', async () => {
    // Arrange
    const params: RefundDescriptionParams = {
      paymentId: mockPaymentId,
      totalAmount: { value: '100.00', currency: 'EUR' },
      refundAmount: { value: '50.00', currency: 'EUR' },
      customerMessage: mockCustomerMessage,
    };

    // Act
    const result = await generateRefundDescription(params);

    // Assert
    expect(getOrderByPaymentId).toHaveBeenCalledWith(mockPaymentId);
    expect(readConfiguration).toHaveBeenCalled();
    expect(result).toBe(`${mockBrandName} | ${mockOrderNumber} | ${PARTIAL_REFUND} | ${mockCustomerMessage}`);
  });

  test('should use projectKey when brandName is not defined', async () => {
    // Arrange
    (readConfiguration as jest.Mock).mockReturnValueOnce({
      commerceTools: {
        brandName: undefined,
        projectKey: mockProjectKey,
        region: 'eu-central-1',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        scope: 'test-scope',
        authUrl: 'https://auth.example.com',
        authMode: 'test',
        sessionAudience: 'test-audience',
        sessionIssuer: 'test-issuer',
        transactionCustomTypeKey: 'test-key',
      },
      mollie: {
        testApiKey: 'test-api-key',
        liveApiKey: 'live-api-key',
        mode: 'test',
        profileId: 'test-profile-id',
        debug: 'false',
      },
    });

    const params: RefundDescriptionParams = {
      paymentId: mockPaymentId,
      totalAmount: { value: '100.00', currency: 'EUR' },
      refundAmount: { value: '100.00', currency: 'EUR' },
      customerMessage: mockCustomerMessage,
    };

    // Act
    const result = await generateRefundDescription(params);

    // Assert
    expect(result).toBe(`${mockProjectKey} | ${mockOrderNumber} | ${FULL_REFUND} | ${mockCustomerMessage}`);
  });

  test('should handle empty customerMessage', async () => {
    // Arrange
    const params: RefundDescriptionParams = {
      paymentId: mockPaymentId,
      totalAmount: { value: '100.00', currency: 'EUR' },
      refundAmount: { value: '100.00', currency: 'EUR' },
      customerMessage: '',
    };

    // Act
    const result = await generateRefundDescription(params);

    // Assert
    expect(result).toBe(`${mockBrandName} | ${mockOrderNumber} | ${FULL_REFUND}`);
  });

  test('should handle undefined order', async () => {
    // Arrange
    (getOrderByPaymentId as jest.Mock).mockResolvedValue(undefined);

    const params: RefundDescriptionParams = {
      paymentId: mockPaymentId,
      totalAmount: { value: '100.00', currency: 'EUR' },
      refundAmount: { value: '100.00', currency: 'EUR' },
      customerMessage: mockCustomerMessage,
    };

    // Act
    const result = await generateRefundDescription(params);

    // Assert
    expect(result).toBe(`${mockBrandName} | ${FULL_REFUND} | ${mockCustomerMessage}`);
  });

  test('should handle order with undefined orderNumber', async () => {
    // Arrange
    (getOrderByPaymentId as jest.Mock).mockResolvedValue({ orderNumber: undefined });

    const params: RefundDescriptionParams = {
      paymentId: mockPaymentId,
      totalAmount: { value: '100.00', currency: 'EUR' },
      refundAmount: { value: '100.00', currency: 'EUR' },
      customerMessage: mockCustomerMessage,
    };

    // Act
    const result = await generateRefundDescription(params);

    // Assert
    expect(result).toBe(`${mockBrandName} | ${FULL_REFUND} | ${mockCustomerMessage}`);
  });

  test('should filter out falsy values from the description', async () => {
    // Arrange
    (getOrderByPaymentId as jest.Mock).mockResolvedValue(undefined);

    const params: RefundDescriptionParams = {
      paymentId: mockPaymentId,
      totalAmount: { value: '100.00', currency: 'EUR' },
      refundAmount: { value: '100.00', currency: 'EUR' },
      customerMessage: '',
    };

    // Act
    const result = await generateRefundDescription(params);

    // Assert
    expect(result).toBe(`${mockBrandName} | ${FULL_REFUND}`);
  });

  test('should handle different money structure in amounts', async () => {
    // Arrange
    const params: RefundDescriptionParams = {
      paymentId: mockPaymentId,
      totalAmount: { value: '200.00', currency: 'EUR' },
      refundAmount: { value: '50.00', currency: 'EUR' },
      customerMessage: mockCustomerMessage,
    };

    // Act
    const result = await generateRefundDescription(params);

    // Assert
    expect(result).toBe(`${mockBrandName} | ${mockOrderNumber} | ${PARTIAL_REFUND} | ${mockCustomerMessage}`);
  });
});
