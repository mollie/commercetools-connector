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
			"actions": [
				{
					"action": "setCustomField",
					"name": "sctm_mollie_profile_id",
					"value": "pfl_SPkYGi***"
				},
				{
					"action": "setCustomField",
					"name": "sctm_payment_methods_response",
					"value": "{\"count\":7,\"methods\":[{\"id\":\"przelewy24\",\"name\":{\"en-GB\":\"Przelewy24\",\"de-DE\":\"Przelewy24\",\"pl-PL\":\"Przelewy24\"},\"description\":{\"en-GB\":\"\",\"de-DE\":\"Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of \",\"pl-PL\":\"\"},\"image\":\"https://www.mollie.com/external/icons/payment-methods/przelewy24.svg\",\"order\":4},{\"id\":\"banktransfer\",\"name\":{\"en-GB\":\"Bank transfer\",\"de-DE\":\"Bank transfer\",\"pl-PL\":\"Bank transfer\"},\"description\":{\"en-GB\":\"\",\"de-DE\":\"\",\"pl-PL\":\"\"},\"image\":\"https://www.mollie.com/external/icons/payment-methods/banktransfer.svg\",\"order\":3},{\"id\":\"applepay\",\"name\":{\"en-GB\":\"Apple Pay\",\"de-DE\":\"Apple Pay\",\"pl-PL\":\"Apple Pay\"},\"description\":{\"en-GB\":\"Apple Pay description\",\"de-DE\":\"Apple Pay description\",\"pl-PL\":\"\"},\"image\":\"https://www.mollie.com/external/icons/payment-methods/applepay.svg\",\"order\":2},{\"id\":\"paypal\",\"name\":{\"en-GB\":\"PayPal\",\"de-DE\":\"PayPal\",\"pl-PL\":\"PayPal\"},\"description\":{\"en-GB\":\"\",\"de-DE\":\"\",\"pl-PL\":\"\"},\"image\":\"https://www.mollie.com/external/icons/payment-methods/paypal.svg\",\"order\":0},{\"id\":\"ideal\",\"name\":{\"en-GB\":\"iDEAL\",\"de-DE\":\"iDEAL\",\"pl-PL\":\"iDEAL\"},\"description\":{\"en-GB\":\"\",\"de-DE\":\"\",\"pl-PL\":\"\"},\"image\":\"https://www.mollie.com/external/icons/payment-methods/ideal.svg\",\"order\":0},{\"id\":\"bancontact\",\"name\":{\"en-GB\":\"Bancontact\",\"de-DE\":\"Bancontact\",\"pl-PL\":\"Bancontact\"},\"description\":{\"en-GB\":\"\",\"de-DE\":\"\",\"pl-PL\":\"\"},\"image\":\"https://www.mollie.com/external/icons/payment-methods/bancontact.svg\",\"order\":0},{\"id\":\"kbc\",\"name\":{\"en-GB\":\"KBC/CBC Payment Button\",\"de-DE\":\"KBC/CBC Payment Button\",\"pl-PL\":\"KBC/CBC Payment Button\"},\"description\":{\"en-GB\":\"\",\"de-DE\":\"\",\"pl-PL\":\"\"},\"image\":\"https://www.mollie.com/external/icons/payment-methods/kbc.svg\",\"order\":0}]}"
				}
			]
		}
	]
}
```
