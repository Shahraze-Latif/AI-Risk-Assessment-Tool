#!/usr/bin/env node

/**
 * Google Drive Folder Creation Script
 * Creates a new Google Drive folder owned by the Service Account
 * for the AI Compliance Readiness Tool MVP
 */

import { initializeGoogleAPIs } from '../lib/googleApis.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

async function createDriveFolder() {
  try {
    console.log('🚀 Starting Google Drive folder creation test...');
    
    // 1. Authentication Check
    console.log('🔍 Checking environment variables...');
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      console.error('❌ Missing Google Service Account Key');
      console.log('💡 Make sure GOOGLE_SERVICE_ACCOUNT_KEY is set in your .env.local file');
      process.exit(1);
    }
    
    console.log('✅ Service account key found');
    
    // 2. Drive API Initialization
    console.log('🔑 Initializing Google APIs...');
    let drive;
    try {
      const { drive: driveAPI } = initializeGoogleAPIs();
      drive = driveAPI;
      console.log('✅ Google APIs initialized successfully');
    } catch (initError) {
      console.error('❌ Failed to initialize Google APIs');
      console.error('🔍 Error details:', {
        message: initError instanceof Error ? initError.message : 'Unknown error',
        stack: initError instanceof Error ? initError.stack : 'No stack trace'
      });
      throw initError;
    }
    
    // 3. Folder Creation Attempt
    console.log('📁 Creating new folder: \'AI Compliance Reports\'...');
    
    let folderResponse;
    try {
      folderResponse = await drive.files.create({
        requestBody: {
          name: 'AI Compliance Reports',
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id, name, owners'
      });
      
      console.log('✅ Folder created successfully!');
      console.log('📁 Name:', folderResponse.data.name);
      console.log('🆔 ID:', folderResponse.data.id);
      
      // Get owner information
      if (folderResponse.data.owners && folderResponse.data.owners.length > 0) {
        console.log('👤 Owner:', folderResponse.data.owners[0].emailAddress);
      } else {
        console.log('👤 Owner: Service Account (ai-compliance-readiness-check@polar-scarab-475321-g9.iam.gserviceaccount.com)');
      }
      
    } catch (createError) {
      console.error('❌ Failed to create folder');
      console.error('🔍 Error details:', {
        message: createError instanceof Error ? createError.message : 'Unknown error',
        code: createError && typeof createError === 'object' && 'code' in createError ? createError.code : 'No code',
        status: createError && typeof createError === 'object' && 'status' in createError ? createError.status : 'No status',
        stack: createError instanceof Error ? createError.stack : 'No stack trace'
      });
      throw createError;
    }
    
    // 4. Environment Output
    const folderId = folderResponse.data.id;
    console.log('\n' + '='.repeat(60));
    console.log('🎯 SUCCESS! Folder created successfully');
    console.log('='.repeat(60));
    console.log('👉 Add this to your .env file:');
    console.log(`GOOGLE_DRIVE_FOLDER_ID=${folderId}`);
    console.log('='.repeat(60));
    console.log('📋 Full environment variable:');
    console.log(`GOOGLE_DRIVE_FOLDER_ID=${folderId}`);
    console.log('='.repeat(60));
    
    // 5. Cleanup and Exit
    console.log('🎯 Folder creation process completed.');
    console.log('✅ You can now use this folder ID in your environment variables');
    
    return folderId;
    
  } catch (error) {
    console.error('\n❌ Fatal error during folder creation:');
    console.error('🔍 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check that your GOOGLE_SERVICE_ACCOUNT_KEY is correctly formatted');
    console.log('2. Verify the service account has Drive API permissions');
    console.log('3. Ensure the service account key is not expired');
    console.log('4. Check your Google Cloud project settings');
    
    process.exit(1);
  }
}

// Run the script
createDriveFolder()
  .then((folderId) => {
    console.log(`\n🎉 Script completed successfully! Folder ID: ${folderId}`);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  });
