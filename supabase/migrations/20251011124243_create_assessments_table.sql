/*
  # Create assessments table for AI Risk Assessment Tool

  1. New Tables
    - `assessments`
      - `id` (uuid, primary key) - Unique identifier for each assessment
      - `created_at` (timestamptz) - Timestamp when assessment was created
      - `answers` (jsonb) - Array of boolean answers to questionnaire
      - `yes_count` (int) - Count of yes responses
      - `total_questions` (int) - Total number of questions in assessment
      - `risk_level` (text) - Calculated risk level: "Low", "Medium", or "High"
  
  2. Security
    - Enable RLS on `assessments` table
    - Add policy for public read access (any user can view their assessment by ID)
    - Add policy for public insert access (any user can create an assessment)
  
  3. Notes
    - No authentication required for MVP
    - All fields have appropriate defaults where applicable
    - Indexes added for performance on common queries
*/

CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  answers jsonb NOT NULL,
  yes_count int NOT NULL DEFAULT 0,
  total_questions int NOT NULL DEFAULT 0,
  risk_level text NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High'))
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read assessments"
  ON assessments
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert assessments"
  ON assessments
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_risk_level ON assessments(risk_level);