# Create Refund

  * [Overview](#overview)
  * [Parameters map](#parameters-map)
  * [Representation: CommerceTools Payment](#representation-ct-payment)
  * [Creating commercetools actions from Mollie's response](#creating-commercetools-actions-from-mollies-response)

## Overview

This functionality is used to create a new Refund on Mollie:

This calls Mollie's [create refund](https://docs.mollie.com/reference/create-refund) endpoint.

<br />

This assumes the customer has already placed an order and paid, so we need to refund money back to them. To trigger a refund, you will need to create a Refund transaction, (its state should be "Initial" as per default). You can make many refunds against a Payment, but only one refund at a time.

## Conditions

A success charge transaction is expected to trigger a refund. The transaction should have the state "Success" and the type "Charge".

