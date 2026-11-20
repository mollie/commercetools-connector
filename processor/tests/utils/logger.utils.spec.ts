import { logger } from '../../src/utils/logger.utils';
import { describe, test, expect, jest } from '@jest/globals';

const { redactSensitiveFieldsFormatter } =
  jest.requireActual<typeof import('../../src/utils/logger.utils')>('../../src/utils/logger.utils');

describe('Test logger.utils.ts', () => {
  test('should return the correct logger with debug level', () => {
    expect(logger).toBeDefined();
    expect(logger.level).toBe('debug');
  });
});

describe('redactSensitiveFieldsFormatter', () => {
  test('masks sensitive keys at any depth and keeps identifiers', () => {
    const info = {
      level: 'debug',
      message: 'test',
      commerceToolsPaymentId: 'ct-payment-id',
      payment: {
        custom: { fields: { sctm_create_payment_request: '{"cardToken":"tkn_must_not_be_logged"}' } },
        applePayPaymentToken: 'apple_pay_must_not_be_logged',
        billingAddress: { email: 'customer@example.com' },
      },
    };

    const serialized = JSON.stringify(redactSensitiveFieldsFormatter.transform(info));

    expect(serialized).not.toContain('tkn_must_not_be_logged');
    expect(serialized).not.toContain('apple_pay_must_not_be_logged');
    expect(serialized).not.toContain('customer@example.com');
    expect(serialized).toContain('ct-payment-id');
  });

  test('masks sensitive keys inside arrays', () => {
    const info = {
      level: 'debug',
      message: 'test',
      transactions: [{ id: 'transaction-id', cardToken: 'tkn_must_not_be_logged' }],
    };

    const serialized = JSON.stringify(redactSensitiveFieldsFormatter.transform(info));

    expect(serialized).not.toContain('tkn_must_not_be_logged');
    expect(serialized).toContain('transaction-id');
  });

  test('replaces circular references instead of overflowing the stack', () => {
    const payment: Record<string, unknown> = { id: 'ct-payment-id', cardToken: 'tkn_must_not_be_logged' };
    payment.self = payment;
    const info = { level: 'error', message: 'test', payment, sibling: { shared: { id: 'shared-id' } } };
    (info.sibling as Record<string, unknown>).again = info.sibling.shared;

    const result = redactSensitiveFieldsFormatter.transform(info) as Record<string, any>;

    expect(result.payment.self).toBe('[Circular]');
    expect(result.payment.cardToken).toBe('[REDACTED]');
    expect(result.payment.id).toBe('ct-payment-id');
    expect(result.sibling.again).toEqual({ id: 'shared-id' });
  });

  test('keeps level, message and winston symbol keys unchanged', () => {
    const levelSymbol = Symbol.for('level');
    const info = { level: 'info', message: 'test', [levelSymbol]: 'info' };

    const result = redactSensitiveFieldsFormatter.transform(info) as typeof info;

    expect(result.level).toBe('info');
    expect(result.message).toBe('test');
    expect(result[levelSymbol]).toBe('info');
  });
});
