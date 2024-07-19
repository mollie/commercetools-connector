import { determinePaymentAction } from '../utils/paymentAction.utils';
import { ControllerResponseType } from '../types/controller.types';
import { handleCreatePayment, handleListPaymentMethodsByPayment } from '../service/payment.service';
import { PaymentReference, Payment } from '@commercetools/platform-sdk';
import { ConnectorActions } from '../utils/constant.utils';
import { validateCommerceToolsPaymentPayload } from '../validators/payment.validators';
import CustomError from '../errors/custom.error';
import SkipError from '../errors/skip.error';

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

  const controllerAction = determinePaymentAction(ctPayment);

  if (controllerAction.errorMessage !== '') {
    throw new CustomError(400, controllerAction.errorMessage as string);
  }

  if (controllerAction.action === ConnectorActions.NoAction) {
    throw new SkipError('SCTM - No payment actions matched');
  }

  validateCommerceToolsPaymentPayload(action, controllerAction.action, ctPayment);

  switch (controllerAction.action) {
    case ConnectorActions.GetPaymentMethods:
      return await handleListPaymentMethodsByPayment(ctPayment);
    case ConnectorActions.CreatePayment:
      return await handleCreatePayment(ctPayment);
    default:
      if (controllerAction.errorMessage === '') {
        throw new SkipError('SCTM - No payment actions matched');
      }

      throw new CustomError(400, controllerAction.errorMessage as string);
  }
};
