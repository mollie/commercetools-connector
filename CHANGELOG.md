# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## v1.4.0

Added

- Support for payment methods `trustly` `bancomatpay` `mbway` `multibanco` `satispay` `twint` `paybybank` `eps`

## v1.3.1

Fixed

- Mollie's line item for shipping information does not include discounts.

## v1.3.0

Added

- Klarna payment method - this payment method required `captureMode` to be `manual` (refer to this file [CreatePaymentWithSpecificParams.md](./docs//CreatePaymentWithSpecificParams.md) to create payment with custom params)

## v1.2.3

Added

- Capture payment feature

Updated

- Custom type name `sctm_transaction_surcharge_cost` to `sctm_transaction_surcharge_and_capture`
- Added three more custom fields `sctm_should_capture`, `sctm_capture_description`, `sctm_capture_errors`

## v1.2.2

Fixed

- Bugs fixing for custom application unit tests

## v1.2.1

Updated

- Move setting of credit card component visibility and bank transfer payment method due date into the custom application

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

## v1.1.3

Added

- New custom field for transaction: `sctm_transaction_refund_for_mollie_payment` which would store the Mollie Payment ID that need to be refunded

Fixed

[Create Refund](./docs/CreateRefund.md)

- Handling the Refund Creation for the case that the Payment has more than one Success Charge transaction

  - Changing the way to determine the Create Refund action:

    - Before

    ```Typescript
      // processor/src/utils/paymentAction.utils.ts

      if (groups.successCharge.length === 1 && groups.initialRefund.length) {
        return ConnectorActions.CreateRefund;
      }
    ```

    - After

    ```Typescript
      // processor/src/utils/paymentAction.utils.ts

      if (groups.successCharge.length >= 1 && groups.initialRefund.length) {
        return ConnectorActions.CreateRefund;
      }
    ```

  - We are supporting to create the refund for the payment which has more than one Success Charge transactions
  - By default, we will create the Refund for the latest Success Charge transaction. For example:

    ```Typescript
    // CommerceTools Payment
    {
      id: 'payment-id',
      transactions: [
        {
          type: 'Charge',
          state: 'Success',
          interactionId: 'tr_123456' // Mollie Payment ID
        },
        {
          type: 'Charge',
          state: 'Success',
          interactionId: 'tr_999999' // Mollie Payment ID
        },
        {
          type: 'Refund',
          state: 'Initial', // Creating a Refund for the Mollie Payment tr_999999
        },
      ]
    }
    ```

  - However, you can also specify the Mollie Payment ID (which stored in the `interactionId` of the Success Charge transaction) that you want to create a refund for by adding the Mollie Payment ID to the custom field `sctm_transaction_refund_for_mollie_payment` of the Initial Refund transaction. For example:

    ```Typescript
    // CommerceTools Payment
    {
      id: 'payment-id',
      transactions: [
        {
          type: 'Charge',
          state: 'Success',
          interactionId: 'tr_123456' // Mollie Payment ID
        },
        {
          type: 'Charge',
          state: 'Success',
          interactionId: 'tr_999999' // Mollie Payment ID
        },
        {
          type: 'Refund',
          state: 'Initial',
          custom: {
            type: {
              ...
            },
            fields: {
              sctm_transaction_refund_for_mollie_payment: 'tr_123456' // Creating a Refund for the Mollie Payment tr_123456
            }
          }
        },
      ]
    }
    ```

[Cancel Refund](./docs/CancelPaymentRefund.md)

- Following the changes for creating refund, we also updated the handler for Refund Cancellation to match with the above changes

  - Changing the way to determine the Cancel Refund action:

    - Before

    ```Typescript
      // processor/src/utils/paymentAction.utils.ts

      if (
        groups.successCharge.length === 1 &&
        groups.pendingRefund.length === 1 &&
        groups.initialCancelAuthorization.length === 1
      ) {
        return ConnectorActions.CancelRefund;
      }
    ```

    - After

    ```Typescript
      // processor/src/utils/paymentAction.utils.ts

      if (
        groups.successCharge.length >= 1 &&
        groups.pendingRefund.length >= 1 &&
        groups.initialCancelAuthorization.length === 1
      ) {
        return ConnectorActions.CancelRefund;
      }
    ```

  - To support the old versions, we will create the cancellation for the latest Pending Refund transaction (which is a pending refund for the latest Success Charge transaction in that payment). For example:

    ```Typescript
    // CommerceTools Payment
    {
      id: 'payment-id',
      transactions: [
        {
          type: 'Charge',
          state: 'Success',
          interactionId: 'tr_123456' // Mollie Payment ID
        },
        {
          type: 'Charge',
          state: 'Success',
          interactionId: 'tr_999999' // Mollie Payment ID
        },
        {
          id: 'refund-transaction-1',
          type: 'Refund',
          state: 'Pending',
          interactionId: 're_123456', // Mollie Refund ID
        },
        {
          id: 'refund-transaction-2',
          type: 'Refund',
          state: 'Pending',
          interactionId: 're_999999', // Mollie Refund ID
        },
        {
          type: 'CancelAuthorization',
          state: 'Initial'
          // interactionId is not set
        }
      ]
    }

    // In this case, this will be considered as a Cancellation request for the Pending Refund with id: refund-transaction-2
    ```

    **_Note:_ The above solution is just for supporting the old versions and will be remove in the near future (in next versions). From this version, please follow the below solution.**

  - However, to do it in a correct way, from this version, you should specify the Mollie Refund ID (which stored in the `interactionId` of the Pending Refund transaction) that you want to cancel by putting it in the `interactionId` of the Initial CancelAuthorization. For example:

    ```Typescript
    // CommerceTools Payment
    {
      id: 'payment-id',
      transactions: [
        {
          type: 'Charge',
          state: 'Success',
          interactionId: 'tr_123456' // Mollie Payment ID
        },
        {
          type: 'Charge',
          state: 'Success',
          interactionId: 'tr_999999' // Mollie Payment ID
        },
        {
          id: 'refund-transaction-1',
          type: 'Refund',
          state: 'Pending',
          interactionId: 're_123456', // Mollie Refund ID
        },
        {
          id: 'refund-transaction-2',
          type: 'Refund',
          state: 'Pending',
          interactionId: 're_999999', // Mollie Refund ID
        },
        {
          type: 'CancelAuthorization',
          state: 'Initial',
          interactionId: 're_123456' // Mollie Refund ID that you want to cancel
        }
      ]
    }

    // In this case, this will be considered as a Cancellation request for the Pending Refund with id: refund-transaction-1
    ```

## v1.1.2

Added

- Add configuration to enable authorization mode
- OAuth middleware for securing connector endpoint

## v1.1.1

Fixed

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

Fixed

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
