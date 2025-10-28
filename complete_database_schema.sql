-- =====================================================
-- AI Risk Assessment Tool - Complete Database Schema
-- =====================================================
-- This file contains the complete database schema for the AI Risk Assessment Tool
-- It includes all tables, relationships, indexes, triggers, and policies needed
-- to run the entire application.
--
-- Created: January 2025
-- Version: 1.1
-- Database: PostgreSQL (Supabase)
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. ASSESSMENTS TABLE
-- =====================================================
-- Stores free pre-check assessments (10 questions, yes/no answers)
-- Used for the basic risk assessment questionnaire

CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  answers jsonb NOT NULL,
  yes_count int NOT NULL DEFAULT 0,
  total_questions int NOT NULL DEFAULT 0,
  risk_level text NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High')),
  user_email varchar(255),
  payment_intent_id varchar(255)
);

-- Enable Row Level Security
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Policies for assessments table
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

-- Indexes for assessments table
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_risk_level ON assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_assessments_user_email ON assessments(user_email);
CREATE INDEX IF NOT EXISTS idx_assessments_payment_intent_id ON assessments(payment_intent_id);

-- =====================================================
-- 2. READINESS_CHECKS TABLE
-- =====================================================
-- Stores paid professional readiness checks (12 questions, 0-3 scale)
-- Used for comprehensive AI compliance assessments

CREATE TABLE IF NOT EXISTS readiness_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'payment_pending', 'paid', 'cancelled', 'processing', 'completed', 'payment_failed', 'payment_canceled')),
  stripe_session_id text,
  stripe_payment_intent_id text,
  client_email text,
  client_name text,
  assessment_data jsonb,
  report_url text,
  company_name text,
  industry text,
  use_cases text,
  data_categories text,
  model_type text,
  submission_id text
);

-- Enable Row Level Security
ALTER TABLE readiness_checks ENABLE ROW LEVEL SECURITY;

-- Policies for readiness_checks table
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

-- Indexes for readiness_checks table
CREATE INDEX IF NOT EXISTS idx_readiness_checks_created_at ON readiness_checks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_readiness_checks_status ON readiness_checks(status);
CREATE INDEX IF NOT EXISTS idx_readiness_checks_stripe_session_id ON readiness_checks(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_readiness_checks_stripe_payment_intent_id ON readiness_checks(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_readiness_checks_client_email ON readiness_checks(client_email);
CREATE INDEX IF NOT EXISTS idx_readiness_checks_submission_id ON readiness_checks(submission_id);

-- =====================================================
-- 3. QUESTIONS TABLE
-- =====================================================
-- Stores the questionnaire questions for both free and paid assessments
-- Allows for dynamic question management

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  question_type text NOT NULL CHECK (question_type IN ('free', 'paid')),
  category text,
  question_text text NOT NULL,
  question_order int NOT NULL,
  is_active boolean DEFAULT true,
  metadata jsonb
);

-- Enable Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Policies for questions table
CREATE POLICY "Anyone can read questions"
  ON questions
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Service role can manage questions"
  ON questions
  FOR ALL
  TO service_role
  USING (true);

-- Indexes for questions table
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(question_order);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active);

-- =====================================================
-- 4. QUESTION_OPTIONS TABLE
-- =====================================================
-- Stores answer options for paid assessment questions
-- Supports the 0-3 scale scoring system

CREATE TABLE IF NOT EXISTS question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_value numeric NOT NULL,
  option_label text NOT NULL,
  option_description text,
  option_order int NOT NULL,
  is_active boolean DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

-- Policies for question_options table
CREATE POLICY "Anyone can read question_options"
  ON question_options
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Service role can manage question_options"
  ON question_options
  FOR ALL
  TO service_role
  USING (true);

-- Indexes for question_options table
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_options_value ON question_options(option_value);
CREATE INDEX IF NOT EXISTS idx_question_options_order ON question_options(option_order);
CREATE INDEX IF NOT EXISTS idx_question_options_active ON question_options(is_active);

-- =====================================================
-- 5. ASSESSMENT_CATEGORIES TABLE
-- =====================================================
-- Defines the 6 main categories for paid assessments
-- Used for organizing questions and calculating area scores

