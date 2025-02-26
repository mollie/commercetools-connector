import {
  screen,
  render,
} from '@commercetools-frontend/application-shell/test-utils';
import { setupServer } from 'msw/node';
import ForwardToFixture from '../../../cypress/fixtures/forward-to.json';
import ObjectsPaginated from '../../../cypress/fixtures/objects-paginated.json';
import messages from './messages';
import {
  useCustomObjectsFetcher,
  useCustomObjectDetailsUpdater,
} from '../../hooks/use-custom-objects-connector/index';
import { useExtensionDestinationFetcher } from '../../hooks/use-extensions-connector';
import { usePaymentMethodsFetcher } from '../../hooks/use-mollie-connector';
import Welcome from '.';
import { Suspense } from 'react';
import { MemoryRouter } from 'react-router';
import { IntlProvider } from 'react-intl';

jest.mock('../../hooks/use-custom-objects-connector', () => ({
  useCustomObjectsFetcher: jest.fn(),
  useCustomObjectDetailsUpdater: jest.fn(),
}));
jest.mock('../../hooks/use-extensions-connector', () => ({
  useExtensionDestinationFetcher: jest.fn(),
}));
jest.mock('../../hooks/use-mollie-connector', () => ({
  usePaymentMethodsFetcher: jest.fn(),
}));

const mockMethods = ForwardToFixture._embedded.methods.map((method) => {
  return {
    id: method.id,
    description: {
      'en-GB': '',
    },
    name: {
      'de-DE': method.description,
      'en-GB': method.description,
    },
    status: method.status === 'active' ? 'Active' : 'Inactive',
    imageUrl: method.image.svg,
    displayOrder: 0,
    pricingConstrains: [],
  };
});

const mockColumns = Object.values(messages)
  .filter((message) =>
    [
      'Welcome.statusHeader',
      'Welcome.nameHeader',
      'Welcome.iconHeader',
      'Welcome.displayOrderHeader',
    ].includes(message.id)
  )
  .map((message) => message.defaultMessage);

const mockServer = setupServer();
afterEach(() => mockServer.resetHandlers());
beforeEach(() => {
  (useCustomObjectsFetcher as jest.Mock).mockReturnValue({
    customObjectsPaginatedResult: ObjectsPaginated,
    error: null,
    loading: false,
    refetch: jest.fn().mockReturnValue(ObjectsPaginated),
  });

  (useExtensionDestinationFetcher as jest.Mock).mockReturnValue({
    extension: { destination: { url: 'https://example.com' } },
  });

  (usePaymentMethodsFetcher as jest.Mock).mockReturnValue({
    fetchedData: mockMethods,
    fetchedDataLoading: false,
  });

  (useCustomObjectDetailsUpdater as jest.Mock).mockReturnValue({
    execute: jest.fn().mockResolvedValue({}),
  });
});
beforeAll(() =>
  mockServer.listen({
    onUnhandledRequest: 'error',
  })
);
afterAll(() => {
  mockServer.close();
});

describe('Test welcome.tsx', () => {
  it('should render welcome page', async () => {
    render(
      <MemoryRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <IntlProvider
            locale="en"
            messages={{ title: 'Mollie payment methods' }}
          >
            <Welcome />
          </IntlProvider>
        </Suspense>
      </MemoryRouter>
    );

    await screen.findByText(messages.title.defaultMessage);
    expect(screen.getByTestId('title')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();

    mockColumns.forEach((column) => {
      expect(screen.getByText(column)).toBeInTheDocument();
    });

    expect(screen.getByTestId('status-tooltip')).toBeInTheDocument();

    mockMethods.forEach((method) => {
      expect(
        screen.getByTestId(`name-column-${method.id}`)
      ).toBeInTheDocument();
    });
  });

  it('should render no data notification', async () => {
    (usePaymentMethodsFetcher as jest.Mock).mockReturnValue({
      fetchedData: [],
      fetchedDataLoading: false,
    });

    render(
      <MemoryRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <IntlProvider
            locale="en"
            messages={{ title: 'Mollie payment methods' }}
          >
            <Welcome />
          </IntlProvider>
        </Suspense>
      </MemoryRouter>
    );

    expect(screen.getByTestId('no-data-notification')).toBeInTheDocument();
  });
});
