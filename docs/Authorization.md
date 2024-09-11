# Authorization Guide for Mollie Integration

## Introduction

This guide explains how to connect to the Mollie client and verify the connection. The initial connection setup will be used across various features requiring Mollie integration.

## Connecting to Mollie

To connect to the Mollie account, you must specify the `MOLLIE_API_TEST_KEY` and `MOLLIE_API_LIVE_KEY` in your .env file. You can get the API key from your Mollie Dashboard.

## Verify Connection

To verify that the connection to the Mollie account is successful, use the endpoint `/processor/mollie/status/`.

The expected response is a JSON object holding the current Mollie profile information including `mode`, `name`, `website`, and `status`.

Example response:

```json
{
  "mode": "test",
  "name": "Mollie B.V.",
  "website": "https://www.mollie.com",
  "status": "verified"
}
