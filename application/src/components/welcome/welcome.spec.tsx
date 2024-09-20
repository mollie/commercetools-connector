import {
  screen,
  mapResourceAccessToAppliedPermissions,
  type TRenderAppWithReduxOptions,
} from '@commercetools-frontend/application-shell/test-utils';
import { renderApplicationWithRedux } from '../../test-utils';
import { entryPointUriPath, PERMISSIONS, projectKey } from '../../constants';
import ApplicationRoutes from '../../routes';

const renderApp = (options: Partial<TRenderAppWithReduxOptions> = {}) => {
  const route = options.route || `/shopm-adv-dev/${entryPointUriPath}`;
  const { history } = renderApplicationWithRedux(<ApplicationRoutes />, {
    route,
    project: {
      allAppliedPermissions: mapResourceAccessToAppliedPermissions([
        PERMISSIONS.View,
      ]),
    },
    ...options,
  });

  return { history };
};

it('should render welcome page', async () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation();

  renderApp();
  await screen.findByText('Mollie');

  logSpy.mockRestore();
});
