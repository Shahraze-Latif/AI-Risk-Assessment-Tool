/**
 * Configuration file for AI Compliance Readiness Check
 * 
 * Update these IDs when you get access from the provider
 */

// Google Document IDs - Load from environment variables
export const GOOGLE_CONFIG = {
  // Template document ID for report generation
  TEMPLATE_DOC_ID: process.env.GOOGLE_TEMPLATE_DOC_ID!,
  
  // Google Sheet ID for data integration (future use)
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID!,
  
  // Google Drive folder ID for report storage
  GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID!
} as const;

// Environment variable names (for reference only)
// These are the environment variables that must be set:
// - GOOGLE_SERVICE_ACCOUNT_KEY
// - GOOGLE_TEMPLATE_DOC_ID
// - GOOGLE_SHEET_ID
// - GOOGLE_DRIVE_FOLDER_ID
// - NEXT_PUBLIC_DOMAIN_URL
// - STRIPE_SECRET_KEY
// - STRIPE_WEBHOOK_SECRET
// - NEXT_PUBLIC_SUPABASE_URL
// - NEXT_PUBLIC_SUPABASE_SERVICE_KEY

// Template placeholders
export const PLACEHOLDERS = {
  CLIENT_NAME: '{{CLIENT_NAME}}',
  DATE: '{{DATE}}',
  OVERALL_SCORE: '{{OVERALL_SCORE}}',
  HEATMAP_TABLE: '{{HEATMAP_TABLE}}',
  AREA_SCORES: '{{AREA_SCORES}}',
  FINDINGS_BY_AREA: '{{FINDINGS_BY_AREA}}',
  THIRTY_DAY_PLAN: '{{30_DAY_PLAN}}',
  APPENDIX: '{{APPENDIX}}'
} as const;

// Report generation settings
export const REPORT_CONFIG = {
  PDF_MIME_TYPE: 'application/pdf',
  DOC_MIME_TYPE: 'application/vnd.google-apps.document',
  FILE_NAME_PREFIX: 'Client_ReadinessCheck_',
  FILE_NAME_DATE_FORMAT: 'YYYY-MM-DD'
} as const;
