import { createPaymentExtension, deletePaymentExtension } from '../commercetools/extensions.commercetools';
import {
  createCustomPaymentType,
  createCustomPaymentInterfaceInteractionType,
  createCustomTransactionType,
} from '../commercetools/customFields.commercetools';
import { getAccessToken } from '../commercetools/auth.commercetools';
import { createCustomCustomerTypes } from '../commercetools/customer.commercetools';

export const createExtensionAndCustomFields = async (extensionUrl: string): Promise<void> => {
  const response = await getAccessToken();
  await createPaymentExtension(extensionUrl, response?.access_token as string);
  await createCustomPaymentType();
  await createCustomPaymentInterfaceInteractionType();
  await createCustomTransactionType();
  await createCustomCustomerTypes();
};

export const removeExtension = async (): Promise<void> => {
  await deletePaymentExtension();
};
