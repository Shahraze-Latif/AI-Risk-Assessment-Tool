// Test script to simulate Stripe webhook events locally
// Run this with: node test-webhook.js

const crypto = require('crypto');

// Your webhook secret (get this from Stripe CLI or dashboard)
const WEBHOOK_SECRET = 'whsec_test_your_secret_here';

// Sample webhook payloads
const testEvents = {
  'checkout.session.completed': {
    id: 'evt_test_webhook',
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'cs_test_123',
        object: 'checkout.session',
        amount_total: 20000,
        currency: 'usd',
        customer_email: 'test@example.com',
        customer_details: {
          email: 'test@example.com',
          name: 'Test Customer'
        },
        payment_intent: 'pi_test_123',
        metadata: {
          readiness_check_id: 'test-readiness-123'
        }
      }
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_test_123',
      idempotency_key: null
    },
    type: 'checkout.session.completed'
  },
  
  'payment_intent.succeeded': {
    id: 'evt_test_webhook',
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'pi_test_123',
        object: 'payment_intent',
        amount: 20000,
        currency: 'usd',
        receipt_email: 'test@example.com',
        status: 'succeeded',
        metadata: {
          readiness_check_id: 'test-readiness-123',
          client_email: 'test@example.com',
          client_name: 'Test Customer'
        }
      }
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_test_123',
      idempotency_key: null
    },
    type: 'payment_intent.succeeded'
  }
};

// Function to create Stripe signature
function createStripeSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadString = JSON.stringify(payload);
  const signedPayload = `${timestamp}.${payloadString}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

// Function to send test webhook
async function sendTestWebhook(eventType) {
  const payload = testEvents[eventType];
  if (!payload) {
    console.error(`Unknown event type: ${eventType}`);
    return;
  }

  const signature = createStripeSignature(payload, WEBHOOK_SECRET);
  
  try {
    const response = await fetch('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': signature
      },
      body: JSON.stringify(payload)
    });

    const result = await response.text();
    console.log(`✅ ${eventType}: ${response.status} - ${result}`);
  } catch (error) {
    console.error(`❌ ${eventType}: ${error.message}`);
  }
}

// Main function
async function runTests() {
  console.log('🧪 Testing Stripe Webhook Locally...\n');
  
  // Make sure your Next.js server is running on localhost:3000
  console.log('Make sure your Next.js server is running: npm run dev\n');
  
  // Test different events
  await sendTestWebhook('checkout.session.completed');
  await sendTestWebhook('payment_intent.succeeded');
  
  console.log('\n✅ Webhook tests completed!');
  console.log('Check your Google Sheets "Payments" tab for recorded data.');
}

// Run the tests
runTests().catch(console.error);
