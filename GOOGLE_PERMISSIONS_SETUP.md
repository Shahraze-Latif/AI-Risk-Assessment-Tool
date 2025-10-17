# 🔐 Google Permissions Setup Guide

## 🚨 **CRITICAL ISSUE IDENTIFIED**

Your service account `ai-compliance-readiness-check@polar-scarab-475321-g9.iam.gserviceaccount.com` does **NOT** have access to the Google Drive folder.

## 🔍 **Root Cause Analysis**

### **Problem 1: Drive Folder Access**
- **URL**: https://drive.google.com/drive/folders/1Qgg1pgcgS20dLBcDqfJm6YJReGzX1Lyh
- **Issue**: Shows Google sign-in page instead of folder contents
- **Cause**: Service account has no access to this folder

### **Problem 2: Service Account Permissions**
- **Service Account**: `ai-compliance-readiness-check@polar-scarab-475321-g9.iam.gserviceaccount.com`
- **Missing**: Access to your personal Google Drive folder
- **Required**: Editor permissions on the target folder

## 🛠️ **SOLUTION STEPS**

### **Step 1: Share Drive Folder with Service Account**

1. **Open your Google Drive folder**:
   - Go to: https://drive.google.com/drive/folders/1Qgg1pgcgS20dLBcDqfJm6YJReGzX1Lyh
   - Click the "Share" button (top right)

2. **Add Service Account**:
   - Add email: `ai-compliance-readiness-check@polar-scarab-475321-g9.iam.gserviceaccount.com`
   - Set permission: **Editor**
   - Click "Send"

### **Step 2: Share Template Document**

1. **Open your template document**:
   - Go to: https://docs.google.com/document/d/1oG64k9qBy8r8lLJkMS5HF4yxwfXCXYPWxtag9Ubj3XQ/edit

2. **Share with Service Account**:
   - Click "Share" button
   - Add email: `ai-compliance-readiness-check@polar-scarab-475321-g9.iam.gserviceaccount.com`
   - Set permission: **Editor**
   - Click "Send"

### **Step 3: Verify Google Cloud Console APIs**

1. **Go to Google Cloud Console**:
   - Project: `polar-scarab-475321-g9`
   - Navigate to: APIs & Services → Library

2. **Enable Required APIs**:
   - ✅ Google Docs API
   - ✅ Google Drive API
   - ✅ Google Sheets API (if using)

### **Step 4: Test Service Account Access**

Create a test script to verify access:

```javascript
// Test script to verify service account access
const { google } = require('googleapis');

async function testServiceAccountAccess() {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const credentials = JSON.parse(serviceAccountKey);
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ]
  });
  
  const drive = google.drive({ version: 'v3', auth });
  
  try {
    // Test folder access
    const folderResponse = await drive.files.get({
      fileId: '1Qgg1pgcgS20dLBcDqfJm6YJReGzX1Lyh'
    });
    console.log('✅ Folder access successful:', folderResponse.data.name);
    
    // Test document access
    const docResponse = await drive.files.get({
      fileId: '1oG64k9qBy8r8lLJkMS5HF4yxwfXCXYPWxtag9Ubj3XQ'
    });
    console.log('✅ Document access successful:', docResponse.data.name);
    
  } catch (error) {
    console.error('❌ Access failed:', error.message);
  }
}
```

## 🔧 **Alternative Solution: Create New Folder**

If sharing doesn't work, create a new folder specifically for the service account:

### **Option A: Create New Drive Folder**

1. **Create new folder** in your Google Drive
2. **Share with service account** immediately
3. **Update environment variable** with new folder ID
4. **Redeploy** application

### **Option B: Use Service Account's Own Drive**

1. **Create folder** using service account's own Drive
2. **No sharing required** - service account owns it
3. **Update folder ID** in environment variables

## 📋 **Verification Checklist**

- [ ] Service account has **Editor** access to Drive folder
- [ ] Service account has **Editor** access to template document  
- [ ] Google APIs are enabled in Cloud Console
- [ ] Environment variables are set correctly in Vercel
- [ ] Application is redeployed after permission changes

## 🚀 **Quick Fix Commands**

### **1. Update Environment Variables in Vercel**
```bash
# Go to Vercel Dashboard → Your Project → Settings → Environment Variables
# Update these values:

GOOGLE_TEMPLATE_DOC_ID=1oG64k9qBy8r8lLJkMS5HF4yxwfXCXYPWxtag9Ubj3XQ
GOOGLE_DRIVE_FOLDER_ID=1Qgg1pgcgS20dLBcDqfJm6YJReGzX1Lyh
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### **2. Redeploy Application**
```bash
# In Vercel Dashboard:
# Go to Deployments → Click "Redeploy" on latest deployment
```

## 🔍 **Debugging Steps**

### **Step 1: Check Vercel Function Logs**
1. Go to Vercel Dashboard → Your Project → Functions
2. Click on the failed `/api/generate-report` function
3. Check the detailed error logs

### **Step 2: Test Individual Components**
1. **Test folder access**: Try to list folder contents
2. **Test document access**: Try to read template document
3. **Test API permissions**: Verify all required APIs are enabled

### **Step 3: Verify Service Account**
1. **Check service account email**: `ai-compliance-readiness-check@polar-scarab-475321-g9.iam.gserviceaccount.com`
2. **Verify JSON key format**: Ensure it's valid JSON
3. **Test authentication**: Try to authenticate with the key

## 🆘 **Still Having Issues?**

### **Common Problems:**

1. **"File not found"** → Service account doesn't have access to the folder/document
2. **"Permission denied"** → Service account needs Editor permissions
3. **"API not enabled"** → Enable required APIs in Google Cloud Console
4. **"Invalid credentials"** → Check service account JSON format

### **Emergency Fallback:**

If sharing doesn't work, create a new folder and share it immediately:

1. Create new folder in Google Drive
2. Share with service account (Editor)
3. Update `GOOGLE_DRIVE_FOLDER_ID` in Vercel
4. Redeploy application

## 📞 **Next Steps**

1. **Share the folder** with your service account
2. **Share the template document** with your service account  
3. **Redeploy** your application
4. **Test** the report generation again

The detailed error logs will now show exactly what's failing! 🎯
