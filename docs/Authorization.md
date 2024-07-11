# Authorization Guide for Mollie Integration

## Introduction

This guide explains how to connect to the Mollie client and verify the connection. The initial connection setup will be used across various features requiring Mollie integration.

## Connecting to Mollie

To connect to the Mollie account, you must specify the `MOLLIE_API_KEY` in your .env file. You can get the API key from your Mollie Dashboard.

## Verify Connection

To verify that the connection to the Mollie account is successful, use the endpoint /service/test-mollie-connection. The response from this endpoint should be a list of available payment methods.
