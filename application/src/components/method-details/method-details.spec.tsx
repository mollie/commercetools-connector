import {
  screen,
  render,
} from '@commercetools-frontend/application-shell/test-utils';
import { setupServer } from 'msw/node';
import { Suspense } from 'react';
import { MemoryRouter } from 'react-router';
import { IntlProvider } from 'react-intl';
import MethodDetails from './method-details';
import {
  useCustomObjectDetailsFetcher,
  useCustomObjectDetailsUpdater,
} from '../../hooks/use-custom-objects-connector';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { useIsAuthorized } from '@commercetools-frontend/permissions';

jest.mock('../../hooks/use-custom-objects-connector', () => ({
  useCustomObjectDetailsFetcher: jest.fn(),
  useCustomObjectDetailsUpdater: jest.fn(),
}));
jest.mock('@commercetools-frontend/application-shell-connectors', () => ({
  useApplicationContext: jest.fn(),
}));
jest.mock('@commercetools-frontend/actions-global', () => ({
  useShowNotification: jest.fn(),
}));
jest.mock('@commercetools-frontend/permissions', () => ({
  useIsAuthorized: jest.fn(),
}));

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

describe('Test method-details.tsx', () => {
  beforeEach(() => {
    (useCustomObjectDetailsFetcher as jest.Mock).mockReturnValue({
      loading: true,
      error: null,
      method: {
        id: '43c3f945-c429-4719-878f-008cd507c581',
        container: 'sctm-app-methods',
        key: 'creditcard',
        value: {
          id: 'creditcard',
          technicalName: 'Card',
          name: {
            'en-GB': 'Card',
            'de-DE': 'Card',
            'en-US': 'Card',
            'de-AT': 'Card',
            'it-IT': 'Card',
            'pl-PL': 'Card',
          },
          description: {
            'en-GB': '',
            'de-DE': '',
            'en-US': '',
            'de-AT': '',
            'it-IT': '',
            'pl-PL': '',
          },
          imageUrl:
            'https://www.mollie.com/external/icons/payment-methods/creditcard.svg',
          status: 'Inactive',
          displayOrder: 0,
          displayCardComponent: false,
        },
        __typename: 'CustomObject',
      },
    });

    (useApplicationContext as jest.Mock).mockReturnValue({
      dataLocale: 'de',
      projectLanguages: ['de'],
    });

    (useShowNotification as jest.Mock).mockReturnValue(jest.fn());

    (useIsAuthorized as jest.Mock).mockReturnValue(true);

    (useCustomObjectDetailsUpdater as jest.Mock).mockReturnValue({
      execute: jest.fn().mockResolvedValue({}),
    });
  });

  it('should render method details page', async () => {
    render(
      <MemoryRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <IntlProvider locale="en" messages={{}}>
            <MethodDetails onClose={jest.fn()} />
          </IntlProvider>
        </Suspense>
      </MemoryRouter>
    );

    screen.getAllByText('Card').forEach((element: unknown) => {
      expect(element).toBeInTheDocument();
    });
  });
});
