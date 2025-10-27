# Stripe Payment Integration Setup

This document outlines the setup required for the AI Compliance Readiness Check payment integration using Stripe webhooks for automatic payment recording.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=your_supabase_service_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Domain Configuration
NEXT_PUBLIC_DOMAIN_URL=http://localhost:3000
```

## Stripe Setup Steps

1. **Create a Stripe Account**
   - Go to [stripe.com](https://stripe.com) and create an account
   - Complete the account setup process

2. **Get Your API Keys**
   - Go to the Stripe Dashboard → Developers → API Keys
   - Copy your **Secret key** (starts with `sk_test_`) and add it to `STRIPE_SECRET_KEY`
   - Copy your **Publishable key** (starts with `pk_test_`) and add it to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

3. **Set Up Webhook Endpoint**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - Set the endpoint URL to: `https://your-domain.com/api/webhooks/stripe`
   - Select the following events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.requires_action`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
   - Copy the **Webhook signing secret** (starts with `whsec_`) and add it to `STRIPE_WEBHOOK_SECRET`

4. **No Product Setup Required**
   - The price is set directly in the code ($200.00)
   - No need to create products or prices in Stripe Dashboard
   - To change the price, edit `amount: 20000` in `app/api/create-payment-intent/route.ts`

## Supabase Setup

1. **Run the Migration**
   ```bash
   npx supabase db push
   ```

2. **Verify the Table**
   - Go to your Supabase Dashboard → Table Editor
   - Verify the `readiness_checks` table exists with the correct columns

## Google Sheets Setup

The webhook will automatically create a "Payments" tab in your connected Google Sheet with the following columns:
- Timestamp
- Email
- Amount
- Status
- Session ID
- Payment Intent ID
- Currency
- Client Name

## Testing the Integration

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```

3. **Test the Flow**
   - Complete the readiness questionnaire
   - Process a test payment
   - Check the "Payments" tab in your Google Sheet for the recorded payment

4. **Test Webhook Events**
   ```bash
   # Using Stripe CLI (if installed)
   stripe trigger checkout.session.completed
   
   # Or use the Stripe Dashboard → Webhooks → Send test event
   ```

## Webhook Security

The webhook endpoint uses Stripe's signature verification to ensure events are authentic:
- Raw request body is used for signature verification
- Webhook secret is required for all events
- Invalid signatures return 400 status
- All events are logged for debugging

## Production Deployment

1. **Update Environment Variables**
   - Use production Stripe keys (starts with `sk_live_` and `pk_live_`)
   - Update `NEXT_PUBLIC_DOMAIN_URL` to your production domain
   - No webhook configuration needed

2. **Deploy the Application**
   - Deploy to your hosting platform
   - Ensure all environment variables are set

## Troubleshooting

- **Payment Issues**: Check that both Stripe keys are set correctly
- **Payment Verification**: Ensure the `readiness_checks` table exists and has the correct schema
- **Environment Variables**: Double-check all environment variables are set correctly
- **Card Testing**: Use Stripe test cards for development (4242 4242 4242 4242)

