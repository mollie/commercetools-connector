# Authorization Guide for Mollie Integration

## Introduction

This guide explains how to connect to the Mollie client and verify the connection. The initial connection setup will be used across various features requiring Mollie integration.

## Securing connector endpoints

To called our connector endpoint esp. the processor endpoint (/processor/*), a valid access token (with client credentials grant type) is required. This token must be updated into the extension destination.

``` MD
CREAT/UPDATE Extension 
{
    ...
    "destination": {
        "type": "HTTP",
        "url": "https://efd6-115-74-115-119.ngrok-free.app/processor",
        "authorization": {
            "type": "AuthorizationHeader",
            "headerValue": "_token_"
        }
    }
    ...
}

```

Kindly recheck your extension record if facing unauthorized error when communicating with the connector. Also the token do expire after a time, please consider to implement a scheduled job to update this token.

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
