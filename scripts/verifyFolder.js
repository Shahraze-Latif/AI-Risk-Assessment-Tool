#!/usr/bin/env node

/**
 * Verify Folder Exists Script
 * Checks if the created folder actually exists and is accessible
 */

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local if it exists
function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!value.startsWith('#') && key.trim()) {
          envVars[key.trim()] = value;
        }
      }
    });
    
    // Set environment variables
    Object.assign(process.env, envVars);
    console.log('✅ Loaded environment variables from .env.local');
  } catch (error) {
    console.log('ℹ️ No .env.local file found, using system environment variables');
  }
}

// Load environment variables
loadEnvFile();

function initializeGoogleAPIs() {
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

async function verifyFolder() {
  try {
    console.log('🔍 Verifying folder exists and is accessible...');
    
    const { drive } = initializeGoogleAPIs();
    const folderId = '18kgliF073utABR4475qiJpmYZb04bQsu';
    
    console.log('📁 Checking folder:', folderId);
    
    // Get folder details
    const folderDetails = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, owners, mimeType, createdTime, modifiedTime'
    });
    
    console.log('✅ Folder exists and is accessible!');
    console.log('📋 Folder Details:');
    console.log('   🆔 ID:', folderDetails.data.id);
    console.log('   📁 Name:', folderDetails.data.name);
    console.log('   📄 Type:', folderDetails.data.mimeType);
    console.log('   📅 Created:', folderDetails.data.createdTime);
    console.log('   👤 Owners:', folderDetails.data.owners?.map(owner => owner.emailAddress).join(', '));
    
    // List files in the folder
    console.log('\n📂 Listing files in the folder...');
    const filesList = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name, mimeType, createdTime)'
    });
    
    if (filesList.data.files && filesList.data.files.length > 0) {
      console.log('📄 Files in folder:');
      filesList.data.files.forEach(file => {
        console.log(`   📄 ${file.name} (${file.mimeType}) - ${file.createdTime}`);
      });
    } else {
      console.log('📄 Folder is empty (no files yet)');
    }
    
    // Test creating a test file
    console.log('\n🧪 Testing file creation in the folder...');
    try {
      const testFile = await drive.files.create({
        requestBody: {
          name: 'Test File - ' + new Date().toISOString(),
          parents: [folderId]
        },
        media: {
          mimeType: 'text/plain',
          body: 'This is a test file to verify folder access.'
        }
      });
      
      console.log('✅ Test file created successfully!');
      console.log('📄 Test file ID:', testFile.data.id);
      
      // Clean up test file
      console.log('🧹 Cleaning up test file...');
      await drive.files.delete({
        fileId: testFile.data.id
      });
      console.log('✅ Test file deleted');
      
    } catch (testError) {
      console.error('❌ Failed to create test file:', testError.message);
    }
    
    console.log('\n🎉 Folder verification completed successfully!');
    console.log('✅ The folder exists, is accessible, and ready for use');
    
  } catch (error) {
    console.error('❌ Folder verification failed:');
    console.error('🔍 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
  }
}

// Run the verification
verifyFolder();
