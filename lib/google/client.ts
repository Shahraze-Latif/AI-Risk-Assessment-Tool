/**
 * Centralized Google API Client
 * Single source of truth for all Google API operations
 */

import { google } from 'googleapis';
import { 
  GoogleAPIError, 
  ConfigurationError, 
  handleGoogleAPIError, 
  handleConfigurationError,
  logError,
  safeAsync 
} from '../errors';

interface GoogleClient {
  docs: any;
  drive: any;
  sheets: any;
  auth: any;
}

let googleClient: GoogleClient | null = null;

/**
 * Initialize Google APIs with service account credentials
 * @returns {Object} Google API clients (docs, drive, sheets)
 */
export function initializeGoogleAPIs(): GoogleClient {
  if (googleClient) {
    return googleClient;
  }

  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      throw handleConfigurationError(['GOOGLE_SERVICE_ACCOUNT_KEY']);
    }

    // Validate service account key format
    let credentials: any;
    try {
      credentials = JSON.parse(serviceAccountKey);
    } catch (parseError) {
      throw new ConfigurationError(
        'Invalid GOOGLE_SERVICE_ACCOUNT_KEY format. Must be valid JSON.',
        ['GOOGLE_SERVICE_ACCOUNT_KEY']
      );
    }

    // Validate required fields in credentials
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !credentials[field]);
    
    if (missingFields.length > 0) {
      throw new ConfigurationError(
        `Service account key missing required fields: ${missingFields.join(', ')}`,
        missingFields
      );
    }

    if (credentials.type !== 'service_account') {
      throw new ConfigurationError(
        'Service account key type must be "service_account"',
        ['GOOGLE_SERVICE_ACCOUNT_KEY']
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets'
      ]
    });

    googleClient = {
      docs: google.docs({ version: 'v1', auth }),
      drive: google.drive({ version: 'v3', auth }),
      sheets: google.sheets({ version: 'v4', auth }),
      auth
    };

    console.log('✅ Google APIs initialized successfully');
    console.log('🔑 Service account:', credentials.client_email);
    console.log('🆔 Project ID:', credentials.project_id);

    return googleClient;

  } catch (error) {
    logError(error as Error, { operation: 'initializeGoogleAPIs' });
    throw error;
  }
}

/**
 * Get Google API clients (initializes if needed)
 * @returns {Object} Google API clients
 */
export function getGoogleAPIs() {
  return initializeGoogleAPIs();
}

/**
 * Reset the Google client (useful for testing)
 */
export function resetGoogleClient() {
  googleClient = null;
}
