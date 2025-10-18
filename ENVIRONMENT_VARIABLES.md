# Environment Variables Setup Guide

This guide covers all environment variables needed for the AI Compliance Readiness Check system.

## 🔐 **Security Best Practices**

- ✅ **Never commit** environment variables to version control
- ✅ **Use .env.local** for local development
- ✅ **Set in Vercel** for production deployment
- ✅ **Keep sensitive data** in environment variables only

## 📋 **Required Environment Variables**

### **1. Google APIs Configuration**

```bash
# Google Service Account Key (JSON format)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

# Google Service Account Email (REQUIRED - for ownership transfers)
GOOGLE_SERVICE_ACCOUNT_EMAIL=ai-readiness-service@ai-compliance-readiness.iam.gserviceaccount.com

# Google Template Document ID (REQUIRED - no fallback)
GOOGLE_TEMPLATE_DOC_ID=your_template_document_id_here

# Google Sheet ID (REQUIRED - no fallback)
GOOGLE_SHEET_ID=your_google_sheet_id_here

# Google Drive Folder ID (REQUIRED - no fallback)
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id_here
```

### **2. Stripe Configuration**

```bash
# Stripe Secret Key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### **3. Supabase Configuration**

```bash
# Supabase URL
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url

# Supabase Service Key
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### **4. Domain Configuration**

```bash
# Production Domain URL
NEXT_PUBLIC_DOMAIN_URL=https://ai-risk-assessment-tool-peach.vercel.app
```

## 🔧 **Local Development Setup**

### **1. Create .env.local File**

Create a `.env.local` file in your project root:

```bash
# Copy this template and fill in your values
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_SERVICE_ACCOUNT_EMAIL=ai-readiness-service@ai-compliance-readiness.iam.gserviceaccount.com
GOOGLE_TEMPLATE_DOC_ID=1sdcsdc
GOOGLE_SHEET_ID=scsc
GOOGLE_DRIVE_FOLDER_ID=sdcs
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=your_supabase_service_key
NEXT_PUBLIC_DOMAIN_URL=http://localhost:3000
```

### **2. Add to .gitignore**

Ensure `.env.local` is in your `.gitignore`:

```gitignore
# Environment variables
.env.local
.env
.env.production
.env.development
```

## 🚀 **Production Deployment (Vercel)**

### **1. Set Environment Variables in Vercel**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | `{"type":"service_account",...}` | Production |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `ai-readiness-service@ai-compliance-readiness.iam.gserviceaccount.com` | Production |
| `GOOGLE_TEMPLATE_DOC_ID` | `sdd` | Production |
| `GOOGLE_SHEET_ID` | `1tBb8JeP-sdcssc` | Production |
| `GOOGLE_DRIVE_FOLDER_ID` | `sdcs` | Production |
| `STRIPE_SECRET_KEY` | `sk_live_your_stripe_secret_key` | Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_your_webhook_secret` | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | `your_supabase_url` | Production |
| `NEXT_PUBLIC_SUPABASE_SERVICE_KEY` | `your_supabase_service_key` | Production |
| `NEXT_PUBLIC_DOMAIN_URL` | `https://ai-risk-assessment-tool-peach.vercel.app` | Production |

### **2. Redeploy After Adding Variables**

After setting environment variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger deployment

## 🔄 **Updating Google IDs**

When you get access from the provider, simply update these environment variables:

### **In Vercel Dashboard:**
1. Go to **Settings** → **Environment Variables**
2. Update these variables:
   - `GOOGLE_TEMPLATE_DOC_ID` → Provider's template document ID
   - `GOOGLE_SHEET_ID` → Provider's Google Sheet ID
   - `GOOGLE_DRIVE_FOLDER_ID` → Provider's Drive folder ID
3. Redeploy the application

### **In Local Development:**
1. Update `.env.local` file
2. Restart your development server
3. Test the changes locally

## 🧪 **Testing Environment Variables**

### **1. Verify Variables are Loaded**

Add this to your code temporarily to test:

```typescript
console.log('Google Template Doc ID:', process.env.GOOGLE_TEMPLATE_DOC_ID);
console.log('Google Sheet ID:', process.env.GOOGLE_SHEET_ID);
console.log('Google Drive Folder ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);
```

### **2. Test Google API Connection**

Visit `/admin/reports` and try to generate a report to verify:
- Service account authentication works
- Template document is accessible
- Drive folder permissions are correct

## 🚨 **Security Considerations**

### **1. Never Commit These Files:**
- `.env.local`
- `.env`
- Service account JSON files
- Any file containing API keys

### **2. Use Environment Variables For:**
- API keys and secrets
- Database URLs
- Third-party service IDs
- Configuration values

### **3. Keep Sensitive Data Secure:**
- Use strong, unique keys
- Rotate keys regularly
- Monitor access logs
- Use least privilege principle

## 📋 **Environment Variables Checklist**

- [ ] `.env.local` created for local development
- [ ] All variables set in Vercel for production
- [ ] `.env.local` added to `.gitignore`
- [ ] Service account key properly formatted
- [ ] Google IDs set correctly
- [ ] Stripe keys configured
- [ ] Supabase credentials set
- [ ] Domain URL configured
- [ ] Tested locally
- [ ] Tested in production

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Variables Not Loading**
   - Check variable names are correct
   - Ensure no typos in variable names
   - Restart development server

2. **Google API Errors**
   - Verify service account key format
   - Check API permissions
   - Verify document/folder access

3. **Stripe Webhook Issues**
   - Check webhook URL is correct
   - Verify webhook secret
   - Test webhook endpoint

4. **Database Connection Issues**
   - Verify Supabase URL and key
   - Check database permissions
   - Test connection

---

**Last Updated**: January 2025  
**Security Level**: High  
**Status**: Production Ready
