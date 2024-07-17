## GET PAYMENT METHODS

**Integration steps**

No matter when payment methods is retrieved, the `payment` object has to be **create/update** for the connector procedure to be triggered

1. A `payment` object must be instantiated/modified via CT extension actions
2. The object has several parameters as described in the table below
3. The connector will return the corresponding update actions to this `payment` object
4. Then, these update actions will be consumed and update the `payment` object with its Mollie responses

**Parameters**

| **Name**                                                       | **Required** | **Note**                                                                     |
| -------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------- |
| amountPlanned                                                  | √            | To detemine Mollie payment amount                                            |
| paymentMethodInfo.paymentInterface                             | √            | To be verified by the connector                                              |
| custom.fields.sctm_payment_methods_response                    | √            | To trigger the listing payment method action - **its value should be empty** |
| custom.fields.sctm_payment_methods_request                     | √            | To hold all the listing option for Mollie                                    |
| custom.fields.sctm_payment_methods_request.sequenceType        |              | To hold Mollie `sequenceType` option                                         |
| custom.fields.sctm_payment_methods_request.locale              |              | To hold Mollie `locale` option                                               |
| custom.fields.sctm_payment_methods_request.resource            |              | To hold Mollie `resource` option                                             |
| custom.fields.sctm_payment_methods_request.billingCountry      |              | To hold Mollie `billingCountry` option                                       |
| custom.fields.sctm_payment_methods_request.includeWallets      |              | To hold Mollie `includeWallets` option                                       |
| custom.fields.sctm_payment_methods_request.orderLineCategories |              | To hold Mollie `orderLineCategories` option                                  |
| custom.fields.sctm_payment_methods_request.include             |              | To hold Mollie `include` option                                              |

_Example payload_

