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
    project: {
      countries: ['DE'],
      currencies: ['EUR'],
      languages: ['en'],
    },
    dataLocale: 'en',
  }),
}));

jest.mock('@commercetools-frontend/actions-global', () => ({
  useShowNotification: jest.fn(),
}));

const initialValues: TMethodObjectValueFormValues = {
  name: { en: 'Test Method' },
  description: { en: 'Test Description' },
  displayOrder: 1,
  id: 'creditcard',
  imageUrl: 'http://example.com/image.png',
  pricingConstraints: [],
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
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('description-input')).toBeInTheDocument();
  });
});
