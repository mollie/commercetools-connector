import { CustomFields } from '../utils/constant.utils';
import { createApiRoot } from '../client/create.client';

const PAYMENT_TYPE_KEY = 'sctm-payment-custom-type';

export async function createCustomPaymentType(): Promise<void> {
  const apiRoot = createApiRoot();

  const {
    body: { results: types },
  } = await createApiRoot()
    .types()
    .get({
      queryArgs: {
        where: `key = "${PAYMENT_TYPE_KEY}"`,
      },
    })
    .execute();

  if (types.length > 0) {
    const type = types[0];

    await apiRoot
      .types()
      .withKey({ key: PAYMENT_TYPE_KEY })
      .delete({
        queryArgs: {
          version: type.version,
        },
      })
      .execute();
  }

  await apiRoot
    .types()
    .post({
      body: {
        key: PAYMENT_TYPE_KEY,
        name: {
          en: 'SCTM - Payment method custom fields',
          de: 'SCTM - Benutzerdefinierte Felder der Zahlungsmethode',
        },
        resourceTypeIds: ['payment'],
        fieldDefinitions: [
          {
            name: CustomFields.payment.profileId,
            label: {
              en: 'Profile ID',
              de: 'Profil-ID',
            },
            required: false,
            type: {
              name: 'String',
            },
            inputHint: 'MultiLine',
          },
          {
            name: CustomFields.payment.request,
            label: {
              en: 'The request object for listing payment methods',
              de: 'Das Anforderungsobjekt für die Auflistung der Zahlwege',
            },
            required: false,
            type: {
              name: 'String',
            },
            inputHint: 'MultiLine',
          },
          {
            name: CustomFields.payment.response,
            label: {
              en: 'List of available payment methods',
              de: 'Liste der verfügbaren Zahlungsarten',
            },
            required: false,
            type: {
              name: 'String',
            },
            inputHint: 'MultiLine',
          },
          {
            name: CustomFields.createPayment.request,
            label: {
              en: 'The request object for create Mollie payment',
              de: 'Das Anforderungsobjekt zum Erstellen der Mollie-Zahlung',
            },
            required: false,
            type: {
              name: 'String',
            },
            inputHint: 'MultiLine',
          },
        ],
      },
    })
    .execute();
}

export async function createCustomPaymentInterfaceInteractionType(): Promise<void> {
  const apiRoot = createApiRoot();

  const {
    body: { results: types },
  } = await apiRoot
    .types()
    .get({
      queryArgs: {
        where: `key = "${CustomFields.createPayment.interfaceInteraction}"`,
      },
    })
    .execute();

  if (types.length > 0) {
    const type = types[0];

    await apiRoot
      .types()
      .withKey({ key: CustomFields.createPayment.interfaceInteraction })
      .delete({
        queryArgs: {
          version: type.version,
        },
      })
      .execute();
  }

  await apiRoot
    .types()
    .post({
      body: {
        key: CustomFields.createPayment.interfaceInteraction,
        name: {
          en: 'SCTM - Mollie Payment Interface',
          de: 'SCTM - Benutzerdefinierte Felder im Warenkorb',
        },
        resourceTypeIds: ['payment-interface-interaction'],
        fieldDefinitions: [
          {
            name: 'id',
            label: {
              en: 'Interface Interaction ID',
              de: 'Schnittstelleninteraktions-ID',
            },
            required: false,
            type: {
              name: 'String',
            },
            inputHint: 'MultiLine',
          },
          {
            name: 'actionType',
            label: {
              en: 'Action Type',
              de: 'Aktionstyp',
            },
            required: false,
            type: {
              name: 'String',
            },
            inputHint: 'MultiLine',
          },
          {
            name: 'createdAt',
            label: {
              en: 'Created At',
              de: 'Hergestellt in',
            },
            required: false,
            type: {
              name: 'String',
            },
            inputHint: 'MultiLine',
          },
          {
            name: 'request',
            label: {
              en: 'Interface Interaction Request',
              de: 'Schnittstelleninteraktionsanforderung',
            },
            required: false,
            type: {
              name: 'String',
            },
            inputHint: 'MultiLine',
          },
          {
            name: 'response',
            label: {
              en: 'Interface Interaction Response',
              de: 'Schnittstelleninteraktionsantwort',
            },
            required: false,
            type: {
              name: 'String',
            },
            inputHint: 'MultiLine',
          },
        ],
      },
    })
    .execute();
}
