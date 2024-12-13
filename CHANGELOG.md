# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## v1.2.0

Added

- Mollie custom application

Updated

- [getPaymentMethods](/docs/GetPaymentMethods.md) response has new returned format as follow

  ```Typescript
  {
      id: string,
      name: Record<string, string>
      description: Record<string, string>
      image: string;
      order: number;
  }

  // e.g.
  {
    id: 'paypal',
    name: {
        'en-GB': 'PayPal',
        'de-DE': 'PayPal',
    },
    description: {
        'en-GB': '',
        'de-DE': '',
    },
    image: 'https://example.img/paypal.svg',
    order: 1
  }
  ```

## v1.1.2

Added

- Add configuration to enable authorization mode
- OAuth middleware for securing connector endpoint

## v1.1.1

Fixes

- Type converting issue in payment method listing endpoint

## v1.1.0

Added

- DockerImage for self hosting on AWS
- Installation endpoint for required configurations

## v1.0.4

Added

- Add configuration to enable authorization mode
- OAuth middleware for securing connector endpoint

## v1.0.3

Added

- Add docs for status checking endpoint
- Endpoints for checking connector statuses

## v1.0.2

Fixes

- Fix the issue that the payment method is not correctly set in some cases

## v1.0.1

Added

- Changelog

Updated

- Postman collection
- Interface interaction field naming to differentiate the connector itself to others

## v1.0.0

Added

- General configurations for Commercetools, Mollie and connector related
- Package version for requests
- Log mechanism
- Supporting payment methods namely:
  - [Apple pay](https://docs.mollie.com/docs/apple-pay)
  - [Bancontact](https://docs.mollie.com/docs/bancontact)
  - [BLIK](https://docs.mollie.com/docs/blik)
  - [Credit/debit card](https://docs.mollie.com/docs/cards)
  - [Gift cards](https://docs.mollie.com/docs/giftcards)
  - [iDEAL](https://docs.mollie.com/docs/ideal)
  - [KBC/CBC](https://docs.mollie.com/docs/kbc)
  - [Paypal](https://docs.mollie.com/docs/paypal)
  - [Przelewy24](https://docs.mollie.com/docs/przelewy24)
- Supporting for [Apply pay direct](https://docs.mollie.com/docs/direct-integration-of-apple-pay) & [Mollie card component](https://docs.mollie.com/docs/mollie-components)
- Filter options for listing payment methods
- Create/cancel payment via Payment API
- Refund/cancel refund payment via Refund API
- Webhooks for payment status update, cancel payment, refund payment
- Unit tests via Jest
- Possibility to manage the due date period for bank transfering
- Postman collection for developers
