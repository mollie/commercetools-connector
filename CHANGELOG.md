# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

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
