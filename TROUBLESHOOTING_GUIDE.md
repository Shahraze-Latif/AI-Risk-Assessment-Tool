# 🔧 Troubleshooting Guide - Report Generation

## 🚨 Common Issues and Solutions

### 1. **500 Error in Report Generation**

#### **Symptoms:**
- Console shows: `Failed to load resource: the server responded with a status of 500`
- Assessment completes but report generation fails
- Google Drive folder remains empty

#### **Root Causes & Solutions:**

### **A. Missing Environment Variables**

**Check these environment variables in Vercel:**

```bash
# Required for Google APIs
GOOGLE_SERVICE_ACCOUNT_KEY=your_service_account_json_here
GOOGLE_TEMPLATE_DOC_ID=your_template_doc_id
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id

# Optional but recommended
GOOGLE_SHEET_ID=your_sheet_id
```

**How to verify:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Ensure all required variables are set
3. Redeploy after adding missing variables

### **B. Invalid Google Service Account Key**

**Symptoms:**
- Error: "GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON"
- Error: "Google APIs initialization failed"

**Solution:**
1. Download the service account JSON from Google Cloud Console
2. Copy the entire JSON content (including curly braces)
3. Paste it as a single-line value in Vercel environment variables
4. Ensure no extra quotes or escaping

**Example format:**
```json
{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

### **C. Invalid Google Document IDs**

**Symptoms:**
- Error: "Failed to copy template document"
- Error: "Template copy failed - no document ID returned"

**Solution:**
1. **Template Document ID**: Extract from Google Docs URL
   - URL: `https://docs.google.com/document/d/1oG64k9qBy8r8lLJkMS5HF4yxwfXCXYPWxtag9Ubj3XQ/edit`
   - ID: `1oG64k9qBy8r8lLJkMS5HF4yxwfXCXYPWxtag9Ubj3XQ`

2. **Drive Folder ID**: Extract from Google Drive URL
   - URL: `https://drive.google.com/drive/folders/1Qgg1pgcgS20dLBcDqfJm6YJReGzX1Lyh`
   - ID: `1Qgg1pgcgS20dLBcDqfJm6YJReGzX1Lyh`

3. **Sheet ID**: Extract from Google Sheets URL
   - URL: `https://docs.google.com/spreadsheets/d/1tBb8JeP-x8u2zidMMUetLmpofHczGknkOSlhrpv5_B0/edit`
   - ID: `1tBb8JeP-x8u2zidMMUetLmpofHczGknkOSlhrpv5_B0`

### **D. Google API Permissions**

**Symptoms:**
- Error: "Failed to copy template document"
- Error: "Failed to upload PDF to Drive"

**Required Permissions:**
1. **Service Account must have access to:**
   - Template document (viewer or editor)
   - Drive folder (editor)
   - Google Sheets (if using)

2. **Google Cloud Console Setup:**
   - Enable Google Docs API
   - Enable Google Drive API
   - Enable Google Sheets API (if using)

### **E. Template Document Issues**

**Symptoms:**
- Error: "Failed to replace placeholders"
- Report generated but with missing content

**Solution:**
1. Ensure template document contains all required placeholders:
   ```
   {{CLIENT_NAME}}
   {{DATE}}
   {{OVERALL_SCORE}}
   {{HEATMAP_TABLE}}
   {{AREA_SCORES}}
   {{FINDINGS_BY_AREA}}
   {{30_DAY_PLAN}}
   {{APPENDIX}}
   ```

2. Make sure template is accessible to service account

## 🔍 **Debugging Steps**

### **Step 1: Check Environment Variables**
```bash
# In Vercel, check if these are set:
echo $GOOGLE_SERVICE_ACCOUNT_KEY
echo $GOOGLE_TEMPLATE_DOC_ID  
echo $GOOGLE_DRIVE_FOLDER_ID
```

### **Step 2: Test Google API Access**
1. Go to Google Cloud Console
2. Navigate to APIs & Services → Credentials
3. Find your service account
4. Test API access manually

### **Step 3: Check Vercel Logs**
1. Go to Vercel Dashboard → Your Project → Functions
2. Click on the failed function
3. Check the logs for detailed error messages

### **Step 4: Verify Document IDs**
1. Open your Google Docs template
2. Copy the document ID from URL
3. Ensure it matches your environment variable

## 🛠️ **Quick Fixes**

### **Fix 1: Update Environment Variables**
```bash
# In Vercel Dashboard:
GOOGLE_TEMPLATE_DOC_ID=1oG64k9qBy8r8lLJkMS5HF4yxwfXCXYPWxtag9Ubj3XQ
GOOGLE_DRIVE_FOLDER_ID=1Qgg1pgcgS20dLBcDqfJm6YJReGzX1Lyh
GOOGLE_SHEET_ID=1tBb8JeP-x8u2zidMMUetLmpofHczGknkOSlhrpv5_B0
```

### **Fix 2: Redeploy After Changes**
1. Make environment variable changes
2. Go to Vercel Dashboard → Deployments
3. Click "Redeploy" on latest deployment

### **Fix 3: Test API Endpoint**
```bash
# Test the endpoint directly:
curl -X POST https://your-app.vercel.app/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{"readinessCheckId":"your-test-id"}'
```

## 📋 **Required Configuration Checklist**

- [ ] `GOOGLE_SERVICE_ACCOUNT_KEY` - Valid JSON service account key
- [ ] `GOOGLE_TEMPLATE_DOC_ID` - Valid Google Docs template ID
- [ ] `GOOGLE_DRIVE_FOLDER_ID` - Valid Google Drive folder ID
- [ ] Service account has access to template document
- [ ] Service account has access to Drive folder
- [ ] Google APIs enabled in Cloud Console
- [ ] Template document contains all required placeholders

## 🆘 **Still Having Issues?**

1. **Check Vercel Function Logs** for detailed error messages
2. **Verify all environment variables** are set correctly
3. **Test Google API access** manually in Cloud Console
4. **Ensure service account permissions** are correct
5. **Check template document** has all required placeholders

## 📞 **Support**

If you're still experiencing issues:
1. Check the detailed error logs in Vercel
2. Verify all configuration steps
3. Test each component individually
4. Contact support with specific error messages
