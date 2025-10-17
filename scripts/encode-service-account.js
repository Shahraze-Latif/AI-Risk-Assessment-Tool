const fs = require('fs');
const path = require('path');

// Read the service account file
const serviceAccountPath = path.join(__dirname, '..', 'polar-scarab-475321-g9-e4b4bce58708.json');
const serviceAccountData = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Create a properly formatted single-line JSON
const formattedKey = JSON.stringify(serviceAccountData);

console.log('🔑 Formatted Service Account Key for Vercel:');
console.log('='.repeat(80));
console.log(formattedKey);
console.log('='.repeat(80));
console.log('\n📋 Instructions:');
console.log('1. Copy the JSON above (between the === lines)');
console.log('2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('3. Find GOOGLE_SERVICE_ACCOUNT_KEY');
console.log('4. Replace the value with the copied JSON');
console.log('5. Click Save');
console.log('6. Redeploy your application');
console.log('\n✅ This should fix the "Invalid JWT Signature" error!');
