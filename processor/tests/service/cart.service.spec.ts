import { Cart, Payment } from '@commercetools/platform-sdk';
import { getCartFromPayment, updateCart } from './../../src/commercetools/cart.commercetools';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM } from '../../src/utils/constant.utils';
import { removeCartMollieCustomLineItem } from '../../src/service/cart.service';

jest.mock('../../src/commercetools/cart.commercetools', () => ({
  getCartFromPayment: jest.fn(),
  updateCart: jest.fn(),
}));

describe('Test removeCartMollieCustomLineItem', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should able to execute the function completely', async () => {
    const cart = {
      customLineItems: [
        {
          id: 'customlineItem',
          key: MOLLIE_SURCHARGE_CUSTOM_LINE_ITEM,
        },
      ],
    } as Cart;
    const payment = {
      id: 'test123',
    } as unknown as Payment;

    (getCartFromPayment as jest.Mock).mockReturnValue(cart);
    (updateCart as jest.Mock).mockReturnValue(cart);
    const mapUtils = require('../../src/utils/map.utils');

    jest.spyOn(mapUtils, 'createCartUpdateActions');

    await removeCartMollieCustomLineItem(payment);
    expect(getCartFromPayment).toHaveBeenCalledTimes(1);
    expect(getCartFromPayment).toHaveBeenCalledWith(payment.id);
    expect(updateCart).toHaveBeenCalledTimes(1);
    expect(mapUtils.createCartUpdateActions).toHaveBeenCalledTimes(1);
    expect(mapUtils.createCartUpdateActions).toHaveBeenCalledWith(cart, payment, 0);
    expect(mapUtils.createCartUpdateActions).toHaveReturnedWith([
      {
        action: 'removeCustomLineItem',
        customLineItemId: cart.customLineItems[0].id,
      },
    ]);
    expect(updateCart).toHaveBeenCalledWith(cart, mapUtils.createCartUpdateActions(cart, payment, 0));
  });
});
