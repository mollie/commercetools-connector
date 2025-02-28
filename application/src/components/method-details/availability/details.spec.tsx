import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AvailabilityDetails from './details';
import { TMethodObjectValueFormValues } from '../../../types';
import { IntlProvider } from 'react-intl';

jest.mock('../../../hooks/use-custom-objects-connector', () => ({
  useCustomObjectDetailsUpdater: jest.fn(),
}));

jest.mock('@commercetools-frontend/application-shell-connectors', () => ({
  useApplicationContext: jest.fn().mockReturnValue({
    dataLocale: 'de-DE',
    projectCountries: [
      'GB',
      'DE',
      'PL',
      'CH',
      'IT',
      'NL',
      'AT',
      'ES',
      'BE',
      'FR',
      'PT',
    ],
    projectCurrencies: ['EUR', 'GBP', 'PLN', 'CHF'],
    projectLanguages: [
      'en-GB',
      'de-DE',
      'pl-PL',
      'fr-FR',
      'de-CH',
      'nl-NL',
      'de-BE',
      'es-ES',
      'de-AT',
      'pt-PT',
      'it-IT',
    ],
  }),
}));

jest.mock('@commercetools-frontend/actions-global', () => ({
  useShowNotification: jest.fn(),
}));

const initialValues: TMethodObjectValueFormValues = {
  name: { en: 'Test Method', de: 'Test Methode' },
  description: { en: 'Test Description', de: 'Test Beschreibung' },
  displayOrder: 1,
  id: 'creditcard',
  imageUrl: 'http://example.com/image.png',

  pricingConstraints: [
    {
      currencyCode: 'EUR',
      countryCode: 'DE',
      minAmount: 333,
      maxAmount: 999,
    },
  ],
  status: 'active',
};

const renderComponent = (props = {}) => {
  return render(
    <IntlProvider locale="en">
      <AvailabilityDetails
        method={{
          id: 'creditcard',
          container: 'availability',
          key: 'creditcard',
          value: initialValues as unknown as string,
        }}
        formModalState={{ isModalOpen: true, closeModal: jest.fn() }}
        {...props}
      />
    </IntlProvider>
  );
};

describe('AvailabilityDetails', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders form fields correctly', () => {
    renderComponent();

    expect(
      screen.getByTestId('availability-revert-button')
    ).toBeInTheDocument();
    expect(screen.getByTestId('availability-save-button')).toBeInTheDocument();
    expect(
      screen.getByTestId('availability-delete-button')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('money-field-surchargeCost--fixedAmount')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('money-field-surchargeCost--percentageAmount')
    ).toBeInTheDocument();
    expect(screen.getByTestId('select-country')).toBeInTheDocument();
    expect(screen.getByTestId('select-currency')).toBeInTheDocument();
    expect(screen.getByTestId('money-field-minAmount')).toBeInTheDocument();
    expect(screen.getByTestId('money-field-maxAmount')).toBeInTheDocument();
    expect(
      screen.queryByTestId('surcharge-restriction')
    ).not.toBeInTheDocument();
  });
});
