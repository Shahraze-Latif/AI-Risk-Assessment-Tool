const fs = require('fs');
const path = require('path');

// Read the service account file
const serviceAccountPath = path.join(__dirname, '..', 'polar-scarab-475321-g9-e4b4bce58708.json');

try {
  const serviceAccountData = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  console.log('🔍 Service Account Key Verification:');
  console.log('='.repeat(50));
  
  // Check required fields
  const requiredFields = ['type', 'project_id', 'private_key', 'client_email', 'client_id'];
  const missingFields = requiredFields.filter(field => !serviceAccountData[field]);
  
  if (missingFields.length > 0) {
    console.log('❌ Missing required fields:', missingFields);
    process.exit(1);
  }
  
  console.log('✅ All required fields present');
  console.log('📧 Client Email:', serviceAccountData.client_email);
  console.log('🏗️  Project ID:', serviceAccountData.project_id);
  console.log('🔑 Private Key ID:', serviceAccountData.private_key_id);
  
  // Check private key format
  const privateKey = serviceAccountData.private_key;
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    console.log('❌ Private key format invalid');
    process.exit(1);
  }
  
  if (!privateKey.includes('-----END PRIVATE KEY-----')) {
    console.log('❌ Private key format invalid');
    process.exit(1);
  }
  
  console.log('✅ Private key format valid');
  
  // Check for line breaks in private key
  const hasLineBreaks = privateKey.includes('\\n');
  console.log('📝 Has line breaks:', hasLineBreaks ? 'Yes' : 'No');
  
  if (!hasLineBreaks) {
    console.log('⚠️  WARNING: Private key should have \\n characters for proper formatting');
  }
  
  console.log('\n🎯 Key is ready for Vercel environment variables!');
  console.log('📋 Next steps:');
  console.log('1. Copy the formatted JSON from the previous script');
  console.log('2. Update GOOGLE_SERVICE_ACCOUNT_KEY in Vercel');
  console.log('3. Redeploy your application');
  console.log('4. Test the debug page again');
  
} catch (error) {
  console.error('❌ Error reading service account file:', error.message);
  process.exit(1);
}