CREATE TABLE IF NOT EXISTS assessment_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  category_id text UNIQUE NOT NULL,
  category_name text NOT NULL,
  category_description text,
  weight numeric NOT NULL DEFAULT 0.0,
  icon_name text,
  display_order int NOT NULL,
  is_active boolean DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE assessment_categories ENABLE ROW LEVEL SECURITY;

-- Policies for assessment_categories table
CREATE POLICY "Anyone can read assessment_categories"
  ON assessment_categories
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Service role can manage assessment_categories"
  ON assessment_categories
  FOR ALL
  TO service_role
  USING (true);

-- Indexes for assessment_categories table
CREATE INDEX IF NOT EXISTS idx_assessment_categories_category_id ON assessment_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_assessment_categories_order ON assessment_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_assessment_categories_active ON assessment_categories(is_active);

-- =====================================================
-- 6. PAYMENT_RECORDS TABLE
-- =====================================================
-- Stores detailed payment information from Stripe
-- Used for financial tracking and reconciliation

CREATE TABLE IF NOT EXISTS payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  stripe_payment_intent_id text UNIQUE NOT NULL,
  stripe_session_id text,
  amount_cents int NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL,
  client_email text,
  client_name text,
  readiness_check_id uuid REFERENCES readiness_checks(id),
  assessment_id uuid REFERENCES assessments(id),
  payment_method_id text,
  receipt_url text,
  metadata jsonb
);

-- Enable Row Level Security
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- Policies for payment_records table
CREATE POLICY "Service role can manage payment_records"
  ON payment_records
  FOR ALL
  TO service_role
  USING (true);

