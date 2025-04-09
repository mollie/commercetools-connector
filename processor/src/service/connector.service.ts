import { createPaymentExtension, deletePaymentExtension } from '../commercetools/extensions.commercetools';
import {
  createCustomPaymentType,
  createCustomPaymentInterfaceInteractionType,
  createCustomTransactionType,
} from '../commercetools/customFields.commercetools';
import { getAccessToken } from '../commercetools/auth.commercetools';

export const createExtensionAndCustomFields = async (extensionUrl: string): Promise<void> => {
  const response = await getAccessToken();
  try {
    await createPaymentExtension(extensionUrl, response?.access_token as string);
    await createCustomPaymentType();
    await createCustomPaymentInterfaceInteractionType();
    await createCustomTransactionType();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to create extension and custom fields: ${errorMessage}`);
  }
};

export const removeExtension = async (): Promise<void> => {
  await deletePaymentExtension();
};
