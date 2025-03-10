import {
  render,
  screen,
} from '@commercetools-frontend/application-shell/test-utils';
import { Suspense } from 'react';
import { MemoryRouter } from 'react-router';
import { IntlProvider } from 'react-intl';
import AvailabilityList from './list';
import { TFetchCustomObjectDetailsQuery } from '../../../types/generated/ctp';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useMcMutation } from '@commercetools-frontend/application-shell';
import { useShowNotification } from '@commercetools-frontend/actions-global';

jest.mock('@commercetools-frontend/application-shell-connectors', () => ({
  useApplicationContext: jest.fn(),
}));
jest.mock('@commercetools-frontend/application-shell', () => ({
  useMcMutation: jest.fn(),
}));
jest.mock('@commercetools-frontend/actions-global', () => ({
  useShowNotification: jest.fn(),
}));

describe('test MethodDetails.tsx', () => {
  it('test render', async () => {
    const pricingConstraints = [
      {
        id: 1,
        currencyCode: 'GBP1',
        countryCode: 'UK1',
        minAmount: 100,
        maxAmount: 2000,
        surchargeCost: {
          percentageAmount: 2,
          renderedText: '2%',
        },
      },
      {
        id: 2,
        currencyCode: 'GBP2',
        countryCode: 'DE2',
        minAmount: 1000,
        maxAmount: 30000,
        surchargeCost: {
          percentageAmount: 4,
          renderedText: '4%',
        },
      },
      {
        id: 3,
        currencyCode: 'EUR3',
        countryCode: 'DE3',
        minAmount: 500,
        maxAmount: 10000,
        surchargeCost: {
          percentageAmount: 2,
          fixedAmount: 100,
          renderedText: '2% + 100EUR3',
        },
      },
    ];

    const methodDetail: TFetchCustomObjectDetailsQuery['customObject'] = {
      __typename: 'CustomObject',
      id: 'test-method-details-id',
      container: 'sctm-app-container',
      key: 'test-method-details-key',
      value: {
        id: 'applepay',
        name: {
          'en-US': 'Apple Pay',
          'en-GB': 'Apple Pay',
          'de-DE': 'Apple Pay',
        },
        description: {
          'en-US': 'Apple Pay',
          'en-GB': 'Apple Pay',
          'de-DE': 'Apple Pay',
        },
        imageUrl:
          'https://www.mollie.com/external/icons/payment-methods/applepay.svg',
        status: 'Inactive',
        displayOrder: 0,
        pricingConstraints,
      } as unknown as string,
    };

    (useApplicationContext as jest.Mock).mockReturnValue({
      dataLocale: 'de',
      projectLanguages: ['de'],
      projectCurrencies: ['GBP1', 'GBP2', 'EUR3'],
      projectCountries: ['UK1', 'DE2', 'DE3'],
    });

    (useMcMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValue({}),
      {
        loading: false,
      },
    ]);

    (useShowNotification as jest.Mock).mockReturnValue(jest.fn());

    render(
      <MemoryRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <IntlProvider
            locale="en"
            messages={{ title: 'Mollie payment methods' }}
          >
            <AvailabilityList paymentMethodDetails={methodDetail} />
          </IntlProvider>
        </Suspense>
      </MemoryRouter>
    );

    pricingConstraints.forEach(
      ({ currencyCode, countryCode, minAmount, maxAmount, surchargeCost }) => {
        expect(screen.getByText(currencyCode)).not.toBeNull();
        expect(screen.getByText(countryCode)).not.toBeNull();
        expect(screen.getByText(minAmount)).not.toBeNull();
        expect(screen.getByText(maxAmount)).not.toBeNull();
        expect(screen.getByText(surchargeCost.renderedText)).not.toBeNull();
      }
    );
  });
});