```json
{
  "action": "Create",
  "resource": {
    "typeId": "payment",
    "id": "PM-112555",
    "obj": {
      "id": "PID-123456",
      "amountPlanned": {
        "type": "centPrecision",
        "currencyCode": "EUR",
        "centAmount": 1000,
        "fractionDigits": 2
      },
      "paymentMethodInfo": {
        "paymentInterface": "Mollie"
      },
      "custom": {
        "fields": {
          "sctm_payment_methods_request": {
            "sequenceType": "oneoff",
            "locale": "de_DE",
            "resource": "payments",
            "billingCountry": "DE",
            "includeWallets": "applepay"
          },
          "sctm_payment_methods_response: {}
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
      "value": "{\"count\":11,\"methods\":[{\"resource\":\"method\",\"id\":\"applepay\",\"description\":\"Apple Pay\",\"minimumAmount\":{\"value\":\"0.01\",\"currency\":\"EUR\"},\"maximumAmount\":{\"value\":\"10000.00\",\"currency\":\"EUR\"},\"image\":{\"size1x\":\"https://www.mollie.com/external/icons/payment-methods/applepay.png\",\"size2x\":\"https://www.mollie.com/external/icons/payment-methods/applepay%402x.png\",\"svg\":\"https://www.mollie.com/external/icons/payment-methods/applepay.svg\"},\"status\":\"activated\",\"_links\":{\"self\":{\"href\":\"https://api.mollie.com/v2/methods/applepay\",\"type\":\"application/hal+json\"}}},{\"resource\":\"method\",\"id\":\"creditcard\",\"description\":\"Karte\",\"minimumAmount\":{\"value\":\"0.01\",\"currency\":\"EUR\"},\"maximumAmount\":{\"value\":\"10000.00\",\"currency\":\"EUR\"},\"image\":{\"size1x\":\"https://www.mollie.com/external/icons/payment-methods/creditcard.png\",\"size2x\":\"https://www.mollie.com/external/icons/payment-methods/creditcard%402x.png\",\"svg\":\"https://www.mollie.com/external/icons/payment-methods/creditcard.svg\"},\"status\":\"activated\",\"_links\":{\"self\":{\"href\":\"https://api.mollie.com/v2/methods/creditcard\",\"type\":\"application/hal+json\"}}},{\"resource\":\"method\",\"id\":\"paypal\",\"description\":\"PayPal\",\"minimumAmount\":{\"value\":\"0.01\",\"currency\":\"EUR\"},\"maximumAmount\":null,\"image\":{\"size1x\":\"https://www.mollie.com/external/icons/payment-methods/paypal.png\",\"size2x\":\"https://www.mollie.com/external/icons/payment-methods/paypal%402x.png\",\"svg\":\"https://www.mollie.com/external/icons/payment-methods/paypal.svg\"},\"status\":\"activated\",\"_links\":{\"self\":{\"href\":\"https://api.mollie.com/v2/methods/paypal\",\"type\":\"application/hal+json\"}}},{\"resource\":\"method\",\"id\":\"banktransfer\",\"description\":\"Überweisung\",\"minimumAmount\":{\"value\":\"0.01\",\"currency\":\"EUR\"},\"maximumAmount\":{\"value\":\"1000000.00\",\"currency\":\"EUR\"},\"image\":{\"size1x\":\"https://www.mollie.com/external/icons/payment-methods/banktransfer.png\",\"size2x\":\"https://www.mollie.com/external/icons/payment-methods/banktransfer%402x.png\",\"svg\":\"https://www.mollie.com/external/icons/payment-methods/banktransfer.svg\"},\"status\":\"activated\",\"_links\":{\"self\":{\"href\":\"https://api.mollie.com/v2/methods/banktransfer\",\"type\":\"application/hal+json\"}}},{\"resource\":\"method\",\"id\":\"ideal\",\"description\":\"iDEAL\",\"minimumAmount\":{\"value\":\"0.01\",\"currency\":\"EUR\"},\"maximumAmount\":{\"value\":\"50000.00\",\"currency\":\"EUR\"},\"image\":{\"size1x\":\"https://www.mollie.com/external/icons/payment-methods/ideal.png\",\"size2x\":\"https://www.mollie.com/external/icons/payment-methods/ideal%402x.png\",\"svg\":\"https://www.mollie.com/external/icons/payment-methods/ideal.svg\"},\"status\":\"activated\",\"_links\":{\"self\":{\"href\":\"https://api.mollie.com/v2/methods/ideal\",\"type\":\"application/hal+json\"}}},{\"resource\":\"method\",\"id\":\"bancontact\",\"description\":\"Bancontact\",\"minimumAmount\":{\"value\":\"0.02\",\"currency\":\"EUR\"},\"maximumAmount\":{\"value\":\"50000.00\",\"currency\":\"EUR\"},\"image\":{\"size1x\":\"https://www.mollie.com/external/icons/payment-methods/bancontact.png\",\"size2x\":\"https://www.mollie.com/external/icons/payment-methods/bancontact%402x.png\",\"svg\":\"https://www.mollie.com/external/icons/payment-methods/bancontact.svg\"},\"status\":\"activated\",\"_links\":{\"self\":{\"href\":\"https://api.mollie.com/v2/methods/bancontact\",\"type\":\"application/hal+json\"}}},{\"resource\":\"method\",\"id\":\"eps\",\"description\":\"eps\",\"minimumAmount\":{\"value\":\"1.00\",\"currency\":\"EUR\"},\"maximumAmount\":{\"value\":\"50000.00\",\"currency\":\"EUR\"},\"image\":{\"size1x\":\"https://www.mollie.com/external/icons/payment-methods/eps.png\",\"size2x\":\"https://www.mollie.com/external/icons/payment-methods/eps%402x.png\",\"svg\":\"https://www.mollie.com/external/icons/payment-methods/eps.svg\"},\"status\":\"activated\",\"_links\":{\"self\":{\"href\":\"https://api.mollie.com/v2/methods/eps\",\"type\":\"application/hal+json\"}}},{\"resource\":\"method\",\"id\":\"przelewy24\",\"description\":\"Przelewy24\",\"minimumAmount\":{\"value\":\"0.01\",\"currency\":\"EUR\"},\"maximumAmount\":{\"value\":\"12815.00\",\"currency\":\"EUR\"},\"image\":{\"size1x\":\"https://www.mollie.com/external/icons/payment-methods/przelewy24.png\",\"size2x\":\"https://www.mollie.com/external/icons/payment-methods/przelewy24%402x.png\",\"svg\":\"https://www.mollie.com/external/icons/payment-methods/przelewy24.svg\"},\"status\":\"activated\",\"_links\":{\"self\":{\"href\":\"https://api.mollie.com/v2/methods/przelewy24\",\"type\":\"application/hal+json\"}}},{\"resource\":\"method\",\"id\":\"kbc\",\"description\":\"KBC/CBC Zahlungsbutton\",\"minimumAmount\":{\"value\":\"0.01\",\"currency\":\"EUR\"},\"maximumAmount\":{\"value\":\"50000.00\",\"currency\":\"EUR\"},\"image\":{\"size1x\":\"https://www.mollie.com/external/icons/payment-methods/kbc.png\",\"size2x\":\"https://www.mollie.com/external/icons/payment-methods/kbc%402x.png\",\"svg\":\"https://www.mollie.com/external/icons/payment-methods/kbc.svg\"},\"status\":\"activated\",\"_links\":{\"self\":{\"href\":\"https://api.mollie.com/v2/methods/kbc\",\"type\":\"application/hal+json\"}}},{\"resource\":\"method\",\"id\":\"belfius\",\"description\":\"Belfius Pay Button\",\"minimumAmount\":{\"value\":\"0.01\",\"currency\":\"EUR\"},\"maximumAmount\":{\"value\":\"50000.00\",\"currency\":\"EUR\"},\"image\":{\"size1x\":\"https://www.mollie.com/external/icons/payment-methods/belfius.png\",\"size2x\":\"https://www.mollie.com/external/icons/payment-methods/belfius%402x.png\",\"svg\":\"https://www.mollie.com/external/icons/payment-methods/belfius.svg\"},\"status\":\"activated\",\"_links\":{\"self\":{\"href\":\"https://api.mollie.com/v2/methods/belfius\",\"type\":\"application/hal+json\"}}},{\"resource\":\"method\",\"id\":\"bancomatpay\",\"description\":\"Bancomat Pay\",\"minimumAmount\":{\"value\":\"0.01\",\"currency\":\"EUR\"},\"maximumAmount\":{\"value\":\"50000.00\",\"currency\":\"EUR\"},\"image\":{\"size1x\":\"https://www.mollie.com/external/icons/payment-methods/bancomatpay.png\",\"size2x\":\"https://www.mollie.com/external/icons/payment-methods/bancomatpay%402x.png\",\"svg\":\"https://www.mollie.com/external/icons/payment-methods/bancomatpay.svg\"},\"status\":\"activated\",\"_links\":{\"self\":{\"href\":\"https://api.mollie.com/v2/methods/bancomatpay\",\"type\":\"application/hal+json\"}}}]}"
    },
    {
      "action": "setCustomField",
      "name": "sctm_mollie_profile_id",
      "value": "pfl_SPkYGiEQjf"
    }
  ]
}
```
