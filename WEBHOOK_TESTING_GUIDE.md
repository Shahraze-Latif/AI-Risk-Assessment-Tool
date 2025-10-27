# Local Webhook Testing Setup

## Method 1: Stripe CLI (Recommended)

### Install Stripe CLI
1. Download from: https://github.com/stripe/stripe-cli/releases
2. Extract and add to PATH, or use package manager:
   ```bash
   # Windows (Chocolatey)
   choco install stripe-cli
   
   # Windows (Scoop)
   scoop install stripe
   ```

### Setup Steps
1. **Authenticate:**
   ```bash
   stripe login
   ```

2. **Start webhook forwarding:**
   ```bash
   # Terminal 1: Start your app
   npm run dev
   
   # Terminal 2: Forward webhooks
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Copy the webhook secret** (starts with `whsec_...`) to your `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

4. **Test events:**
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger payment_intent.succeeded
   ```

## Method 2: Manual Test Script

1. **Start your Next.js server:**
   ```bash
   npm run dev
   ```

2. **Update the webhook secret in test-webhook.js:**
   ```javascript
   const WEBHOOK_SECRET = 'whsec_your_actual_secret_here';
   ```

3. **Run the test script:**
   ```bash
   node test-webhook.js
   ```

## Method 3: Stripe Dashboard Testing

1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook endpoint
3. Click "Send test event"
4. Select event type and send

## Expected Results

After successful webhook testing, you should see:
- ✅ Console logs in your Next.js server
- ✅ New rows in Google Sheets "Payments" tab
- ✅ Updated readiness check status in Supabase

## Troubleshooting

- **Signature verification failed**: Check your `STRIPE_WEBHOOK_SECRET`
- **Webhook not receiving**: Ensure your server is running on localhost:3000
- **Google Sheets not updating**: Check your Google Apps Script is deployed
- **Supabase errors**: Verify your Supabase credentials in `.env.local`
