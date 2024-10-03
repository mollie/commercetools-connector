import {
  screen,
  mapResourceAccessToAppliedPermissions,
  type TRenderAppWithReduxOptions,
} from '@commercetools-frontend/application-shell/test-utils';
import { renderApplicationWithRedux } from '../../test-utils';
import { entryPointUriPath, PERMISSIONS } from '../../constants';
import ApplicationRoutes from '../../routes';
import { setupServer } from 'msw/node';
import { graphql } from 'msw';
import * as CustomObject from '@commercetools-test-data/custom-object';
import { buildGraphqlList } from '@commercetools-test-data/core';
import { TCustomObject } from '@commercetools-test-data/custom-object';

const mockServer = setupServer();
afterEach(() => mockServer.resetHandlers());
beforeAll(() =>
  mockServer.listen({
    onUnhandledRequest: 'error',
  })
);
afterAll(() => {
  mockServer.close();
});

const renderApp = (options: Partial<TRenderAppWithReduxOptions> = {}) => {
  const route = options.route || `/shopm-adv-dev/${entryPointUriPath}`;
  const { history } = renderApplicationWithRedux(<ApplicationRoutes />, {
    route,
    project: {
      allAppliedPermissions: mapResourceAccessToAppliedPermissions([
        PERMISSIONS.Manage,
      ]),
    },
    ...options,
  });

  return { history };
};

describe('Test welcome.tsx', () => {
  it('should render welcome page', async () => {
    mockServer.use(
      graphql.query('FetchCustomObjectsQuery', (req, res, ctx) => {
        const totalItems = 1;
        const itemsPerPage = 1;
        return res(
          ctx.data({
            customObjects: buildGraphqlList<TCustomObject>(
              Array.from({ length: itemsPerPage }).map((_, index) =>
                CustomObject.random()
                  .id(`id-${index}`)
                  .key(`paypal`)
                  .container('sctm-app-methods')
                  .value({
                    id: 'paypal',
                    description: 'Paypal',
                    status: 'Active',
                    displayOrder: 0,
                    image:
                      'https://www.paypalobjects.com/webstatic/mktg/logo-center/logo_paypal_center_150x40.png',
                  })
              ),
              {
                name: 'CustomObject',
                total: totalItems,
              }
            ),
          })
        );
      })
    );
    renderApp();
    await screen.findByText('Mollie payment methods');
  });
});
