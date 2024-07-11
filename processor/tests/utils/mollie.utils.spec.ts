import { describe, test, expect, it } from '@jest/globals';
import { isPayment, makeMollieAmount } from '../../src/utils/mollie.utils';
import { CentPrecisionMoney } from '@commercetools/platform-sdk';

describe('Test mollie.utils.ts', () => {
  test('call makeMollieAmount() with object reference', async () => {
    const mockMoney = {
      currencyCode: 'EUR',
      centAmount: 1000,
      fractionDigits: 2,
      type: 'centPrecision',
    } as unknown as CentPrecisionMoney;

    const response = makeMollieAmount(mockMoney);

    expect(response).toBeDefined();
    expect(response.value).toBe('10.00');
    expect(response.currency).toBe('EUR');
  });

  test('call makeMollieAmount() with no object reference', async () => {
    const response = makeMollieAmount({} as CentPrecisionMoney);
    expect(response).toBeDefined();
    expect(response.value).not.toBeNaN();
    expect(response.currency).toBeUndefined();
  });

  it('call isPayment() should return true if the id starts with tr', () => {
    expect(isPayment('tr_123')).toBeTruthy();
    expect(isPayment('tr_xxx')).toBeTruthy();
  });

  it('call isPayment() should return false if the id does not start with tr', () => {
    expect(isPayment('order_123')).toBeFalsy();
    expect(isPayment('xxx_tr_123')).toBeFalsy();
    expect(isPayment('')).toBeFalsy();
  });
});
