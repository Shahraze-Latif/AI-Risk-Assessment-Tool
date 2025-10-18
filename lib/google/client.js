/**
 * Centralized Google API Client
 * Single source of truth for all Google API operations
 */

import { google } from 'googleapis';

let googleClient = null;

/**
 * Initialize Google APIs with service account credentials
 * @returns {Object} Google API clients (docs, drive, sheets)
 */
export function initializeGoogleAPIs() {
  if (googleClient) {
    return googleClient;
  }

  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is required');
  }

  const credentials = JSON.parse(serviceAccountKey);

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

  return googleClient;
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
