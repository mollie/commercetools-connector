# Capture Payment

* [Overview](#overview)
* [Conditions](#conditions)
* [Example payload](#example-payload)
* [Example response](#example-response)

## Overview

This feature is to capture the money of an authorized Mollie payment and update transactions with correct status and information.

It calls Mollie [Capture API](https://docs.mollie.com/reference/captures-api) eventually.

To trigger the capture for a certain payment, simply update the target pending transaction of type `Charge` with our predefined custom type named `sctm_transaction_surcharge_and_capture`

| **Custom fields** | **Required** | **Description** |
| --- | --- | --- |
| `surchargeAmountInCent` | false | Store the setting for additional surcharge fee |
| `sctm_should_capture` | false | WHEN its value set to `true`, the Processor will start to capture with associated payment information |
| `sctm_capture_description` | false | Store the description for a capture |
| `sctm_capture_errors` | false | Store the reason why the capture is failed |

## Conditions

1. A valid authorized CT payment must contain the two follow transactions:
    * One with type of `authorization` and state `success`
    * One with type of `charge` and state `pending` | `failure` with  (in case previous capture attempt failed and we want to retry) with custom field `sctm_should_capture` = `true`
2. The ref Mollie payment must have `captureMode` equal to `manual` and `state` equal to `authorized`

## Example payload

Please notice that if the transaction has surcharge costs then using the action `setTransactionCustomField`

```json
{
    "version": {{capture_payment_version}},
    "actions": [
        {
            "action" : "setTransactionCustomField",
            "name" : "{{sctm_should_capture}}",
            "value": true,
            "transactionId" : "{{capture_transaction_id}}"
        },
        {
            "action" : "setTransactionCustomField",
            "name" : "{{sctm_capture_description}}",
            "value": "Capture on {{current_datetime}}",
            "transactionId" : "{{capture_transaction_id}}"
        }
    ]
}
```

Otherwise, using the action `setTransactionCustomType`

```json
ENDPOINT: `https://api.europe-west1.gcp.commercetools.com/{{your_project_key}}/payments/{{payment_id_for_capture}}`
{
    "version": {{capture_payment_version}},
    "actions": [
        {
            "action" : "setTransactionCustomType",
            "type" : {
              "id" : "{{capture_type_id}}",
              "typeId" : "type"
            },
            "fields" : {
              "sctm_should_capture" : true,
              "sctm_capture_description": "Capture description"
            },
            "transactionId" : "{{capture_transaction_id}}"
          }
    ]
}
```

## Example response

```json
{
    "id": "2eeaed85-e389-4e5a-a434-330a0d31ae3e",
    "version": 27,
    "versionModifiedAt": "2025-02-24T07:00:07.064Z",
    "lastMessageSequenceNumber": 6,
    "createdAt": "2025-02-24T06:54:04.470Z",
    "lastModifiedAt": "2025-02-24T07:00:07.064Z",
    "lastModifiedBy": {
        "clientId": "pQTXqp3kGvXQynj1ehl9GtNr",
        "isPlatformClient": false
    },
    "createdBy": {
        "clientId": "pQTXqp3kGvXQynj1ehl9GtNr",
        "isPlatformClient": false
    },
    "amountPlanned": {
        "type": "centPrecision",
        "currencyCode": "EUR",
        "centAmount": 6000,
        "fractionDigits": 2
    },
    "paymentMethodInfo": {
        "paymentInterface": "mollie",
        "method": "creditcard",
        "name": {
            "en": "creditcard",
            "de": "creditcard"
        }
    },
    "custom": {
        "type": {
            "typeId": "type",
            "id": "8e5500cb-0761-4a46-8cc1-e84262b5f50c"
        },
        "fields": {
            "sctm_payment_methods_request": "{\"locale\":\"de_DE\",\"billingCountry\":\"DE\",\"includeWallets\":\"applepay\"}",
            "sctm_mollie_profile_id": "pfl_SPkYGiEQjf",
            "sctm_payment_methods_response": "{\"count\":4,\"methods\":[{\"id\":\"creditcard\",\"name\":{\"en-GB\":\"Card\",\"de-DE\":\"Card\",\"en-US\":\"Card\"},\"description\":{\"en-GB\":\"\",\"de-DE\":\"\",\"en-US\":\"\"},\"image\":\"https://www.mollie.com/external/icons/payment-methods/creditcard.svg\",\"order\":0},{\"id\":\"paypal\",\"name\":{\"en-GB\":\"PayPal\",\"de-DE\":\"PayPal\",\"en-US\":\"PayPal\"},\"description\":{\"en-GB\":\"\",\"de-DE\":\"\",\"en-US\":\"\"},\"image\":\"https://www.mollie.com/external/icons/payment-methods/paypal.svg\",\"order\":0},{\"id\":\"banktransfer\",\"name\":{\"en-GB\":\"Bank transfer\",\"de-DE\":\"Bank transfer\",\"en-US\":\"Bank transfer\"},\"description\":{\"en-GB\":\"\",\"de-DE\":\"\",\"en-US\":\"\"},\"image\":\"https://www.mollie.com/external/icons/payment-methods/banktransfer.svg\",\"order\":0},{\"id\":\"ideal\",\"name\":{\"en-GB\":\"iDEAL\",\"de-DE\":\"iDEAL\",\"en-US\":\"iDEAL\"},\"description\":{\"en-GB\":\"\",\"de-DE\":\"\",\"en-US\":\"\"},\"image\":\"https://www.mollie.com/external/icons/payment-methods/ideal.svg\",\"order\":0}]}",
            "sctm_create_payment_request": "{\"description\":\"Testing creating Mollie payment\",\"redirectUrl\":\"http://localhost:3000/thank-you?orderId=6fe8-b457-9e18\",\"billingAddress\":{\"givenName\":\"thach\",\"familyName\":\"dang\",\"streetAndNumber\":\"Am campus 5\",\"postalCode\":\"48721\",\"city\":\"Gescher\",\"country\":\"DE\",\"email\":\"t.dang+tuff$@shopmacher.de\"},\"shippingAddress\":{\"givenName\":\"thach\",\"familyName\":\"dang\",\"streetAndNumber\":\"Am campus 5\",\"postalCode\":\"48721\",\"city\":\"Gescher\",\"country\":\"DE\",\"email\":\"t.dang+tuff$@shopmacher.de\"},\"billingEmail\":\"t.dang+tuff$@shopmacher.de\",\"cardToken\":\"tkn_fwGrzMtest\",\"lines\":[{\"description\":\"Intl 101\",\"quantity\":1,\"quantityUnit\":\"pcs\",\"unitPrice\":{\"currency\":\"EUR\",\"value\":\"50.00\"},\"totalAmount\":{\"currency\":\"EUR\",\"value\":\"50.00\"}}],\"captureMode\":\"manual\"}"
        }
    },
    "paymentStatus": {
        "interfaceText": "initial"
    },
    "transactions": [
        {
            "id": "be2beaeb-7a21-4f30-a81d-dc3db84ac4a3",
            "timestamp": "2025-02-24T06:54:25.000Z",
            "type": "Charge",
            "amount": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 6000,
                "fractionDigits": 2
            },
            "interactionId": "tr_T6daBBKgrZ",
            "state": "Success",
            "custom": {
                "type": {
                    "typeId": "type",
                    "id": "2c08d482-e195-4f9f-ad57-99634471b797"
                },
                "fields": {
                    "sctm_should_capture": true,
                    "sctm_capture_description": "Capture description 2025-02-14T08:25:16.613Z"
                }
            }
        },
        {
            "id": "90a1a015-f2ab-4bcd-950d-31e8c6a971f1",
            "type": "Authorization",
            "amount": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 6000,
                "fractionDigits": 2
            },
            "interactionId": "tr_T6daBBKgrZ",
            "state": "Success"
        }
    ],
    "interfaceInteractions": [
        {
            "type": {
                "typeId": "type",
                "id": "cd8707ea-3c9e-4e37-a4b3-312d538d385e"
            },
            "fields": {
                "sctm_id": "6f58eee1-370f-4a81-94d7-2919e993f73f",
                "sctm_action_type": "createPayment",
                "sctm_created_at": "2025-02-24T06:54:25+00:00",
                "sctm_request": "{\"transactionId\":\"be2beaeb-7a21-4f30-a81d-dc3db84ac4a3\",\"paymentMethod\":\"creditcard\"}",
                "sctm_response": "{\"molliePaymentId\":\"tr_T6daBBKgrZ\",\"checkoutUrl\":\"https://www.mollie.com/checkout/test-mode?method=creditcard&token=6.suayi7\",\"transactionId\":\"be2beaeb-7a21-4f30-a81d-dc3db84ac4a3\"}"
            }
        }
    ]
}
```
