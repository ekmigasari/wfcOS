# Polar Webhook Integration

This document provides information on how to set up and use the Polar webhook integration in our application.

## Overview

Polar webhooks allow our application to receive real-time updates about events that happen in your Polar account, such as new subscriptions, customer updates, and more. These events are processed and reflected in our application data.

## Setup Instructions

### 1. Environment Variables

Add the following environment variable to your `.env` file:

```
POLAR_WEBHOOK_SECRET=your_webhook_secret_from_polar
```

### 2. Expose Your Webhook Endpoint

For testing locally, you can use a tool like ngrok to expose your local server:

```bash
ngrok http 3000
```

Your webhook URL will be:

```
https://your-ngrok-url.ngrok.io/api/v1/webhooks/polar
```

### 3. Register Webhook in Polar Dashboard

1. Go to your Polar dashboard
2. Navigate to Settings > Developer > Webhooks
3. Add a new webhook with the URL from step 2
4. Copy the webhook signing secret and set it as your `POLAR_WEBHOOK_SECRET` environment variable

## Supported Events

The integration currently handles the following Polar events:

### Customer Events

- `customer.created` - When a new customer is created in Polar
- `customer.updated` - When customer information is updated
- `customer.state_changed` - When a customer's state changes (e.g., benefits)

### Subscription Events

- `subscription.created` - When a new subscription is created
- `subscription.updated` - When a subscription is updated
- `subscription.active` - When a subscription becomes active
- `subscription.canceled` - When a subscription is canceled
- `subscription.revoked` - When a subscription is revoked

### Order Events

- `order.created` - When a new order is created
- `order.paid` - When an order is paid

## Testing Webhooks

You can test your webhook integration using Polar's webhook testing tool in their dashboard or by sending test events to your endpoint:

```bash
# Example of sending a test webhook event
curl -X POST https://your-server.com/api/v1/webhooks/polar \
  -H "Content-Type: application/json" \
  -H "x-polar-signature: your_test_signature" \
  -H "x-polar-timestamp: $(date +%s)" \
  -d '{
    "id": "evt_123",
    "type": "subscription.created",
    "data": {
      "id": "sub_123",
      "customer_id": "cus_123",
      "plan_id": "monthly",
      "status": "active",
      "current_period_end": "2023-12-31T23:59:59Z"
    },
    "created_at": "2023-01-01T12:00:00Z"
  }'
```

## Troubleshooting

### Signature Verification Failures

If you're seeing signature verification errors:

1. Ensure your `POLAR_WEBHOOK_SECRET` environment variable is set correctly
2. Check that you're using the correct webhook signing secret from Polar
3. Verify the timestamp and request body are being correctly processed

### Missing Events

If certain events aren't being processed:

1. Check the webhook logs in your Polar dashboard to see if the events are being sent
2. Look at your server logs for any errors in processing the events
3. Ensure the event type is handled in the webhook handler

For further assistance, contact the development team or refer to the [Polar Webhooks Documentation](https://docs.polar.sh/integrate/webhooks/events).
