# Create Refund

  * [Overview](#overview)
  * [Parameters map](#parameters-map)
  * [Representation: CommerceTools Payment](#representation-ct-payment)
  * [Creating commercetools actions from Mollie's response](#creating-commercetools-actions-from-mollies-response)

## Overview

This functionality is used to create a new Refund on Mollie:

This calls Mollie's [create refund](https://docs.mollie.com/reference/create-refund) endpoint.

This assumes the customer has already placed an order and paid, so we need to refund money back to them. To trigger a refund, you will need to create a Refund transaction, (its state should be "Initial" as per default). You can make many refunds against a Payment, but only one refund at a time.

Please note that at least [1 hour](https://docs.mollie.com/docs/refunds#possible-errors:~:text=Your%20Refund%20is%20a%20duplicate%20(of%20the%20same%20amount%20in%20the%20last%20hour)%20of%20another%20Refund%20on%20the%20Payment) after the last refund, partial refunds of the same amount may be issued.

## Conditions

A success charge transaction is expected to trigger a refund. The transaction should have the state "Success" and the type "Charge".
A transaction with type "Refund" and state "Initial" triggers a refund.

## Example Usage

In commercetools, we have a Payment which has one Transaction. This maps to an order in mollie. The commercetools Payment's key is the mollie orderId, and the commercetools Transaction maps to the payment in mollie.

In commercetools, we have a Payment which has one Transaction. This maps to an order in mollie. The commercetools Payment's key is the mollie orderId, and the commercetools Transaction maps to the payment in mollie.

```
{
    id: "c0887a2d-bfbf-4f77-8f3d-fc33fb4c0920",
    version: 6,
    key: "ord_5h2f3w",
    "amountPlanned": {
        "type": "centPrecision",
        "currencyCode": "EUR",
        "centAmount": 1604,
        "fractionDigits": 2
    },
    transactions: [
        {
            id: "869ea4f0-b9f6-4006-bf04-d8306b5c9564",
            "timestamp": "2024-08-08T16:34:51.000Z",
            "type": "Charge",
            "amount": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1604,
                "fractionDigits": 2
            },
            "interactionId": "tr_7UhSN1zuXS",
            "state": "Success"
        }
    ]
}
```

To refund part of this, we add a Refund transaction.

```
{
    "version": 6,
    "actions": [
        {
            "action": "addTransaction",
            "transaction": {
                "type": "Refund",
                "state": "Initial",
                "amount": {
                    "currencyCode": "EUR",
                    "centAmount": 1604
                },
            }
        }
    ]
}
```

If the refund is created successfully, this will update this transaction to reflect the refund in mollie. For example:

```
...
transactions: [
    {
            id: "869ea4f0-b9f6-4006-bf04-d8306b5c1234",
            "timestamp": "2021-12-09T16:34:51.000",
            "type": "Refund",
            "amount": {
                "currencyCode": "EUR",
                "centAmount": 1604,
            },
            "interactionId": "re_4qqhO89gsT",
            "state": "Pending"
    },
    ...
]
```

When the refund is completed, this transaction's state will be updated by the notifications module to "Success" or "Failure".

## Update per version

The function was updated at:
- [v1.1.3](../CHANGELOG.md#v113)
