/*
  # Create readiness_checks table for AI Compliance Readiness Check

  1. New Table
    - `readiness_checks`
      - `id` (uuid, primary key) - Unique identifier for each readiness check
      - `created_at` (timestamptz) - Timestamp when readiness check was created
      - `updated_at` (timestamptz) - Timestamp when record was last updated
      - `status` (text) - Payment status: 'pending', 'payment_pending', 'paid', 'cancelled'
      - `stripe_session_id` (text) - Stripe checkout session ID
      - `client_email` (text) - Client email from Stripe
      - `client_name` (text) - Client name from Stripe
      - `assessment_data` (jsonb) - Assessment responses and results (optional)
  
  2. Security
    - Enable RLS on `readiness_checks` table
    - Add policy for public read access (any user can view their readiness check by ID)
    - Add policy for public insert access (any user can create a readiness check)
    - Add policy for public update access (for webhook updates)
  
  3. Notes
    - No authentication required for MVP
    - All fields have appropriate defaults where applicable
    - Indexes added for performance on common queries
*/

CREATE TABLE IF NOT EXISTS readiness_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'payment_pending', 'paid', 'cancelled', 'processing', 'completed')),
  stripe_session_id text,
  client_email text,
  client_name text,
  assessment_data jsonb
);

ALTER TABLE readiness_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read readiness_checks"
  ON readiness_checks
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert readiness_checks"
  ON readiness_checks
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update readiness_checks"
  ON readiness_checks
  FOR UPDATE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_readiness_checks_created_at ON readiness_checks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_readiness_checks_status ON readiness_checks(status);
CREATE INDEX IF NOT EXISTS idx_readiness_checks_stripe_session_id ON readiness_checks(stripe_session_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_readiness_checks_updated_at 
    BEFORE UPDATE ON readiness_checks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

