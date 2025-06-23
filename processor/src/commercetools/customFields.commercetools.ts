import { CustomFields } from '../utils/constant.utils';
import { createApiRoot } from '../client/create.client';
import { FieldDefinition, TypeUpdateAction } from '@commercetools/platform-sdk';
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

  if (types.length <= 0) {
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
            {
              name: CustomFields.applePay.session.request,
              label: {
                en: 'The request object for inquiring the Apple Pay payment session',
                de: 'Das Anfrageobjekt für die Abfrage der Apple Pay-Zahlungssitzung',
              },
              required: false,
              type: {
                name: 'String',
              },
              inputHint: 'MultiLine',
            },
            {
              name: CustomFields.applePay.session.response,
              label: {
                en: 'The response object holding the Apple Pay payment session',
                de: 'Das Antwortobjekt zur Speicherung der Apple Pay-Zahlungssitzung',
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
}

export async function createCustomPaymentInterfaceInteractionType(): Promise<void> {
  const apiRoot = createApiRoot();
  const interfaceInteractionFields: FieldDefinition[] = [
    {
      name: CustomFields.createPayment.interfaceInteraction.fields.id,
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
      name: CustomFields.createPayment.interfaceInteraction.fields.actionType,
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
      name: CustomFields.createPayment.interfaceInteraction.fields.createdAt,
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
      name: CustomFields.createPayment.interfaceInteraction.fields.request,
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
      name: CustomFields.createPayment.interfaceInteraction.fields.response,
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
  ];

  const {
    body: { results: types },
  } = await apiRoot
    .types()
    .get({
      queryArgs: {
        where: `key = "${CustomFields.createPayment.interfaceInteraction.key}"`,
      },
    })
    .execute();

  if (types.length <= 0) {
    await apiRoot
      .types()
      .post({
        body: {
          key: CustomFields.createPayment.interfaceInteraction.key,
          name: {
            en: 'SCTM - Mollie Payment Interface',
            de: 'SCTM - Benutzerdefinierte Felder im Warenkorb',
          },
          resourceTypeIds: ['payment-interface-interaction'],
          fieldDefinitions: interfaceInteractionFields,
        },
      })
      .execute();

    return;
  }

  const type = types[0];
  const definitions = type.fieldDefinitions;

  if (definitions.length > 0) {
    const actions: TypeUpdateAction[] = [];
    definitions.forEach((definition) => {
      actions.push({
        action: 'removeFieldDefinition',
        fieldName: definition.name,
      });
    });
    interfaceInteractionFields.forEach((field) => {
      actions.push({
        action: 'addFieldDefinition',
        fieldDefinition: field,
      });
    });

    await apiRoot
      .types()
      .withKey({ key: CustomFields.createPayment.interfaceInteraction.key })
      .post({
        body: {
          version: type.version,
          actions,
        },
      })
      .execute();

    return;
  }
}

export async function createCustomTransactionType(): Promise<void> {
  const transactionCustomTypeKey =
    process.env?.CTP_TRANSACTION_CUSTOM_TYPE_KEY && process.env.CTP_TRANSACTION_CUSTOM_TYPE_KEY?.length > 0
      ? process.env.CTP_TRANSACTION_CUSTOM_TYPE_KEY
      : CustomFields.transactions.defaultCustomTypeKey;

  const apiRoot = createApiRoot();
  const {
    body: { results: types },
  } = await apiRoot
    .types()
    .get({
      queryArgs: {
        where: `key = "${transactionCustomTypeKey}"`,
      },
    })
    .execute();

  if (types.length === 0) {
    await apiRoot
      .types()
      .post({
        body: {
          key: transactionCustomTypeKey,
          name: {
            en: CustomFields.transactions.name.en,
            de: CustomFields.transactions.name.de,
          },
          resourceTypeIds: [CustomFields.transactions.resourceTypeId],
          fieldDefinitions: Object.values(CustomFields.transactions.fields) as FieldDefinition[],
        },
      })
      .execute();
  } else {
    const type = types[0];
    const existingDefinitions = type.fieldDefinitions.map((field) => field.name);
    const fieldDefinitions = Object.values(CustomFields.transactions.fields).filter(
      (field) => !existingDefinitions.includes(field.name),
    ) as FieldDefinition[];

    if (fieldDefinitions.length > 0) {
      await apiRoot
        .types()
        .withKey({ key: transactionCustomTypeKey })
        .post({
          body: {
            version: type.version,
            actions: fieldDefinitions.map((field) => ({
              action: 'addFieldDefinition',
              fieldDefinition: field,
            })),
          },
        })
        .execute();
    }
  }
}
