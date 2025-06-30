import { createPaymentExtension, deletePaymentExtension } from '../commercetools/extensions.commercetools';
import {
  createCustomPaymentType,
  createCustomPaymentInterfaceInteractionType,
  createCustomTransactionType,
} from '../commercetools/customFields.commercetools';

export const createExtensionAndCustomFields = async (extensionUrl: string): Promise<void> => {
  try {
    await createPaymentExtension(extensionUrl);
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
