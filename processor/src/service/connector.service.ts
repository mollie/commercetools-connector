import { createPaymentExtension, deletePaymentExtension } from '../commercetools/extensions.commercetools';
import {
  createCustomPaymentType,
  createCustomPaymentInterfaceInteractionType,
  createCustomPaymentTransactionCancelReasonType,
  createTransactionSurchargeCustomType,
} from '../commercetools/customFields.commercetools';
export const createExtensionAndCustomFields = async (extensionUrl: string): Promise<void> => {
  await createPaymentExtension(extensionUrl);
  await createCustomPaymentType();
  await createCustomPaymentInterfaceInteractionType();
  await createCustomPaymentTransactionCancelReasonType();
  await createTransactionSurchargeCustomType();
};

export const removeExtension = async (): Promise<void> => {
  await deletePaymentExtension();
};
