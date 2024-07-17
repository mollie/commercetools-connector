import { determinePaymentAction } from '../utils/paymentAction.utils';
import { ControllerResponseType } from '../types/controller.types';
import { handleCreatePayment, handleListPaymentMethodsByPayment } from '../service/payment.service';
import { PaymentReference, Payment } from '@commercetools/platform-sdk';
import { ConnectorActions } from '../utils/constant.utils';
import { validateCommerceToolsPaymentPayload } from '../validators/payment.validators';
import CustomError from '../errors/custom.error';

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

  validateCommerceToolsPaymentPayload(action, ctPayment);

  const controllerAction = determinePaymentAction(ctPayment);

  switch (controllerAction.action) {
    case ConnectorActions.GetPaymentMethods:
      return await handleListPaymentMethodsByPayment(ctPayment);
    case ConnectorActions.CreatePayment:
      return await handleCreatePayment(ctPayment);
    case ConnectorActions.NoAction:
      return {
        statusCode: 200,
      };
    default:
      throw new CustomError(400, controllerAction.errorMessage ?? '');
  }
};
