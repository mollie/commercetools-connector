import { Customer } from '@commercetools/platform-sdk';
import { createApiRoot } from '../client/create.client';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { CustomFields } from '../utils/constant.utils';

export async function createCustomCustomerTypes(): Promise<void> {
  const apiRoot = createApiRoot();

  const {
    body: { results: types },
  } = await createApiRoot()
    .types()
    .get({
      queryArgs: {
        where: `key = "${CustomFields.customer.key}"`,
      },
    })
    .execute();

  if (types.length === 0) {
    await apiRoot
      .types()
      .post({
        body: {
          key: CustomFields.customer.key,
          name: {
            en: 'SCTM - Customer custom fields',
            de: 'SCTM - Benutzerdefinierte Kundenfelder',
          },
          resourceTypeIds: ['customer'],
          fieldDefinitions: [
            {
              name: CustomFields.customer.registrationNumber,
              label: {
                en: 'Registration Number',
                de: 'Handelsregisternummer',
              },
              required: false,
              type: {
                name: 'String',
              },
              inputHint: 'SingleLine',
            },
          ],
        },
      })
      .execute();
  }
}

export const getCustomerById = async (customerId: string): Promise<Customer> => {
  const response = await createApiRoot().customers().withId({ ID: customerId }).get().execute();

  if (!response.body) {
    const error = new CustomError(400, `Customer with ID ${customerId} not found`);
    logger.error('getCustomerById', error);
    throw error;
  }

  return response.body;
};
