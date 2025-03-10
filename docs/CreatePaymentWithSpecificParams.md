# Create Payment

  * [Overview](#overview)
  * [Parameters map](#parameters-map)
  * [Representation: CommerceTools Payment](#representation-ct-payment)
  * [Creating commercetools actions from Mollie's response](#creating-commercetools-actions-from-mollies-response)

## Overview

Just like [Creating Payment with Credit Card](./CreatePaymentWithCreditCard.md), where the `cardToken` there is a specific params for the method: `creditcard` on Mollie when you are leveraging the Mollie Component to speed up the implementation on your application's Front-end side, Mollie also require some more specific params for the others method which has been pointed out on this [docs](https://docs.mollie.com/reference/extra-payment-parameters)

<br />

**Conditions**

Refer to [CreatePayment.md#conditions](./CreatePayment.md#conditions)

<br />

## Parameters map (e.g, with method: `creditcard`)

| CT `Payment` object                                                                                       | Parameter (Mollie Payment)                   | Required |
|-----------------------------------------------------------------------------------------------------------|----------------------------------------------|----------|
| `paymentMethodInfo.method: "creditcard"`                                                                    | `method: creditcard`                           | YES      |
| `custom.fields.sctm_create_payment_request.cardToken: "card_token_12345"`                                                                    |                         | YES      |
| `amountPlanned.currencyCode: "EUR"`                                                                       | `amount.currency: EUR`                       | YES      |
| `amountPlanned.centAmount: "1000"` and `amountPlanned.fractionDigits: "2"`                                | `amount.value: "10.00"`                      | YES      |
| `custom.fields.sctm_create_payment_request.redirectUrl: "https://webshop.example.org/order/12345/"`       | `redirectUrl: "https://webshop.example.org/order/12345/"`                      | YES      |
| `custom.fields.sctm_create_payment_request.captureMode: "manual"`       | `captureMode: "manual"`                      | NO      |

The others params which listed [here](https://docs.mollie.com/reference/create-payment) can be passed through the custom field of the Payment object name **sctm_create_payment_request** with exactly
the same format like the field ``cardToken`` 

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
        "sctm_create_payment_request": "{\"description\":\"Test\",\"locale\":\"en_GB\",\"redirectUrl\":\"https://www.google.com/\",\"cardToken\":\"card_token_12345\"}"
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
| `changeTransactionState`         | `transactionId: <initialChargeTransactionId>, state: 'Pending'`            |
| `changeTransactionTimestamp`     | `transactionId: <initialChargeTransactionId>, timestamp: <createdAt>`                                  |
| `changeTransactionInteractionId` | `transactionId: <initialChargeTransactionId>, interactionId: <molliePaymentId>` |
| `addInterfaceInteraction`        | `actionType: "CreatePayment", id: <UUID>, timestamp: <createdAt>, requestValue: {<transactionId, paymentMethod>, responseValue: <molliePaymentId, checkoutUrl, transactionId>`                                         |


\* Actions will always use first `Initial` transaction. There should only be one per payment. Transaction id will be the ID of the transaction which triggered the create payment.