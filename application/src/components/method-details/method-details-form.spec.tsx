import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MethodDetailsForm from './method-details-form';
import { TMethodObjectValueFormValues } from '../../types';
import { IntlProvider } from 'react-intl';

const mockSubmit = jest.fn();

const initialValues: TMethodObjectValueFormValues = {
  name: { en: 'Test Method' },
  description: { en: 'Test Description' },
  displayOrder: 1,
  id: 'creditcard',
  imageUrl: 'http://example.com/image.png',
  displayCardComponent: true,
  banktransferDueDate: '',
  status: 'active',
};

const renderComponent = (props = {}) => {
  return render(
    <IntlProvider locale="en">
      <MethodDetailsForm
        onSubmit={mockSubmit}
        initialValues={initialValues}
        isReadOnly={false}
        dataLocale="en"
        {...props}
      >
        {({ formElements, iconElements, submitForm }) => (
          <form onSubmit={submitForm}>
            {formElements}
            {iconElements}
            <button type="submit">Submit</button>
          </form>
        )}
      </MethodDetailsForm>
    </IntlProvider>
  );
};

describe('MethodDetailsForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders form fields correctly', () => {
    renderComponent();

    expect(screen.getByTestId('name-input-en')).toBeInTheDocument();
    expect(screen.getByTestId('description-input-en')).toBeInTheDocument();
    expect(screen.getByTestId('display-order-input')).toBeInTheDocument();
    expect(screen.getByTestId('image-url-input')).toBeInTheDocument();
    expect(screen.getByTestId('image-preview')).toBeInTheDocument();
    expect(screen.getByTestId('display-card-component')).toBeInTheDocument();
    expect(
      screen.queryByTestId('banktransfer-due-date')
    ).not.toBeInTheDocument();
  });
});
