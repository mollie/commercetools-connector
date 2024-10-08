import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
  PageNotFound,
  CustomFormModalPage,
} from '@commercetools-frontend/application-components';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { useCallback } from 'react';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  useCustomObjectDetailsFetcher,
  useCustomObjectDetailsUpdater,
} from '../../hooks/use-custom-objects-connector';
import messages from './messages';
import MethodDetailsForm from './method-details-form';
import { TMethodObjectValueFormValues } from '../../types';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import {
  DOMAINS,
  NOTIFICATION_KINDS_SIDE,
} from '@commercetools-frontend/constants';
import SelectField from '@commercetools-uikit/select-field';
import { ApplicationPageTitle } from '@commercetools-frontend/application-shell';

type TMethodDetailsProps = {
  onClose: () => void;
};

const MethodDetails = (props: TMethodDetailsProps) => {
  const intl = useIntl();
  const params = useParams<{ id: string }>();
  const { loading, error, method } = useCustomObjectDetailsFetcher(params.id);
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const customObjectUpdater = useCustomObjectDetailsUpdater();
  const showNotification = useShowNotification();
  const canManage = true;

  const handleSubmit = async (formikValues: TMethodObjectValueFormValues) => {
    try {
      if (method?.container && method?.key && formikValues) {
        await customObjectUpdater.execute({
          container: method.container,
          key: method.key,
          value: JSON.stringify(formikValues),
        });
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.methodDetailsUpdated, {
            methodName: formikValues.description,
          }),
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = async (
    status: string,
    formikValues: TMethodObjectValueFormValues
  ) => {
    try {
      if (method?.container && method?.key && formikValues) {
        await customObjectUpdater.execute({
          container: method?.container,
          key: method?.key,
          value: JSON.stringify({
            id: formikValues.id,
            description: formikValues.description,
            status: status,
            imageUrl: formikValues.imageUrl,
            displayOrder: formikValues.displayOrder,
          }),
        });
        showNotification({
          kind: NOTIFICATION_KINDS_SIDE.success,
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.methodDetailsStatusUpdated, {
            methodName: formikValues.description,
            status: status === 'Active' ? 'activated' : 'deactivated',
          }),
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitCallback = useCallback(handleSubmit, [
    method,
    customObjectUpdater,
    showNotification,
    intl,
  ]);
  const handleChangeCallback = useCallback(handleChange, [
    customObjectUpdater,
    intl,
    method?.container,
    method?.key,
    showNotification,
  ]);

  return (
    <MethodDetailsForm
      initialValues={method?.value as unknown as TMethodObjectValueFormValues}
      onSubmit={handleSubmitCallback}
      isReadOnly={!canManage}
      dataLocale={dataLocale}
    >
      {(formProps) => {
        return (
          <CustomFormModalPage
            title={formProps.values?.description ?? ''}
            isOpen
            onClose={() => props.onClose()}
            formControls={
              <>
                <SelectField
                  title=""
                  name="status"
                  value={formProps.values.status}
                  onChange={(event) => {
                    handleChangeCallback(
                      event.target.value as string,
                      formProps.values as TMethodObjectValueFormValues
                    );
                  }}
                  options={[
                    {
                      options: [
                        { value: 'Active', label: 'Active' },
                        { value: 'Inactive', label: 'Inactive' },
                      ],
                    },
                  ]}
                  horizontalConstraint={4}
                  controlShouldRenderValue={true}
                  data-cy={'active-select'}
                  isSearchable={false}
                ></SelectField>
                <CustomFormModalPage.FormSecondaryButton
                  label={CustomFormModalPage.Intl.revert}
                  onClick={formProps.handleReset}
                  isDisabled={!formProps.isDirty}
                  dataAttributes={{ 'data-cy': 'revert-button' }}
                />
                <CustomFormModalPage.FormPrimaryButton
                  label={CustomFormModalPage.Intl.save}
                  onClick={() => formProps.submitForm()}
                  isDisabled={
                    formProps.isSubmitting || !formProps.isDirty || !canManage
                  }
                  dataAttributes={{ 'data-cy': 'save-button' }}
                />
              </>
            }
          >
            {loading && (
              <Spacings.Stack alignItems="center">
                <LoadingSpinner />
              </Spacings.Stack>
            )}
            {error && (
              <ContentNotification type="error">
                <Text.Body>
                  {intl.formatMessage(messages.methodDetailsErrorMessage)}
                </Text.Body>
              </ContentNotification>
            )}
            {method && formProps.formElements}
            {method && (
              <ApplicationPageTitle
                additionalParts={[formProps.values.description]}
              />
            )}
            {method === null && <PageNotFound />}
          </CustomFormModalPage>
        );
      }}
    </MethodDetailsForm>
  );
};
MethodDetails.displayName = 'MethodDetails';

export default MethodDetails;
