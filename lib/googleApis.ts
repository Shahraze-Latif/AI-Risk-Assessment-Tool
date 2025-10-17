import { google } from 'googleapis';
import { GOOGLE_CONFIG, PLACEHOLDERS } from './config';

// Initialize Google APIs with service account
export function initializeGoogleAPIs() {
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
      'https://www.googleapis.com/auth/drive.file'
    ]
  });

  const docs = google.docs({ version: 'v1', auth });
  const drive = google.drive({ version: 'v3', auth });

  return { docs, drive, auth };
}

// Export configuration
export const TEMPLATE_DOC_ID = GOOGLE_CONFIG.TEMPLATE_DOC_ID;
export const GOOGLE_SHEET_ID = GOOGLE_CONFIG.GOOGLE_SHEET_ID;
export const GOOGLE_DRIVE_FOLDER_ID = GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID;
export { PLACEHOLDERS };

