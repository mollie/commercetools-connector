# Cancel Order

  * [Parameters map](#parameters-map)
  * [Representation: CT Payment](#representation-ct-payment)
  * [Creating CommerceTools actions from Mollie's response](#creating-commercetools-actions-from-mollies-response)
  * [Update per version](#update-per-version)

## Overview
This functionality is used to cancel the pending refund which means it is created but not complete yet.

The target Mollie endpoint will be [Cancel Payment Refund](https://docs.mollie.com/reference/cancel-refund).

<br />

## Conditions

In order to use this functionality, the customer must have a charged-successfully payment and a refund created which is in-progress for that payment.
Technically, the CommerceTools Payment object needs to include 3 transactions:
- 1 transaction with type = `Charge`, state = `Success`. This transaction should also store the targeted Mollie Payment ID in `interactionId`.
- 1 transaction with type = `Refund`, state = `Pending`. This transaction should also store the targeted Mollie Refund ID in `interactionId`.
- 1 transaction with type = `CancelAuthorization`, state = `Initial`. This transaction is to point out that the customer is wanting to cancel the Refund.

<br />

## Parameters map

Target endpoint: `https://api.mollie.com/v2/payments/{paymentId}/refunds/{id}`

| CT SuccessCharge transaction                | Parameter                                   | Required |
|---------------------------------------------|---------------------------------------------|----------|
| `interactionId`                             | `paymentId`                                 | YES      |

| CT PendingRefund transaction                | Parameter                                   | Required |
|---------------------------------------------|---------------------------------------------|----------|
| `interactionId`                             | `id`                                        | YES      |

<br />

## Connector process

- Detect if the CommerceTools Payment object has satisfied the [conditions](#conditions) above
- If no, the connector should return success response an empty body (no updated actions)
- If yes:
  - The connector will get the Refund ID from PendingRefund transaction, use it query to [Mollie Get Payment Refund API](#https://docs.mollie.com/reference/get-refund)
  - Then, it will check whether the Refund status is `queued` or `pending`. If it is not `queued` nor `pending`, the connector will return error response along with some details message will be save into the App-Log
  - If the Refund status is `queued` or `pending`, the connector will perform a call to the [Cancel Refund endpoint](https://docs.mollie.com/reference/cancel-refund) to cancel the refund.
  - And finally, the connector will return a success response with a list of necessary updated actions including: 
    - Change PendingRefund transaction state from `Pending` to `Failure`
    - Change InitialCancelAuthorization transaction state from `Initial` to `Success`
    - Update PendingRefund transaction custom field `sctm_payment_cancel_reason`: store the reason of the cancelling from shop side, and a fixed message to point out that the cancelling was coming from the shop side

## Representation: CT Payment  

<details>
  <summary>Example of the final state of Payment object after cancelling the refund successfully</summary>

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
            "type": "Charge",
            "interactionId": "tr_7UhSN1zuXS",
            "amount": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1604,
                "fractionDigits": 2
            },
            "state": "Success"
        },
        {
            "id": "869ea4f0-b9f6-4006-bf04-d8306b5c1234",
            "type": "Refund",
            "interactionId": "re_4qqhO89gsT",
            "amount": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1604,
                "fractionDigits": 2
            },
            "state": "Failure",
            "custom": {
                "type": {
                    "key": "sctm_payment_cancel_refund"
                },
                "fields": {
                    "reasonText": "Cancel refund reason"
                }
            }
        },
        {
            "id": "ad199f53-09be-43a5-ae73-aa97248239ad",
            "type": "CancelAuthorization",
            "amount": {
                "centAmount": 1604,
                "currencyCode": "EUR"
            },
            "state": "Success",
            "custom": {
                "type": {
                    "typeId": "type",
                    "key": "sctm_payment_cancel_reason"
                },
                "fields": {
                    "reasonText": "Testing cancel payment"
                }
            },
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
| `changeTransactionState`         | `transactionId: <pendingRefundTransactionId>, state: 'Failure'`            |
| `changeTransactionState`         | `transactionId: <initialCancelAuthorizationTransactionId>, state: 'Success'`            |
| `setTransactionCustomType`     | `transactionId: <pendingRefundTransactionId>, type.key:sctm_payment_cancel_reason, fields: {reasonText: "cancellation reason", statusText: "cancelled from shop side"}`                                   |

## Update per version

The function was updated at:
- [v1.1.3](../CHANGELOG.md#v113)