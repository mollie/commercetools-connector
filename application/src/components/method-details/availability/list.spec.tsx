import {
  screen,
  render,
} from '@commercetools-frontend/application-shell/test-utils';
import { Suspense } from 'react';
import { MemoryRouter } from 'react-router';
import { IntlProvider } from 'react-intl';
import AvailabilityList from './list';
import { TFetchCustomObjectDetailsQuery } from '../../../types/generated/ctp';

describe('test MethodDetails.tsx', () => {
  it('test render', async () => {
    const pricingConstraints = [
      {
        id: 1,
        currency: 'GBP1',
        country: 'UK1',
        minAmount: 100,
        maxAmount: 2000,
        surchargeCost: '2%',
      },
      {
        id: 2,
        currency: 'GBP2',
        country: 'DE2',
        minAmount: 1000,
        maxAmount: 30000,
        surchargeCost: '4%',
      },
      {
        id: 3,
        currency: 'EUR3',
        country: 'DE3',
        minAmount: 500,
        maxAmount: 10000,
        surchargeCost: '2 % + € 0,35',
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
      ({ currency, country, minAmount, maxAmount, surchargeCost }) => {
        expect(screen.getByText(currency)).not.toBeNull();
        expect(screen.getByText(country)).not.toBeNull();
        expect(screen.getByText(minAmount)).not.toBeNull();
        expect(screen.getByText(maxAmount)).not.toBeNull();
        expect(screen.getByText(surchargeCost)).not.toBeNull();
      }
    );
  });
});
