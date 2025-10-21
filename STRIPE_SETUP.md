# Stripe Payment Integration Setup

This document outlines the setup required for the AI Compliance Readiness Check payment integration using direct payment intents (no webhooks required).

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=your_supabase_service_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

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

3. **No Product Setup Required**
   - The price is set directly in the code ($200.00)
   - No need to create products or prices in Stripe Dashboard
   - To change the price, edit `amount: 20000` in `app/api/create-payment-intent/route.ts`

4. **No Webhooks Required!**
   - This implementation uses direct payment intents
   - No webhook setup needed
   - Payments are confirmed immediately on the frontend

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
   - Fill in your information and card details
   - Complete the payment process
   - Verify you're redirected to the questionnaire

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

