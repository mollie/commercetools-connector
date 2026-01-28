import { CustomFields } from '../utils/constant.utils';
import { createApiRoot } from '../client/create.client';
import { FieldDefinition, Type, TypeUpdateAction } from '@commercetools/platform-sdk';
import {
  getPaymentCustomTypeKey,
  getTransactionCustomTypeKey,
  getInterfaceInteractionCustomTypeKey,
} from '../utils/config.utils';

const paymentFieldDefinitions: FieldDefinition[] = [
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
];

export async function checkIfCustomTypeExistsByKey(typeKey: string): Promise<Type | null> {
  const apiRoot = createApiRoot();

  try {
    const result = await apiRoot.types().withKey({ key: typeKey }).get().execute();
    return result.body;
  } catch (error: any) {
    if (error?.code === 404 || error?.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

export async function createType(
  typeKey: string,
  name: { en: string; de: string },
  resourceTypeIds: string[],
  fieldDefinitions: FieldDefinition[],
): Promise<void> {
  const apiRoot = createApiRoot();

  await apiRoot
    .types()
    .post({
      body: {
        key: typeKey,
        name,
        resourceTypeIds,
        fieldDefinitions,
      },
    })
    .execute();
}

function buildAddFieldActions(
  existingFieldNames: string[],
  newFieldDefinitions: FieldDefinition[],
): TypeUpdateAction[] {
  const missingFields = newFieldDefinitions.filter((field) => !existingFieldNames.includes(field.name));

  return missingFields.map((field) => ({
    action: 'addFieldDefinition' as const,
    fieldDefinition: field,
  }));
}

function buildReplaceFieldActions(
  existingFields: FieldDefinition[],
  newFieldDefinitions: FieldDefinition[],
): TypeUpdateAction[] {
  const actions: TypeUpdateAction[] = [];

  // Remove all existing fields
  existingFields.forEach((definition) => {
    actions.push({
      action: 'removeFieldDefinition' as const,
      fieldName: definition.name,
    });
  });

  // Add all new fields
  newFieldDefinitions.forEach((field) => {
    actions.push({
      action: 'addFieldDefinition' as const,
      fieldDefinition: field,
    });
  });

  return actions;
}

export async function updateType(
  existingType: Type,
  fieldDefinitions: FieldDefinition[],
  options?: { replaceAllFields?: boolean },
): Promise<void> {
  const apiRoot = createApiRoot();
  const typeKey = existingType.key;
  const existingFieldNames = existingType.fieldDefinitions.map((field) => field.name);

  const actions = options?.replaceAllFields
    ? buildReplaceFieldActions(existingType.fieldDefinitions, fieldDefinitions)
    : buildAddFieldActions(existingFieldNames, fieldDefinitions);

  // Early return if no actions needed
  if (actions.length === 0) {
    return;
  }

  await apiRoot
    .types()
    .withKey({ key: typeKey })
    .post({
      body: {
        version: existingType.version,
        actions,
      },
    })
    .execute();
}

// ============================================================================
// EXPORTED FUNCTIONS
// ============================================================================

export async function createCustomPaymentType(): Promise<void> {
  const paymentCustomTypeKey = getPaymentCustomTypeKey();

  const existingType = await checkIfCustomTypeExistsByKey(paymentCustomTypeKey);

  if (!existingType) {
    await createType(
      paymentCustomTypeKey,
      {
        en: 'SCTM - Payment method custom fields',
        de: 'SCTM - Benutzerdefinierte Felder der Zahlungsmethode',
      },
      ['payment'],
      paymentFieldDefinitions,
    );
    return;
  }

  await updateType(existingType, paymentFieldDefinitions);
}

export async function createCustomPaymentInterfaceInteractionType(): Promise<void> {
  const interfaceInteractionCustomTypeKey = getInterfaceInteractionCustomTypeKey();

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

  const existingType = await checkIfCustomTypeExistsByKey(interfaceInteractionCustomTypeKey);

  if (!existingType) {
    await createType(
      interfaceInteractionCustomTypeKey,
      {
        en: 'SCTM - Mollie Payment Interface',
        de: 'SCTM - Benutzerdefinierte Felder im Warenkorb',
      },
      ['payment-interface-interaction'],
      interfaceInteractionFields,
    );
    return;
  }

  await updateType(existingType, interfaceInteractionFields, { replaceAllFields: true });
}

export async function createCustomTransactionType(): Promise<void> {
  const transactionCustomTypeKey = getTransactionCustomTypeKey();

  const existingType = await checkIfCustomTypeExistsByKey(transactionCustomTypeKey);

  if (!existingType) {
    await createType(
      transactionCustomTypeKey,
      {
        en: CustomFields.transactions.name.en,
        de: CustomFields.transactions.name.de,
      },
      [CustomFields.transactions.resourceTypeId],
      Object.values(CustomFields.transactions.fields) as FieldDefinition[],
    );
    return;
  }

  await updateType(existingType, Object.values(CustomFields.transactions.fields) as FieldDefinition[]);
}
