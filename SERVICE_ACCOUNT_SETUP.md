# 🔐 Service Account Key Setup Guide

## 🚨 **SECURITY NOTICE**
Service account key files have been removed from the project directory for security reasons.

## 📋 **Manual Setup Instructions**

### **Step 1: Get Your Service Account Key**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project**: `polar-scarab-475321-g9`
3. **Navigate to**: IAM & Admin → Service Accounts
4. **Find your service account**: `ai-compliance-readiness-check@polar-scarab-475321-g9.iam.gserviceaccount.com`
5. **Click on the service account**
6. **Go to "Keys" tab**
7. **Click "Add Key" → "Create new key"**
8. **Select "JSON" format**
9. **Download the key file**

### **Step 2: Format the Key for Vercel**

#### **Option A: Online JSON Formatter (Recommended)**

1. **Go to**: https://jsonlint.com/
2. **Paste your service account JSON** (the entire content from the downloaded file)
3. **Click "Validate JSON"**
4. **Copy the minified output** (single line)
5. **Use this in Vercel environment variables**

#### **Option B: Manual Formatting**

1. **Open the JSON file** in a text editor
2. **Remove all line breaks and spaces** between JSON properties
3. **Ensure it's all on one line**
4. **Keep the `\n` characters** in the private key (don't convert to actual line breaks)

### **Step 3: Update Vercel Environment Variables**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `ai-risk-assessment-tool`
3. **Go to Settings** → **Environment Variables**
4. **Find `GOOGLE_SERVICE_ACCOUNT_KEY`**
5. **Delete the current value completely**
6. **Paste the minified JSON** (single line)
7. **Click "Save"**

### **Step 4: Redeploy Application**

1. **Go to Deployments** tab in Vercel
2. **Click "Redeploy"** on the latest deployment
3. **Wait for deployment to complete**

### **Step 5: Test the Fix**

1. **Visit**: `https://ai-risk-assessment-tool-peach.vercel.app/debug`
2. **Click "Test Google API Access"**
3. **Should work without JWT signature errors**

## 🔍 **Key Format Requirements**

Your service account JSON should look like this (all on one line):


## ⚠️ **Important Notes**

1. **Keep `\n` characters** in the private key (don't convert to actual line breaks)
2. **All on one line** - no line breaks in the JSON
3. **Valid JSON format** - use a JSON formatter to ensure it's valid
4. **Complete key** - include all fields from the original JSON

## 🔧 **Troubleshooting**

### **If you get "Invalid JWT Signature" error:**
1. **Check the JSON format** - must be valid JSON
2. **Check line breaks** - should be `\n` not actual line breaks
3. **Check completeness** - all required fields must be present
4. **Redeploy** after making changes

### **If you get "Permission denied" error:**
1. **Share your Google Drive folder** with the service account
2. **Share your template document** with the service account
3. **Set permissions to "Editor"** for both

## ✅ **Success Indicators**

After proper setup:
- ✅ **Debug page works** - No JWT signature errors
- ✅ **Google API access works** - All tests pass
- ✅ **Report generation works** - PDFs are created and uploaded
- ✅ **No 500 errors** - All steps complete successfully

## 🎯 **Next Steps**

1. **Format your service account key** using the instructions above
2. **Update Vercel environment variables** with the formatted key
3. **Redeploy your application**
4. **Test the debug page** to verify it works
5. **Test the complete flow** - payment → questionnaire → report generation

The key is to ensure the JSON is properly formatted as a single line with `\n` characters preserved in the private key! 🎉
