import {
  screen,
  mapResourceAccessToAppliedPermissions,
  type TRenderAppWithReduxOptions,
} from '@commercetools-frontend/application-shell/test-utils';
import { renderApplicationWithRedux } from '../../test-utils';
import { entryPointUriPath, PERMISSIONS } from '../../constants';
import ApplicationRoutes from '../../routes';
import messages from './messages';
import { setupServer } from 'msw/node';

const mockServer = setupServer();
afterEach(() => mockServer.resetHandlers());
afterAll(() => {
  mockServer.close();
});

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

describe('Test welcome.tsx', () => {
  it('should render welcome page', async () => {
    renderApp();
    await screen.findByText(messages.title.defaultMessage);
  });
});
