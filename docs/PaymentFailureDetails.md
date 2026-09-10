# Payment Failure Details

  * [Overview](#overview)
  * [Custom fields](#custom-fields)
  * [Which payment methods provide which details](#which-payment-methods-provide-which-details)
  * [Representation: CommerceTools Payment](#representation-commercetools-payment)
  * [Creating CommerceTools actions from Mollie's response](#creating-commercetools-actions-from-mollies-response)

## Overview

When Mollie reports a payment as `failed`, `expired` or `canceled`, the webhook sets the state of the matching CommerceTools transaction to `Failure`. On top of that, the connector persists the final Mollie status and, when Mollie provides them, the failure reason and a customer-facing failure message as custom fields on that transaction.

A storefront can read these fields to tell the customer why the payment did not succeed, instead of showing a generic error.

No extra API call is needed: the details come from the same [Get payment](https://docs.mollie.com/reference/get-payment) response the webhook already fetches.

<br />

## Custom fields

The fields are part of the transaction custom type (`sctm_transactions_custom_type` by default, or the type configured through `CTP_TRANSACTION_CUSTOM_TYPE_KEY`). They are added to an existing type during post-deploy, so existing installations receive them on the next deployment.

| Field name             | Type   | Value                                                                                                                                      |
|------------------------|--------|--------------------------------------------------------------------------------------------------------------------------------------------|
| `sctm_mollie_status`   | String | The final Mollie payment status: `failed`, `expired` or `canceled`                                                                          |
| `sctm_failure_reason`  | String | A machine-readable reason, e.g. `insufficient_funds`. Only set when Mollie provides it                                                       |
| `sctm_failure_message` | String | A human-readable message, localized according to the payment `locale`, meant to be shown to the customer. Only set when Mollie provides it |

The fields are only written when the transaction state actually changes to `Failure`. A webhook for a transaction which is already in the `Failure` state does not update them.

For `canceled` payments the existing fields `reasonText` and `statusText` are written as before (see [Cancel Payment](./CancelPayment.md)), `sctm_mollie_status` is added next to them.

<br />

## Which payment methods provide which details

| Payment method                                       | `sctm_mollie_status` | `sctm_failure_reason`   | `sctm_failure_message`   |
|------------------------------------------------------|----------------------|-------------------------|--------------------------|
| Credit card                                          | yes                  | `details.failureReason` | `details.failureMessage` |
| Bancontact                                           | yes                  | `details.failureReason` | no                       |
| Point of sale                                        | yes                  | `statusReason.code`     | `statusReason.message`   |
| iDEAL, PayPal, Klarna, bank transfer, other methods  | yes                  | no                      | no                       |

The card failure reasons are documented in the `details.failureReason` section of the [Get payment](https://docs.mollie.com/reference/get-payment) response, for example `authentication_failed`, `card_declined`, `card_expired`, `insufficient_funds`, `invalid_cvv`, `possible_fraud` or `refused_by_issuer`. The point-of-sale status reasons are documented at [Status reasons](https://docs.mollie.com/reference/status-reasons).

<br />

## Representation: CommerceTools Payment

<details>
  <summary>Example transaction after a failed credit card payment</summary>

```json
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
      "typeId": "type",
      "key": "sctm_transactions_custom_type"
    },
    "fields": {
      "sctm_mollie_status": "failed",
      "sctm_failure_reason": "insufficient_funds",
      "sctm_failure_message": "The card has insufficient funds. Please use a different card."
    }
  }
}
```
</details>

<details>
  <summary>Example transaction after an expired iDEAL payment</summary>

```json
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
      "typeId": "type",
      "key": "sctm_transactions_custom_type"
    },
    "fields": {
      "sctm_mollie_status": "expired"
    }
  }
}
```
</details>
<br />

## Creating CommerceTools actions from Mollie's response

When the webhook maps the Mollie status to the `Failure` state, the connector updates the CommerceTools payment with the following actions

| Action name (CT)             | Value                                                                                                                                                                                     |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `changeTransactionState`     | `transactionId: <matchingTransactionId>, state: 'Failure'`                                                                                                                                |
| `setTransactionCustomType`   | `transactionId: <matchingTransactionId>, type.key: <transaction custom type key>, fields: {sctm_mollie_status, sctm_failure_reason, sctm_failure_message}` when the transaction has no custom type yet |
| `setTransactionCustomField`  | one action per field when the transaction already has a custom type, so existing custom fields such as `surchargeAmountInCent` are kept                                                   |

`sctm_failure_reason` and `sctm_failure_message` are omitted when Mollie does not provide them.
