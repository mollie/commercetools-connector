# Cancel Order

  * [Parameters map](#parameters-map)
  * [Representation: CT Payment](#representation-ct-payment)
  * [Creating CommerceTools actions from Mollie's response](#creating-commercetools-actions-from-mollies-response)

## Overview
This functionality is used to cancel the pending payment which is created but not complete yet.

The target Mollie endpoint will be [Cancel Payment](https://docs.mollie.com/reference/cancel-payment).

<br />

## Conditions

In order to use this functionality, the customer must have a payment which is created and not has been paid yet.

Technically, the CommerceTools Payment object needs to include 3 transactions:
- 1 transaction with type = `Authorization`, state = `Pending`. This transaction should also store the targeted Mollie Payment ID in `interactionId`.
- 1 transaction with type = `CancelAuthorization`, state = `Initial`. This transaction is to point out that the customer is wanting to cancel the payment.

From the Mollie side, a payment is marked as cancelable if its `isCancelable` is true. For further information, please have a look at [Mollie docs](https://docs.mollie.com/reference/cancel-payment)

<br />

## Parameters map

Target endpoint: `https://api.mollie.com/v2/payments/{id}`

| CT PendingAuthorization transaction         | Parameter                                   | Required |
|---------------------------------------------|---------------------------------------------|----------|
| `interactionId`                             | `id`                                        | YES      |

<br />

## Connector process

- Detect if the CommerceTools Payment object has satisfied the [conditions](#conditions) above
- If no, the connector should return success response an empty body (no updated actions)
- If yes:
  - The connector will get the Payment ID from PendingAuthorization transaction, use it query to [Mollie Get Payment API](#https://docs.mollie.com/reference/get-payment)
  - Then, it will check if the Payment `isCancelable` is `true`. If it is not, the connector will return error response along with some details message will be save into the App-Log
  - If the Payment `isCancelable` is `true`, the connector will perform a call to the [Cancel Payment endpoint](https://docs.mollie.com/reference/cancel-payment) to cancel the payment.
  - And finally, the connector will return a success response with a list of necessary updated actions including:
    - Change PendingAuthorization transaction state from `Pending` to `Failure`
    - Update PendingAuthorization transaction custom field `sctm_payment_cancel_reason`: store the reason of the cancelling from shop side, and a fixed message to point out that the cancelling was coming from the shop side

## Representation: CT Payment  

<details>
  <summary>Example Payment with to trigger a Payment Cancellation</summary>

```json
{
    "id": "c0887a2d-bfbf-4f77-8f3d-fc33fb4c0920",
    "version": 7,
    "lastMessageSequenceNumber": 4,
    "createdAt": "2021-12-16T08:21:02.813Z",
    "lastModifiedAt": "2021-12-16T08:22:28.979Z",
    "lastModifiedBy": {
        "clientId": "A-7gCPuzUQnNSdDwlOCC",
        "isPlatformClient": false
    },
    "createdBy": {
        "clientId": "A-7gCPuzUQnNSdDwlOCC",
        "isPlatformClient": false
    },
    "key": "ord_5h2f3w",
    "amountPlanned": {
        "type": "centPrecision",
        "currencyCode": "EUR",
        "centAmount": 1604,
        "fractionDigits": 2
    },
    "paymentMethodInfo": {
        "paymentInterface": "Mollie",
        "method": "ideal"
    },
    "custom": {
        "type": {
            "typeId": "type",
            "id": "c11764fa-4e07-4cc0-ba40-e7dfc8d67b4e"
        },
        "fields": {
            "createPayment": "{\"redirectUrl\":\"https://www.redirect.com/\",\"webhookUrl\":\"https://webhook.com\",\"locale\":\"nl_NL\"}"
        }
    },
    "paymentStatus": {},
    "transactions": [
        {
            "id": "869ea4f0-b9f6-4006-bf04-d8306b5c9564",
            "type": "Authorization",
            "interactionId": "tr_7UhSN1zuXS",
            "amount": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1604,
                "fractionDigits": 2
            },
            "state": "Pending",
            "custom": {
                "type": {
                    "key": "sctm_payment_cancel_reason"
                },
                "fields": {
                    "reasonText": "Cancel refund reason"
                }
            }
        },
        {
            "id": "869ea4f0-b9f6-4006-bf04-d8306b5c1234",
            "type": "CancelAuthorization",
            "amount": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1604,
                "fractionDigits": 2
            },
            "state": "Initial"
        },
    ],
}
```
</details>
<br />

## Creating CommerceTools actions from Mollie's response

When order is successfully cancelled on Mollie, we update commercetools payment with following actions

| Action name (CT)                 | Value                                                                      |
| -------------------------------- | -------------------------------------------------------------------------- |
| `changeTransactionState`         | `transactionId: <pendingAuthorizationTransactionId>, state: 'Failure'`     |
| `setTransactionCustomField`      | `transactionId: <pendingAuthorizationTransactionId>, name:sctm_payment_cancel_refund, value: "{\"reasonText\":\"Cancel refund reason\",\"statusText\":\"Cancelled from shop side\"}"`                                   |