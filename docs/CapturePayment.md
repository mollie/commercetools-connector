# Capture Payment

* [Overview](#overview)
* [Conditions](#conditions)
* [Transactions' custom fields](#transactions-custom-fields)
* [Example payload](#example-payload)
* [Example response](#example-response)

## Overview

This feature is to capture the money of an authorized Mollie payment and update transactions with correct status and information.

It calls Mollie [Capture API](https://docs.mollie.com/reference/captures-api) eventually.

To trigger the capture for a certain payment, simply update the target pending transaction of type `Charge` with our predefined custom type named `sctm_capture_payment_request`

| **Custom fields** | **Required** | **Description** |
| --- | --- | --- |
| `sctm_should_capture` | false | WHEN its value set to `true`, the Processor will start to capture with associated payment information |
| `sctm_capture_description` | false | Hold the description of the capture |

## Conditions

1. A valid authorized CT payment must contain the two follow transactions:
    * One with type of `authorization` and state `success`
    * One with type of `charge` and state `pending` | `failure` with  (in case previous capture attempt failed and we want to retry) with custom field `sctm_should_capture` = `true`
2. The ref Mollie payment must have `captureMode` equal to `manual` and `state` equal to `authorized`

## Transactions' custom fields

| Fields                                                                                       | Data type                  | Required | Usage |
|-----------------------------------------------------------------------------------------------------------|----------------------------------------------|----------|------------------|
| `sctm_should_capture`                                                                    | `boolean`                           | NO      | If `true`, trigger the capture process |
| `sctm_capture_description` | `string` | NO | Contain the description for the capture |

## Example payload

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
    "id": "ba410236-3135-4037-b61e-10aa82a1ae99",
    "version": 26,
    "versionModifiedAt": "2025-02-17T08:12:45.109Z",
    "lastMessageSequenceNumber": 6,
    "createdAt": "2025-02-17T08:09:06.565Z",
    "lastModifiedAt": "2025-02-17T08:12:45.109Z",
    "lastModifiedBy": {
        "clientId": "8a_rNd-HokSybRmRRqdEuh82",
        "isPlatformClient": false
    },
    "createdBy": {
        "clientId": "8a_rNd-HokSybRmRRqdEuh82",
        "isPlatformClient": false
    },
    "amountPlanned": {
        "type": "centPrecision",
        "currencyCode": "EUR",
        "centAmount": 11999,
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
            "id": "53cdd626-7884-4421-9226-d81ba7038424"
        },
        "fields": {
            "sctm_payment_methods_request": "{\"locale\":\"de_DE\",\"billingCountry\":\"DE\",\"includeWallets\":\"applepay\"}",
            "sctm_mollie_profile_id": "pfl_SPkYGiEQjf",
            "sctm_payment_methods_response": "{\"count\":3,\"methods\":[{\"id\":\"creditcard\",\"name\":{\"en-GB\":\"Card\",\"de-DE\":\"Card\",\"en-US\":\"Card\"},\"description\":{\"en-GB\":\"\",\"de-DE\":\"\",\"en-US\":\"\"},\"image\":\"https://www.mollie.com/external/icons/payment-methods/creditcard.svg\",\"order\":20},{\"id\":\"applepay\",\"name\":{\"en-GB\":\"Apple Pay\",\"de-DE\":\"Apple Pay\",\"en-US\":\"Apple Pay\"},\"description\":{\"en-GB\":\"\",\"de-DE\":\"\",\"en-US\":\"\"},\"image\":\"https://www.mollie.com/external/icons/payment-methods/applepay.svg\",\"order\":0},{\"id\":\"banktransfer\",\"name\":{\"en-GB\":\"Bank transfer\",\"de-DE\":\"Bank transfer\",\"en-US\":\"Bank transfer\"},\"description\":{\"en-GB\":\"\",\"de-DE\":\"\",\"en-US\":\"\"},\"image\":\"https://www.mollie.com/external/icons/payment-methods/banktransfer.svg\",\"order\":0}]}",
            "sctm_create_payment_request": "{\"description\":\"Testing creating Mollie payment\",\"redirectUrl\":\"http://localhost:3000/thank-you?orderId=ae22-e03f-aab1\",\"billingAddress\":{\"givenName\":\"thach\",\"familyName\":\"dang\",\"streetAndNumber\":\"Am campus 5\",\"postalCode\":\"48721\",\"city\":\"Gescher\",\"country\":\"DE\",\"phone\":\"49254287030\",\"email\":\"t.dang@shopmacher.de\"},\"shippingAddress\":{\"givenName\":\"thach\",\"familyName\":\"dang\",\"streetAndNumber\":\"Am campus 5\",\"postalCode\":\"48721\",\"city\":\"Gescher\",\"country\":\"DE\",\"phone\":\"49254287030\",\"email\":\"t.dang@shopmacher.de\"},\"billingEmail\":\"t.dang@shopmacher.de\",\"cardToken\":\"tkn_h3mrzMtest\",\"lines\":[{\"description\":\"Geometrischer Kissenbezug\",\"quantity\":1,\"quantityUnit\":\"pcs\",\"unitPrice\":{\"currency\":\"EUR\",\"value\":\"19.99\"},\"totalAmount\":{\"currency\":\"EUR\",\"value\":\"19.99\"}}],\"captureMode\":\"manual\"}"
        }
    },
    "paymentStatus": {
        "interfaceText": "initial"
    },
    "transactions": [
        {
            "id": "0c80239c-ade7-4556-a871-f4317759be10",
            "timestamp": "2025-02-17T08:09:36.000Z",
            "type": "Charge",
            "amount": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 11999,
                "fractionDigits": 2
            },
            "interactionId": "tr_mDmhmxTzkX",
            "state": "Success",
            "custom": {
                "type": {
                    "typeId": "type",
                    "id": "418c568c-15a5-4418-9698-a81edcffc471"
                },
                "fields": {
                    "sctm_should_capture": true,
                    "sctm_capture_description": "Capture on 2025-02-17T08:12:42.171Z"
                }
            }
        },
        {
            "id": "d39ed5fc-f8ae-405b-ae99-3f713d243da0",
            "type": "Authorization",
            "amount": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 11999,
                "fractionDigits": 2
            },
            "interactionId": "tr_mDmhmxTzkX",
            "state": "Success"
        }
    ],
    "interfaceInteractions": [
        {
            "type": {
                "typeId": "type",
                "id": "9d9b436c-58cc-4f2e-a393-0fbd05ba0193"
            },
            "fields": {
                "sctm_id": "6e134208-fdfe-453f-928e-8ab44d9b10ec",
                "sctm_action_type": "createPayment",
                "sctm_created_at": "2025-02-17T08:09:36+00:00",
                "sctm_request": "{\"transactionId\":\"0c80239c-ade7-4556-a871-f4317759be10\",\"paymentMethod\":\"creditcard\"}",
                "sctm_response": "{\"molliePaymentId\":\"tr_mDmhmxTzkX\",\"checkoutUrl\":\"https://www.mollie.com/checkout/test-mode?method=creditcard&token=6.8hhrnm\",\"transactionId\":\"0c80239c-ade7-4556-a871-f4317759be10\"}"
            }
        }
    ]
}
```
