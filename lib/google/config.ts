/**
 * Google API Configuration
 * Centralized configuration for all Google services
 */

// Google Document IDs - Load from environment variables
export const GOOGLE_CONFIG = {
  // Template document ID for report generation
  TEMPLATE_DOC_ID: process.env.GOOGLE_TEMPLATE_DOC_ID,
  
  // Google Sheet ID for data integration (future use)
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
  
  // Google Drive folder ID for report storage
  GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID
};

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
};

// Report generation settings
export const REPORT_CONFIG = {
  PDF_MIME_TYPE: 'application/pdf',
  DOC_MIME_TYPE: 'application/vnd.google-apps.document',
  FILE_NAME_PREFIX: 'Client_ReadinessCheck_',
  FILE_NAME_DATE_FORMAT: 'YYYY-MM-DD'
};

/**
 * Validate Google configuration
 * @returns {Object} Validation result
 */
export function validateGoogleConfig() {
  const missing = [];
  
  if (!GOOGLE_CONFIG.TEMPLATE_DOC_ID) {
    missing.push('GOOGLE_TEMPLATE_DOC_ID');
  }
  
  if (!GOOGLE_CONFIG.GOOGLE_SHEET_ID) {
    missing.push('GOOGLE_SHEET_ID');
  }
  
  if (!GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID) {
    missing.push('GOOGLE_DRIVE_FOLDER_ID');
  }
  
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    missing.push('GOOGLE_SERVICE_ACCOUNT_KEY');
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    config: GOOGLE_CONFIG
  };
}
