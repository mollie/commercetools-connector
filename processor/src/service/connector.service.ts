import { createPaymentExtension, deletePaymentExtension } from '../commercetools/extensions.commercetools';
import {
  createCustomPaymentType,
  createCustomPaymentInterfaceInteractionType,
  createCustomPaymentTransactionCancelReasonType,
} from '../commercetools/customFields.commercetools';
export const createExtensionAndCustomFields = async (extensionUrl: string): Promise<void> => {
  await createPaymentExtension(extensionUrl);
  await createCustomPaymentType();
  await createCustomPaymentInterfaceInteractionType();
  await createCustomPaymentTransactionCancelReasonType();
};

export const removeExtension = async (): Promise<void> => {
  await deletePaymentExtension();
};
