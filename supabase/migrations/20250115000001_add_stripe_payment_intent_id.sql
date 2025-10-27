/*
  # Add stripe_payment_intent_id column to existing readiness_checks table

  This migration adds the new stripe_payment_intent_id column to support
  the new direct payment flow without webhooks.
*/

-- Add the new column
ALTER TABLE readiness_checks 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

-- Add index for the new column
CREATE INDEX IF NOT EXISTS idx_readiness_checks_stripe_payment_intent_id 
ON readiness_checks(stripe_payment_intent_id);

-- Update the comment to reflect the new column
COMMENT ON COLUMN readiness_checks.stripe_payment_intent_id IS 'Stripe payment intent ID for direct payment flow';







