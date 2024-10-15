import { useIntl } from 'react-intl';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import {
  PageNotFound,
  CustomFormModalPage,
  TabularModalPage,
  TabHeader,
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
  NO_VALUE_FALLBACK,
  NOTIFICATION_KINDS_SIDE,
} from '@commercetools-frontend/constants';
import SelectField from '@commercetools-uikit/select-field';
import { ApplicationPageTitle } from '@commercetools-frontend/application-shell';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../constants';
import { formatLocalizedString } from '@commercetools-frontend/l10n';

type TMethodDetailsProps = {
  onClose: () => void;
};

const MethodDetails = (props: TMethodDetailsProps) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const params = useParams<{ id: string }>();
  const { loading, error, method } = useCustomObjectDetailsFetcher(params.id);
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const customObjectUpdater = useCustomObjectDetailsUpdater();
  const showNotification = useShowNotification();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });

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
            methodName: formatLocalizedString(
              {
                name: formikValues.name,
              },
              {
                key: 'name',
                locale: dataLocale,
                fallbackOrder: projectLanguages,
                fallback: NO_VALUE_FALLBACK,
              }
            ),
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
        let clonedValues = { ...formikValues, ...{ status: status } };
        await customObjectUpdater.execute({
          container: method?.container,
          key: method?.key,
          value: JSON.stringify(clonedValues),
        });
        showNotification({
          kind: NOTIFICATION_KINDS_SIDE.success,
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.methodDetailsStatusUpdated, {
            methodName: formatLocalizedString(
              {
                name: formikValues.name,
              },
              {
                key: 'name',
                locale: dataLocale,
                fallbackOrder: projectLanguages,
                fallback: NO_VALUE_FALLBACK,
              }
            ),
            status: status === 'Active' ? 'activated' : 'deactivated',
          }),
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitCallback = useCallback(handleSubmit, [
    method?.container,
    method?.key,
    customObjectUpdater,
    showNotification,
    intl,
    dataLocale,
    projectLanguages,
  ]);
  const handleChangeCallback = useCallback(handleChange, [
    customObjectUpdater,
    dataLocale,
    intl,
    method?.container,
    method?.key,
    projectLanguages,
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
        const methodName = formatLocalizedString(
          {
            name: formProps.values?.name,
          },
          {
            key: 'name',
            locale: dataLocale,
            fallbackOrder: projectLanguages,
            fallback: NO_VALUE_FALLBACK,
          }
        );
        return (
          <TabularModalPage
            title={methodName}
            isOpen
            onClose={() => props.onClose()}
            tabControls={
              <>
                <TabHeader
                  to={`${match.url}/general`}
                  label="General"
                  exactPathMatch={true}
                />
                <TabHeader
                  isDisabled={true}
                  to={`${match.url}/icon`}
                  label="Icon"
                />
                <TabHeader
                  isDisabled={false}
                  to={`${match.url}/availability`}
                  label="Availability"
                  exactPathMatch={true}
                />
              </>
            }
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
                  data-testid={'status-select'}
                  isSearchable={false}
                ></SelectField>
                <CustomFormModalPage.FormSecondaryButton
                  label={CustomFormModalPage.Intl.revert}
                  onClick={formProps.handleReset}
                  isDisabled={!formProps.isDirty}
                  dataAttributes={{ 'data-testid': 'revert-button' }}
                />
                <CustomFormModalPage.FormPrimaryButton
                  label={CustomFormModalPage.Intl.save}
                  onClick={() => formProps.submitForm()}
                  isDisabled={
                    formProps.isSubmitting || !formProps.isDirty || !canManage
                  }
                  dataAttributes={{ 'data-testid': 'save-button' }}
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
            {method && <ApplicationPageTitle additionalParts={[methodName]} />}
            {method === null && <PageNotFound />}
            <Switch>
              <Route path={`${match.path}/general`}>
                {method && formProps.formElements}
              </Route>
              <Route path={`${match.path}/icon`}>
                <div>Icon</div>
              </Route>
              <Route path={`${match.path}/availability`}>
                <div>Availability</div>
              </Route>
            </Switch>
          </TabularModalPage>
        );
      }}
    </MethodDetailsForm>
  );
};
MethodDetails.displayName = 'MethodDetails';

export default MethodDetails;
