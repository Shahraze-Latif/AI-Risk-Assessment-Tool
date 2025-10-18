# Google Drive Folder Creation Guide

This guide helps you create a Google Drive folder owned by your service account to resolve storage quota issues.

## 🎯 **Why This Solves the Problem**

The "Drive storage quota exceeded" error occurs because:
- Service accounts don't have their own Drive storage quota
- They can only use storage from folders they own or have been granted access to
- Your current setup uses a shared folder, but the service account doesn't own it

**Solution**: Create a folder owned by the service account itself.

## 🚀 **Quick Setup**

### **Option 1: Using the Simple Script (Recommended)**

1. **Set your environment variable:**
   ```bash
   export GOOGLE_SERVICE_ACCOUNT_KEY="your-formatted-service-account-key-here"
   ```

2. **Run the script:**
   ```bash
   node scripts/createFolderSimple.js
   ```

3. **Copy the folder ID to your environment:**
   ```bash
   GOOGLE_DRIVE_FOLDER_ID=your-new-folder-id-here
   ```

### **Option 2: Using the Full Script (with dotenv)**

1. **Install dotenv (if not already installed):**
   ```bash
   npm install dotenv
   ```

2. **Run the script:**
   ```bash
   node scripts/createFolder.js
   ```

## 📋 **Expected Output**

When successful, you'll see:

```
🚀 Starting Google Drive folder creation test...
🔍 Checking environment variables...
✅ Service account key found
🔑 Initializing Google APIs...
✅ Google APIs initialized successfully
📁 Creating new folder: 'AI Compliance Reports'...
✅ Folder created successfully!
📁 Name: AI Compliance Reports
🆔 ID: 1AbCdEfGhIjKlMnOpQrStUvWxYz
👤 Owner: ai-compliance-readiness-check@polar-scarab-475321-g9.iam.gserviceaccount.com

============================================================
🎯 SUCCESS! Folder created successfully
============================================================
👉 Add this to your .env file:
GOOGLE_DRIVE_FOLDER_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz
============================================================
📋 Full environment variable:
GOOGLE_DRIVE_FOLDER_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz
============================================================
🎯 Folder creation process completed.
✅ You can now use this folder ID in your environment variables

🎉 Script completed successfully! Folder ID: 1AbCdEfGhIjKlMnOpQrStUvWxYz
```

## 🔧 **Environment Variable Setup**

### **For Local Development (.env.local):**
```bash
GOOGLE_SERVICE_ACCOUNT_KEY="your-service-account-key"
GOOGLE_DRIVE_FOLDER_ID="your-new-folder-id"
```

### **For Vercel Deployment:**
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add/Update:
   - `GOOGLE_SERVICE_ACCOUNT_KEY` = your service account key
   - `GOOGLE_DRIVE_FOLDER_ID` = the new folder ID from the script

## 🛠️ **Troubleshooting**

### **Error: "Missing Google Service Account Key"**
- Make sure `GOOGLE_SERVICE_ACCOUNT_KEY` is set in your environment
- For local development, you can set it with: `export GOOGLE_SERVICE_ACCOUNT_KEY="your-key"`

### **Error: "Invalid JWT Signature"**
- Your service account key is corrupted or incorrectly formatted
- Follow the `SERVICE_ACCOUNT_SETUP.md` guide to get a new key

### **Error: "Permission denied"**
- The service account doesn't have Drive API permissions
- Check your Google Cloud Console → IAM & Admin → Service Accounts
- Ensure the service account has "Editor" or "Owner" role

### **Error: "API not enabled"**
- Enable the Google Drive API in your Google Cloud Console
- Go to APIs & Services → Library → Google Drive API → Enable

## 🎯 **What This Achieves**

1. **Creates a folder owned by your service account**
2. **Eliminates storage quota issues**
3. **Provides a dedicated space for reports**
4. **Maintains security (service account owns the folder)**

## 📁 **Folder Structure After Creation**

```
Google Drive
└── AI Compliance Reports (owned by service account)
    ├── Client_ReadinessCheck_2025-01-18.pdf
    ├── Client_ReadinessCheck_2025-01-19.pdf
    └── ... (all future reports)
```

## ✅ **Verification Steps**

After running the script:

1. **Check the folder exists** in your Google Drive
2. **Verify ownership** - it should be owned by your service account
3. **Test report generation** - try submitting a readiness check
4. **Check the folder** - you should see the generated PDF

## 🔄 **Next Steps**

1. Run the script to create the folder
2. Update your environment variables with the new folder ID
3. Deploy to Vercel with the updated environment variables
4. Test the report generation flow

This should resolve the "Drive storage quota exceeded" error! 🎉
