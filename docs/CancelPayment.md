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
- 1 transaction with type = `Authorization`, state = `Success`. This transaction should also store the targeted Mollie Payment ID in `interactionId`.
- 1 transaction with type = `CancelAuthorization`, state = `Initial`. This transaction is to point out that the customer is wanting to cancel the payment.

From the Mollie side, a payment is marked as cancelable if its `isCancelable` is true. For further information, please have a look at [Mollie docs](https://docs.mollie.com/reference/cancel-payment)

<br />

## Parameters map

Target endpoint: `https://api.mollie.com/v2/payments/{id}`

| CT SuccessAuthorization transaction         | Parameter                                   | Required |
|---------------------------------------------|---------------------------------------------|----------|
| `interactionId`                             | `id`                                        | YES      |

<br />

## Connector process

- Detect if the CommerceTools Payment object has satisfied the [conditions](#conditions) above
- If no, the connector should return success response an empty body (no updated actions)
- If yes:
  - The connector will get the Payment ID from SuccessAuthorization transaction, use it query to [Mollie Get Payment API](#https://docs.mollie.com/reference/get-payment)
  - Then, it will check if the Payment `isCancelable` is `true`. If it is not, the connector will return error response along with some details message will be save into the App-Log
  - If the Payment `isCancelable` is `true`, the connector will perform a call to the [Cancel Payment endpoint](https://docs.mollie.com/reference/cancel-payment) to cancel the payment.
  - And finally, the connector will return a success response with empty body response.
  - The necessary update actions will be handled by the webhook endpoint, they are:
    - Change SuccessAuthorization transaction state from `Pending` to `Failure`
    - Change InitialCancelAuthorization transaction state from `Initial` to `Success`
    - Update SuccessAuthorization transaction custom type `sctm_payment_cancel_reason`: store the reason of the cancelling from shop side, and a fixed message to point out that the cancelling was coming from the shop side

## Representation: CT Payment  

<details>
  <summary>Example of the final state of Payment object after cancelling successfully</summary>

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
            "interactionId": "tr_MCTkfDUHF4",
            "amount": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1604,
                "fractionDigits": 2
            },
            "state": "Failure",
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
            "id": "869ea4f0-b9f6-4006-bf04-d8306b5c9564",
            "type": "Authorization",
            "amount": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1604,
                "fractionDigits": 2
            },
            "state": "Success",
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
            "state": "Success"
        },
    ],
    "interfaceInteractions": [
        {
            "type": {
                "typeId": "type",
                "id": "d384c0f2-38bc-4310-8f16-71b6c74c767e"
            },
            "fields": {
                "request": "{\"transactionId\":\"0f0cf655-2eb2-4777-aaf6-3c638908921f\",\"paymentMethod\":\"creditcard\"}",
                "actionType": "createPayment",
                "createdAt": "2024-08-02T04:51:52+00:00",
                "response": "{\"molliePaymentId\":\"tr_MCTkfDUHF4\",\"checkoutUrl\":\"https://www.mollie.com/checkout/credit-card/embedded/MCTkfDUHF4\",\"transactionId\":\"0f0cf655-2eb2-4777-aaf6-3c638908921f\"}",
                "id": "6ff341f7-b1be-47d5-9a2c-7cd0446e5bd2"
            }
        }
    ]
}
```
</details>
<br />

## Creating CommerceTools actions from Mollie's response

When payment is successfully cancelled on Mollie, the webhook will be notified and we will update commercetools payment with following actions

| Action name (CT)                 | Value                                                                      |
| -------------------------------- | -------------------------------------------------------------------------- |
| `changeTransactionState`         | `transactionId: <PendingChargeTransactionId>, state: 'Failure'`     |
| `changeTransactionState`         | `transactionId: <InitialCancelAuthorizationTransactionId>, state: 'Success'`     |
| `setTransactionCustomField`      | `transactionId: <PendingChargeTransactionId>, type.key:sctm_payment_cancel_reason, fields: {reasonText: "cancellation reason", statusText: "cancelled from shop side"`                                   |