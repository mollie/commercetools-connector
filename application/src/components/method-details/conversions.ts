import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import type { TFetchChannelDetailsQuery, TFetchCustomObjectDetailsQuery } from '../../types/generated/ctp';
import type { TMethodObjectFormValues, TFormValues, TMethodObjectValueFormValues } from '../../types';

export const docToFormValues = (
  channel: TFetchChannelDetailsQuery['channel'],
  languages: string[]
): TFormValues => ({
  key: channel?.key ?? '',
  roles: channel?.roles ?? [],
  name: LocalizedTextInput.createLocalizedString(
    languages,
    transformLocalizedFieldToLocalizedString(channel?.nameAllLocales ?? []) ??
    {}
  ),
});

export const formValuesToDoc = (formValues: TFormValues) => ({
  name: LocalizedTextInput.omitEmptyTranslations(formValues.name),
  key: formValues.key,
  roles: formValues.roles,
});

export const formValuesToMethodDoc = (formValues: TMethodObjectValueFormValues) => ({
  value: formValues,
});

export const methodDocToFormValues = (
  methodDoc: TFetchCustomObjectDetailsQuery['customObject']
): TMethodObjectFormValues => {
  return {
    id: methodDoc?.id ?? '',
    container: methodDoc?.container ?? '',
    key: methodDoc?.key ?? '',
    value: methodDoc?.value ?? '',
  }
}