# Stripe Payment Integration Setup

This document outlines the setup required for the AI Compliance Readiness Check payment integration.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=your_supabase_service_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Domain Configuration
NEXT_PUBLIC_DOMAIN_URL=http://localhost:3000
```

## Stripe Setup Steps

1. **Create a Stripe Account**
   - Go to [stripe.com](https://stripe.com) and create an account
   - Complete the account setup process

2. **Get Your API Keys**
   - Go to the Stripe Dashboard → Developers → API Keys
   - Copy your **Secret key** (starts with `sk_test_`)
   - Add it to `STRIPE_SECRET_KEY` in your environment variables

3. **Create a Product (Optional)**
   - Go to Stripe Dashboard → Products
   - Click "Add product"
   - Name: "AI Compliance Readiness Check"
   - Note: We use dynamic pricing in the code, so you don't need to create a price

4. **Set Up Webhooks (REQUIRED)**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`
   - Copy the **Signing secret** (starts with `whsec_`)
   - Add it to `STRIPE_WEBHOOK_SECRET` in your environment variables

   **Important:** Webhooks are required for the payment flow to work. The payment verification depends on the webhook updating the database.

## Supabase Setup

1. **Run the Migration**
   ```bash
   npx supabase db push
   ```

2. **Verify the Table**
   - Go to your Supabase Dashboard → Table Editor
   - Verify the `readiness_checks` table exists with the correct columns

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
   - Go to `http://localhost:3000`
   - Click "Book Readiness Check"
   - Complete the Stripe checkout process
   - Verify the webhook updates the database

## Production Deployment

1. **Update Environment Variables**
   - Use production Stripe keys (starts with `sk_live_`)
   - Update `NEXT_PUBLIC_DOMAIN_URL` to your production domain
   - Update webhook endpoint URL in Stripe Dashboard

2. **Deploy the Application**
   - Deploy to your hosting platform
   - Ensure all environment variables are set

## Troubleshooting

- **Webhook Issues**: Check that the webhook endpoint is accessible and returns 200 status
- **Payment Verification**: Ensure the `readiness_checks` table exists and has the correct schema
- **Environment Variables**: Double-check all environment variables are set correctly