-- Indexes for payment_records table
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_intent_id ON payment_records(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_session_id ON payment_records(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payment_records_client_email ON payment_records(client_email);
CREATE INDEX IF NOT EXISTS idx_payment_records_readiness_check_id ON payment_records(readiness_check_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_assessment_id ON payment_records(assessment_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_created_at ON payment_records(created_at DESC);

-- =====================================================
-- 7. REPORTS TABLE
-- =====================================================
-- Stores generated PDF reports and their metadata
-- Used for tracking report generation and delivery

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  report_type text NOT NULL CHECK (report_type IN ('free', 'paid')),
  readiness_check_id uuid REFERENCES readiness_checks(id),
  assessment_id uuid REFERENCES assessments(id),
  file_name text NOT NULL,
  file_path text,
  file_url text,
  file_size_bytes bigint,
  generation_status text DEFAULT 'pending' CHECK (generation_status IN ('pending', 'processing', 'completed', 'failed')),
  client_email text,
  client_name text,
  download_count int DEFAULT 0,
  expires_at timestamptz,
  metadata jsonb
);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policies for reports table
CREATE POLICY "Anyone can read their own reports"
  ON reports
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Service role can manage reports"
  ON reports
  FOR ALL
  TO service_role
  USING (true);

-- Indexes for reports table
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_readiness_check_id ON reports(readiness_check_id);
CREATE INDEX IF NOT EXISTS idx_reports_assessment_id ON reports(assessment_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(generation_status);
CREATE INDEX IF NOT EXISTS idx_reports_client_email ON reports(client_email);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- =====================================================
-- 8. WEBHOOK_EVENTS TABLE
-- =====================================================
-- Stores Stripe webhook events for audit and debugging
-- Used for tracking payment events and troubleshooting

CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  processed_at timestamptz,
  processing_time_ms int,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'error')),
  error_message text,
  request_info jsonb,
  event_data jsonb
);

-- Enable Row Level Security
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Policies for webhook_events table
CREATE POLICY "Service role can manage webhook_events"
  ON webhook_events
  FOR ALL
  TO service_role
  USING (true);

-- Indexes for webhook_events table
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- =====================================================
-- 9. BACKGROUND_TASKS TABLE
-- =====================================================
-- Stores background tasks for processing heavy operations
-- Used for PDF generation, email sending, and data processing

CREATE TABLE IF NOT EXISTS background_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  task_type text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  task_data jsonb NOT NULL,
  result_data jsonb,
  error_message text,
  retry_count int DEFAULT 0,
  max_retries int DEFAULT 3,
  scheduled_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE background_tasks ENABLE ROW LEVEL SECURITY;

-- Policies for background_tasks table
CREATE POLICY "Service role can manage background_tasks"
  ON background_tasks
  FOR ALL
  TO service_role
  USING (true);

-- Indexes for background_tasks table
CREATE INDEX IF NOT EXISTS idx_background_tasks_type ON background_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_background_tasks_status ON background_tasks(status);
CREATE INDEX IF NOT EXISTS idx_background_tasks_priority ON background_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_background_tasks_scheduled_at ON background_tasks(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_background_tasks_created_at ON background_tasks(created_at DESC);

-- =====================================================
-- 10. SYSTEM_CONFIG TABLE
-- =====================================================
-- Stores system configuration and settings
-- Used for managing application settings and feature flags

CREATE TABLE IF NOT EXISTS system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  config_key text UNIQUE NOT NULL,
  config_value text NOT NULL,
  config_type text DEFAULT 'string' CHECK (config_type IN ('string', 'number', 'boolean', 'json')),
  description text,
  is_active boolean DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Policies for system_config table
CREATE POLICY "Anyone can read system_config"
  ON system_config
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Service role can manage system_config"
  ON system_config
  FOR ALL
  TO service_role
  USING (true);

-- Indexes for system_config table
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);
CREATE INDEX IF NOT EXISTS idx_system_config_active ON system_config(is_active);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_readiness_checks_updated_at 
    BEFORE UPDATE ON readiness_checks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at 
    BEFORE UPDATE ON questions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_options_updated_at 
    BEFORE UPDATE ON question_options 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_records_updated_at 
    BEFORE UPDATE ON payment_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_background_tasks_updated_at 
    BEFORE UPDATE ON background_tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at 
    BEFORE UPDATE ON system_config 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA POPULATION
-- =====================================================

-- Insert default assessment categories
INSERT INTO assessment_categories (category_id, category_name, category_description, weight, icon_name, display_order) VALUES
('governance', 'Governance', 'AI risk ownership and policy management', 0.25, 'Shield', 1),
('data', 'Data', 'Data handling and privacy compliance', 0.20, 'Database', 2),
('security', 'Security', 'Access controls and data protection', 0.20, 'Shield', 3),
('vendors', 'Vendors', 'AI provider management and contracts', 0.15, 'Users', 4),
('human_oversight', 'Human Oversight', 'Human review and incident management', 0.10, 'Eye', 5),
('transparency', 'Transparency', 'User disclosure and record keeping', 0.10, 'FileText', 6)
ON CONFLICT (category_id) DO NOTHING;

-- Insert default free assessment questions
INSERT INTO questions (question_type, question_text, question_order) VALUES
('free', 'Does your system make decisions that affect people''s opportunities (like jobs, loans, or education)?', 1),
('free', 'Does it analyze personal or sensitive data (like health, biometrics, or emotions)?', 2),
('free', 'Does it interact directly with users (like a chatbot or assistant)?', 3),
('free', 'Does it provide recommendations that could influence choices (such as finance, hiring, or healthcare)?', 4),
('free', 'Do humans rely on your system''s outputs without always double-checking?', 5),
('free', 'Does your system automatically collect or store user data?', 6),
('free', 'Do you use third-party datasets or APIs without a full audit?', 7),
('free', 'Does your system explain to users when AI is being used?', 8),
('free', 'Is the system trained or fine-tuned using real customer data?', 9),
('free', 'Do you plan to deploy it publicly or in multiple countries?', 10)
ON CONFLICT DO NOTHING;

-- Insert default paid assessment questions
INSERT INTO questions (question_type, category, question_text, question_order) VALUES
('paid', 'governance', 'Do you have named owners for AI risk (product, data, security, legal)?', 1),
('paid', 'governance', 'Do you have any written AI or model governance policy?', 2),
('paid', 'data', 'Does the system use PII/PHI or similarly sensitive data?', 3),
('paid', 'data', 'Are end users or data subjects in the EU/UK?', 4),
('paid', 'security', 'Are MFA and role-based access (RBAC) enabled for all admin paths?', 5),
('paid', 'security', 'Is data encrypted at rest/in transit and are access/inference logs retained?', 6),
('paid', 'vendors', 'Which AI providers are used?', 7),
('paid', 'vendors', 'Do you have DPAs and security terms with AI vendors?', 8),
('paid', 'human_oversight', 'Where is human review applied?', 9),
('paid', 'human_oversight', 'Is there a defined rollback + incident handling plan for AI features?', 10),
('paid', 'transparency', 'Are users informed when they interact with AI or when AI influences decisions?', 11),
('paid', 'transparency', 'Do you keep a model inventory + change log?', 12)
ON CONFLICT DO NOTHING;

-- Insert default system configuration
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
('assessment_price_cents', '20000', 'number', 'Price for paid assessment in cents'),
('currency', 'usd', 'string', 'Default currency for payments'),
('max_retries', '3', 'number', 'Maximum retry attempts for background tasks'),
('report_expiry_days', '30', 'number', 'Number of days before reports expire'),
('enable_webhooks', 'true', 'boolean', 'Enable Stripe webhook processing'),
('enable_pdf_generation', 'true', 'boolean', 'Enable PDF report generation'),
('enable_email_notifications', 'true', 'boolean', 'Enable email notifications'),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode')
ON CONFLICT (config_key) DO NOTHING;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for assessment summaries
CREATE OR REPLACE VIEW assessment_summary AS
SELECT 
  a.id,
  a.created_at,
  a.risk_level,
  a.yes_count,
  a.total_questions,
  a.user_email,
  CASE 
    WHEN a.yes_count <= 3 THEN 'Low Risk'
    WHEN a.yes_count <= 6 THEN 'Medium Risk'
    ELSE 'High Risk'
  END as risk_description
FROM assessments a
ORDER BY a.created_at DESC;

-- View for readiness check summaries
CREATE OR REPLACE VIEW readiness_check_summary AS
SELECT 
  rc.id,
  rc.created_at,
  rc.status,
  rc.client_name,
  rc.client_email,
  rc.company_name,
  rc.industry,
  rc.assessment_data->>'overall_label' as overall_risk_label,
  rc.assessment_data->>'weighted_score' as weighted_score,
  p.amount_cents,
  p.currency
FROM readiness_checks rc
LEFT JOIN payment_records p ON rc.stripe_payment_intent_id = p.stripe_payment_intent_id
ORDER BY rc.created_at DESC;

-- View for payment analytics
CREATE OR REPLACE VIEW payment_analytics AS
SELECT 
  DATE(created_at) as payment_date,
  COUNT(*) as total_payments,
  SUM(amount_cents) as total_revenue_cents,
  AVG(amount_cents) as average_payment_cents,
  COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as successful_payments,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments
FROM payment_records
GROUP BY DATE(created_at)
ORDER BY payment_date DESC;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE assessments IS 'Stores free pre-check assessments with yes/no answers';
COMMENT ON TABLE readiness_checks IS 'Stores paid professional readiness checks with detailed scoring';
COMMENT ON TABLE questions IS 'Stores questionnaire questions for both free and paid assessments';
COMMENT ON TABLE question_options IS 'Stores answer options for paid assessment questions';
COMMENT ON TABLE assessment_categories IS 'Defines the 6 main categories for paid assessments';
COMMENT ON TABLE payment_records IS 'Stores detailed payment information from Stripe';
COMMENT ON TABLE reports IS 'Stores generated PDF reports and their metadata';
COMMENT ON TABLE webhook_events IS 'Stores Stripe webhook events for audit and debugging';
COMMENT ON TABLE background_tasks IS 'Stores background tasks for processing heavy operations';
COMMENT ON TABLE system_config IS 'Stores system configuration and settings';

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant necessary permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant read permissions to anonymous users for public data
GRANT SELECT ON assessments TO anon;
GRANT SELECT ON readiness_checks TO anon;
GRANT SELECT ON questions TO anon;
GRANT SELECT ON question_options TO anon;
GRANT SELECT ON assessment_categories TO anon;
GRANT SELECT ON system_config TO anon;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- This completes the comprehensive database schema for the AI Risk Assessment Tool.
-- The schema includes:
-- - 10 main tables covering all application functionality
-- - Proper relationships and foreign keys
-- - Row Level Security policies for data protection
-- - Indexes for optimal query performance
-- - Triggers for automatic timestamp updates
-- - Initial data population for categories and questions
-- - Views for common queries and analytics
-- - Proper grants and permissions
--
-- To use this schema:
-- 1. Run this file in your Supabase SQL editor
-- 2. Verify all tables are created successfully
-- 3. Check that initial data is populated
-- 4. Test the application functionality
--
-- For production deployment:
-- - Review and adjust RLS policies as needed
-- - Set up proper backup strategies
-- - Monitor query performance
-- - Regular maintenance and updates
