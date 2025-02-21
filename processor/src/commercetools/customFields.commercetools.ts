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

export async function createCustomPaymentTransactionCancelReasonType(): Promise<void> {
  const apiRoot = createApiRoot();

  const customFieldName = CustomFields.paymentCancelReason;

  const {
    body: { results: types },
  } = await createApiRoot()
    .types()
    .get({
      queryArgs: {
        where: `key = "${customFieldName}"`,
      },
    })
    .execute();

  if (types.length <= 0) {
    await apiRoot
      .types()
      .post({
        body: {
          key: customFieldName,
          name: {
            en: 'SCTM - Payment cancel reason on Transaction custom fields',
            de: 'SCTM - Grund für Zahlungsstornierung in benutzerdefinierten Transaktionsfeldern',
          },
          description: {
            en: 'Showing the reason of cancelling and identifying if the cancel action came from CommerceTools or Mollie',
            de: 'Anzeige des Kündigungsgrundes und Identifizierung, ob die Kündigung von CommerceTools oder Mollie erfolgte',
          },
          resourceTypeIds: ['transaction'],
          fieldDefinitions: [
            {
              name: 'reasonText',
              label: {
                en: 'The reason of cancelling the refund, include the user name',
                de: 'Der Grund für die Stornierung der Rückerstattung, den Benutzernamen einschließen',
              },
              required: false,
              type: {
                name: 'String',
              },
              inputHint: 'MultiLine',
            },
            {
              name: 'statusText',
              label: {
                en: 'To differentiate between the “failure” from CommerceTools and the real status',
                de: 'Um zwischen dem „Fehler“ von CommerceTools und dem tatsächlichen Status zu unterscheiden',
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

export async function createTransactionSurchargeCustomType(): Promise<void> {
  const apiRoot = createApiRoot();
  const customFields: FieldDefinition[] = [
    {
      name: 'surchargeAmountInCent',
      label: {
        en: 'Total surcharge amount in cent',
        de: 'Gesamtbetrag des Zuschlags in Cent',
      },
      required: false,
      type: {
        name: 'Number',
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
        where: `key = "${CustomFields.transactionSurchargeCost}"`,
      },
    })
    .execute();

  if (types.length <= 0) {
    await apiRoot
      .types()
      .post({
        body: {
          key: CustomFields.transactionSurchargeCost,
          name: {
            en: 'SCTM - Transaction surcharge amount',
            de: 'SCTM - Betrag des Transaktionszuschlags',
          },
          resourceTypeIds: ['transaction'],
          fieldDefinitions: customFields,
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
    customFields.forEach((field) => {
      actions.push({
        action: 'addFieldDefinition',
        fieldDefinition: field,
      });
    });

    await apiRoot
      .types()
      .withKey({ key: CustomFields.transactionSurchargeCost })
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

export async function createTransactionRefundForMolliePaymentCustomType(): Promise<void> {
  const apiRoot = createApiRoot();
  const customFields: FieldDefinition[] = [
    {
      name: CustomFields.transactionRefundForMolliePayment,
      label: {
        en: 'Identify the Mollie payment which is being refunded',
        de: 'Identifizieren Sie die Mollie-Zahlung, die zurückerstattet wird',
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
        where: `key = "${CustomFields.transactionRefundForMolliePayment}"`,
      },
    })
    .execute();

  if (types.length <= 0) {
    await apiRoot
      .types()
      .post({
        body: {
          key: CustomFields.transactionRefundForMolliePayment,
          name: {
            en: 'Identify the Mollie payment which is being refunded',
            de: 'Identifizieren Sie die Mollie-Zahlung, die zurückerstattet wird',
          },
          resourceTypeIds: ['transaction'],
          fieldDefinitions: customFields,
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
    customFields.forEach((field) => {
      actions.push({
        action: 'addFieldDefinition',
        fieldDefinition: field,
      });
    });

    await apiRoot
      .types()
      .withKey({ key: CustomFields.transactionRefundForMolliePayment })
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

export async function createTransactionCaptureForMolliePaymentCustomType(): Promise<void> {
  const apiRoot = createApiRoot();
  const customFields: FieldDefinition[] = [
    {
      name: CustomFields.capturePayment.fields.shouldCapture.name,
      label: {
        en: CustomFields.capturePayment.fields.shouldCapture.label.en,
        de: CustomFields.capturePayment.fields.shouldCapture.label.de,
      },
      required: false,
      type: {
        name: 'Boolean',
      },
    },
    {
      name: CustomFields.capturePayment.fields.descriptionCapture.name,
      label: {
        en: CustomFields.capturePayment.fields.descriptionCapture.label.en,
        de: CustomFields.capturePayment.fields.descriptionCapture.label.de,
      },
      required: false,
      type: {
        name: 'String',
      },
      inputHint: 'MultiLine',
    },
    {
      name: CustomFields.capturePayment.fields.captureErrors.name,
      label: {
        en: CustomFields.capturePayment.fields.captureErrors.label.en,
        de: CustomFields.capturePayment.fields.captureErrors.label.de,
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
        where: `key = "${CustomFields.capturePayment.typeKey}"`,
      },
    })
    .execute();

  if (types.length <= 0) {
    await apiRoot
      .types()
      .post({
        body: {
          key: CustomFields.capturePayment.typeKey,
          name: {
            en: CustomFields.capturePayment.name.en,
            de: CustomFields.capturePayment.name.de,
          },
          resourceTypeIds: [CustomFields.capturePayment.resourceTypeId],
          fieldDefinitions: customFields,
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
    customFields.forEach((field) => {
      actions.push({
        action: 'addFieldDefinition',
        fieldDefinition: field,
      });
    });

    await apiRoot
      .types()
      .withKey({ key: CustomFields.capturePayment.typeKey })
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
