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

```json
{"type":"service_account","project_id":"polar-scarab-475321-g9","private_key_id":"516ed155fbc4d1765f916615c8ce1ede02ca3793","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCiOxIuz2O98e0v\n1dfAmRX5nl+w8WlkKzqCNmgTeidQi5og1JLuOhP3rUsKYuUnvHzdKZ7YM1TrKK8w\ne7fZ5j9ueCxnqoi3PXen/GAlR9o0mE3QUDYpGtXbRm7BAmvPPYh4k0NH+EL9Urzr\nQ918AdskhQg3LOACC8yvSgZTxhgYpbs9QGQagy0nVPo0H02LX3O2Ud5pVnL9sfvR\newMN71n0/VcMOJRUqWXAm3gx2Cu4qiQkBC+82YCodrreB7ZbHXM28v/kNzAMwk4v\n0Dt5pcRj1UcUFfAyPsqMg4MSZhgxcr53cjynLKcvR1NiAdl27fw0s1v+CplZOcmJ\nQZd9Mw1HAgMBAAECggEAKcy6lKEO/AP3rxmUK6XGCbkKwtaQ5yRUQPSvwET7GD/A\nCLF84jDIsEpQSW7NyH1CVuHAcchYGvcynHVkG5q9wULpfhRsgXou+HOIelKXIHIV\nqpTgP5sQex0csFJlYNJj9V1MOqD28bp9vsiPqsH3quM0CLNhTGWp6YhTNQaXctHn\nbic51KzmHuw9Kt8NZZu4pNSdPVTp4w5MiXIyAYIvCRChPHEiHV0N5EMRY2AW+Qye\nxwilNLtyQRaZsw/sHKXCzts+OgD8oFdpO8zpaEXoiMQOJcMEQ4nCblqR+dQQoAVl\n/BTvnZ+Km9pkHbgdBufk9RRqT9wIsLu+JF4arMYsAQKBgQDhVT2xyIwJsSk8+TJ7\nnPExvDon1z+z2a80gwXqG1NmFApPB0DXlzE7UbzkwUEAp38xQgdxMsWdXJxRIGBz\nCCcHoFepB9VlHjutrYeJxE1UKqMpsq0Ale8yHaa5VhXP+Llufm7mWWS9Evd8EAV0\nVNIOJlL+sRHk3BLfqe+11bjQRwKBgQC4T03czSYAr6dqxUa/fHevCHnccT+43Vwz\nhqGOameMvPaijJZ9TRUHB08Kr3vvSYKjwBEdyXgNrUq1wrkDZhjXw6H2kqc/nfZl\nhClidjJ+nZwiJMfXGlMVM8Bu08gLCFTMW3OHgZy74VpNY3KDpqiPh+mTeucMxZzR\njaGj4IdbAQKBgCZlHukPMgVowY0ZLSfw+wwtdX9aZwlfO0JoXPaiB1jqa0NCCiNy\nKLph2BzmbQwOflbHWHtKWm/Q2vXb3XNcXUIoaSdtJUhgmWyjl+e6oi6IQVsWjfH+\nmk5gzQrhhz/zsq0IMB9h9g9djvv9wuAqn8w3bYbmZxUnBrRDwYurSh17AoGAKvU4\n9azPHbvTLpyad8kf8CjulkXDD2hwtAW+I/6C8hec+JgB/2R28TNv5dKu9T/R9i6v\nDp1FoRJx5lljW/pw8eFEH79gwgAkTNb3+l4IOOCtYnvmJCmbkcaFJI+yAXhIo3Tx\nQXUhPd0xefYi27J9eS65b0lnDuAERAdZ1GNhyQECgYB30N+j4JusE3IZ2Tq5Av/Z\nlAtCPnJBS9otawpxquRrjyo/8QG7EDH7Uw6z/Xvf6y8I9oRNpmdmWpVPeLynzx3h\nuivjTCyn9VKD5po1Z+2kxA+v8tMMa3/jiNbDyhAfL4EY5bVwGEQ7O78YSKUaHiS0\naPURxSpjvnF0RBoPu2nOJg==\n-----END PRIVATE KEY-----\n","client_email":"ai-compliance-readiness-check@polar-scarab-475321-g9.iam.gserviceaccount.com","client_id":"107637948578903608311","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/ai-compliance-readiness-check%40polar-scarab-475321-g9.iam.gserviceaccount.com","universe_domain":"googleapis.com"}
```

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
