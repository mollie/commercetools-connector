import { determinePaymentAction } from '../utils/paymentAction.utils';
import { ControllerResponseType } from '../types/controller.types';
import {
  handleCreatePayment,
  handleCreateRefund,
  handleListPaymentMethodsByPayment,
  handlePaymentCancelRefund,
} from '../service/payment.service';
import { PaymentReference, Payment } from '@commercetools/platform-sdk';
import { ConnectorActions } from '../utils/constant.utils';
import { validateCommerceToolsPaymentPayload } from '../validators/payment.validators';
import SkipError from '../errors/skip.error';
import { logger } from '../utils/logger.utils';

/**
 * Handle the cart controller according to the action
 *
 * @param {string} action The action that comes with the request. Could be `Create` or `Update`
 * @param {Resource} resource The resource from the request body
 * @returns {Promise<object>} The data from the method that handles the action
 */
export const paymentController = async (
  action: string,
  resource: PaymentReference,
): Promise<ControllerResponseType> => {
  const ctPayment: Payment = JSON.parse(JSON.stringify(resource)).obj;
  logger.debug('SCTM - payment processing - paymentController - ctPayment', ctPayment);

  const paymentAction = determinePaymentAction(ctPayment);

  logger.debug('SCTM - payment processing - paymentController - determined payment action', paymentAction);

  if (paymentAction === ConnectorActions.NoAction) {
    throw new SkipError('No payment actions matched');
  }

  validateCommerceToolsPaymentPayload(action, paymentAction, ctPayment);

  logger.debug(
    `SCTM - payment processing - paymentController - payload validated, starting to handle the action: ${paymentAction}`,
  );

  switch (paymentAction) {
    case ConnectorActions.GetPaymentMethods:
      logger.debug('SCTM - payment processing - paymentController - handleListPaymentMethodsByPayment');
      return await handleListPaymentMethodsByPayment(ctPayment);
    case ConnectorActions.CreatePayment:
      return await handleCreatePayment(ctPayment);
    case ConnectorActions.CreateRefund:
      return await handleCreateRefund(ctPayment);
    case ConnectorActions.CancelRefund:
      return await handlePaymentCancelRefund(ctPayment);
    default:
      throw new SkipError('No payment actions matched');
  }
};
