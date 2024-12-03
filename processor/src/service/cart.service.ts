import { Cart, Payment } from '@commercetools/platform-sdk';
import { getCartFromPayment, updateCart } from '../commercetools/cart.commercetools';
import { createCartUpdateActions } from '../utils/map.utils';

export const removeCartMollieCustomLineItem = async (ctPayment: Payment): Promise<Cart> => {
  const cart = await getCartFromPayment(ctPayment.id);
  // Right here we just remove the custom line item, so set 0 as surcharge amount to by pass the condition inside createCartUpdateActions()
  const removeCustomLineItemAction = createCartUpdateActions(cart, ctPayment, 0);

  return await updateCart(cart, removeCustomLineItemAction);
};
