## GET PAYMENT METHODS

Use this to retrieve the list of available Mollie's payment methods.

**Endpoint**

```
Method: POST
Type: RAW
URL: {{extension-public-url}}/processor

```

**Headers**

| **Key**      | **Value**        |
| ------------ | ---------------- |
| Content-Type | application/json |

**Body**

_Parameters mapping_

| **CT fields**                                             | **Mollie fields** | **Required** |
| --------------------------------------------------------- | ----------------- | ------------ |
| paymentMethodInfo.paymentInterface                        |                   | √            |
| amountPlanned                                             | amount            | √            |
| custom.fields.sctm_payment_methods_request                |                   | √            |
| custom.fields.sctm_payment_methods_request.sequenceType   | sequenceType      | √            |
| custom.fields.sctm_payment_methods_request.locale         | locale            | √            |
| custom.fields.sctm_payment_methods_request.resource       | resource          | √            |
| custom.fields.sctm_payment_methods_request.billingCountry | billingCountry    | √            |

_Example payload_

```json
{
  "action": "Create",
  "resource": {
    "typeId": "payment",
    "id": "pm_112555",
    "obj": {
      "id": "SOMERANDOMID-123456",
      "amountPlanned": {
        "type": "centPrecision",
        "currencyCode": "EUR",
        "centAmount": 1000,
        "fractionDigits": 2
      },
      "paymentMethodInfo": {
        "paymentInterface": "Mollie",
        "method": "paypal"
      },
      "custom": {
        "fields": {
          "sctm_payment_methods_request": {
            "sequenceType": "oneoff",
            "locale": "de_DE",
            "amount": {
              "value": "10.00",
              "currencyCode": "EUR"
            },
            "resource": "payments",
            "billingCountry": "DE"
          }
        }
      }
    }
  }
}
```

**Response**

_Status:_ 200

_Body:_

```json
{
    "actions": [
        {
            "action": "setCustomField",
            "name": "sctm_payment_methods_response",
            "value": "{\"count\":10,\"methods\":[{\"resource\":\"method\",\"id\":\"creditcard\",\"description\":\"Karte\",\"minimumAmount\":{\"value\":\"0.01\",\"currency\":\"EUR\"},\"maximumAmount\":{\"value\":\"10000.00\",\"currency\":\"EUR\"},\"image\":{\"size1x\":\"https://www.mollie.com/external/icons/payment-methods/creditcard.png\",\"size2x\":\"https://www.mollie.com/external/icons/payment-methods/creditcard<mention value="2">2</mention>x.png\",\"svg\":\"https://www.mollie.com/external/icons/payment-methods/creditcard.svg\"},\"status\":\"activated\",\"_links\":{\"self\":{\"href\":\"https://api.mollie.com/v2/methods/creditcard\",\"type\":\"application/hal+json\"}}},{\"resource\":\"method\",\"id\":\"paypal\",\"description\":\"PayPal\",\"minimumAmount\":{\"value\":\"0.01\",\"currency\":\"EUR\"},\"maximumAmount\":null,\"image\":{\"size1x\":\"https://www.mollie.com/external/icons/payment-methods/paypal.png\",\"size2x\":\"https://www.mollie.com/external/icons/payment-methods/paypal<mention value="2">2</mention>x.png\",\"svg\":\"https://www.mollie.com/external/icons/payment-methods/paypal.svg\"},\"status\":\"activated\",\"_links\":{\"self\":{\"href\":\"https://api.mollie.com/v2/methods/paypal\",\...}"
        }
    ]
}

```
