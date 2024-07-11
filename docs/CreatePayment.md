# Create Payment

  * [Overview](#overview)
  * [Parameters map](#parameters-map)
  * [Representation: CommerceTools Payment](#representation-ct-payment)
  * [Creating commercetools actions from Mollie's response](#creating-commercetools-actions-from-mollies-response)

## Overview

This functionality is used to create a new Payment on Mollie:

This calls Mollie's [create payment](https://docs.mollie.com/reference/create-payment) endpoint.

<br />

**Conditions**

Adding a new transaction to an existing order with status `Initial` triggers create order payment. The transaction type should align with the payment method. 


<br />

## Parameters map

| CT `Payment` object                                                                                       | Parameter (Mollie Payment)                   | Required |
|-----------------------------------------------------------------------------------------------------------|----------------------------------------------|----------|
| `paymentMethodInfo.method: "applepay"`                                                                    | `method: applepay`                           | YES      |
| `amountPlanned.currencyCode: "EUR"`                                                                       | `amount.currency: EUR`                       | YES      |
| `amountPlanned.centAmount: "1000"` and `amountPlanned.fractionDigits: "2"`                                | `amount.value: "10.00"`                      | YES      |
| `custom.fields.sctm_create_payment_request.redirectUrl: "https://webshop.example.org/order/12345/"`       | `redirectUrl: "https://webshop.example.org/order/12345/"`                      | YES      |
| `custom.fields.sctm_create_payment_request.webhookUrl: "https://webshop.example.org/payments/webhook/"`   | `redirectUrl: "https://webshop.example.org/payments/webhook/"`                      | NO      |

The others params which listed [here](https://docs.mollie.com/reference/create-payment) can be passed through the custom field of the Payment object name **sctm_create_payment_request** with exactly
the same format like those 2 fields ``redirectUrl`` and ``webhookUrl`` above

<br />

## Representation: CommerceTools Payment  

<details>
  <summary>Example CommerceTools Payment object triggering creating a Mollie Payment</summary>

```json
{
  "key" : "000047",
  "amountPlanned" : {
    "currencyCode" : "EUR",
    "centAmount" : 1000,
    "fractionDigits": 2
  },
  "paymentMethodInfo" : {
    "paymentInterface" : "Mollie",
    "method" : "creditcard",
    "name" : {
      "en" : "Credit Card"
    }
  },
  "transactions" : [ {
    "timestamp" : "2015-10-20T08:54:24.000Z",
    "type" : "Charge",
    "amount" : {
      "currencyCode" : "USD",
      "centAmount" : 1000
    },
    "state" : "Initial"
  } ],
  "custom": {
    "type": {
        "typeId": "type",
        "key": "sctm-payment-custom-fields"
    },
    "fields": {
        "sctm_create_payment_request": "{\"description\":\"Test\",\"locale\":\"en_GB\",\"redirectUrl\":\"https://www.google.com/\"}"
    }
  }
}
```
</details>
<br />

## Creating CommerceTools actions from Mollie's response

When create order payment is successfully added on Mollie, we update CommerceTools payment with following actions

| Action name (CT)                 | Value                                                                      |
| -------------------------------- | -------------------------------------------------------------------------- |
| `changeTransactionState`         | `createOrderPaymentResponse: <transactionId>, state: 'Pending'`            |
| `changeTransactionTimestamp`     | `createOrderPaymentResponse: <createdAt>`                                  |
| `changeTransactionInteractionId` | `transactionId: <initial CT transaction ID>` *                             |
|                                  | `interactionId: <mollie payment ID>`                                       |
| `addInterfaceInteraction`        | `actionType: "CreateOrderPayment"`                                         |
|                                  | `id: <UUID>`                                                               |
|                                  | `timestamp: <createdAt>`                                                   |
|                                  | `requestValue: {<transactionId, paymentMethod>`                            |
|                                  | `responseValue: <molliePaymentId, checkoutUrl, transactionId>`             |

\* Actions will always use first `Initial` transaction. There should only be one per payment. Transaction id will be the ID of the transaction which triggered the create payment.