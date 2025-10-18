#!/usr/bin/env node

/**
 * Service Account Key Diagnostic Script
 * Checks if your Google Service Account key is properly formatted
 */

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

function checkServiceAccountKey() {
  console.log('🔍 Checking Google Service Account Key...');
  
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountKey) {
    console.error('❌ GOOGLE_SERVICE_ACCOUNT_KEY not found in environment');
    console.log('💡 Make sure you have a .env.local file with your service account key');
    return false;
  }
  
  console.log('✅ Service account key found');
  console.log('📏 Key length:', serviceAccountKey.length);
  
  // Check if it's a valid JSON
  try {
    const parsed = JSON.parse(serviceAccountKey);
    console.log('✅ Key is valid JSON');
    console.log('🔑 Key type:', parsed.type);
    console.log('📧 Client email:', parsed.client_email);
    console.log('🆔 Project ID:', parsed.project_id);
    console.log('🔐 Private key ID:', parsed.private_key_id);
    
    // Check for common issues
    if (parsed.private_key && parsed.private_key.includes('\\n')) {
      console.log('⚠️  WARNING: Private key contains \\n (should be actual newlines)');
      console.log('💡 This might cause JWT signature issues');
    }
    
    if (parsed.private_key && !parsed.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
      console.log('❌ ERROR: Private key format is invalid');
      console.log('💡 Private key should start with -----BEGIN PRIVATE KEY-----');
    }
    
    if (parsed.private_key && !parsed.private_key.includes('-----END PRIVATE KEY-----')) {
      console.log('❌ ERROR: Private key format is invalid');
      console.log('💡 Private key should end with -----END PRIVATE KEY-----');
    }
    
    // Check for line breaks in the key
    if (parsed.private_key && parsed.private_key.includes('\n')) {
      console.log('✅ Private key has proper line breaks');
    } else if (parsed.private_key) {
      console.log('⚠️  WARNING: Private key might not have proper line breaks');
    }
    
    return true;
    
  } catch (jsonError) {
    console.error('❌ Key is not valid JSON');
    console.error('🔍 JSON Error:', jsonError.message);
    console.log('💡 Make sure your key is properly formatted as a single-line JSON string');
    return false;
  }
}

// Run the check
const isValid = checkServiceAccountKey();

if (isValid) {
  console.log('\n🎯 Key appears to be valid!');
  console.log('💡 If you\'re still getting JWT signature errors, try:');
  console.log('1. Get a fresh service account key from Google Cloud Console');
  console.log('2. Make sure the key is formatted as a single-line JSON string');
  console.log('3. Verify the service account has Drive API permissions');
} else {
  console.log('\n❌ Key validation failed!');
  console.log('💡 Please check your service account key format');
}
