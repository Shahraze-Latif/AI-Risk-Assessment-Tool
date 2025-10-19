# Environment Variables Setup Guide

This guide covers all environment variables needed for the AI Compliance Readiness Check system.

## 🔐 **Security Best Practices**

- ✅ **Never commit** environment variables to version control
- ✅ **Use .env.local** for local development
- ✅ **Set in Vercel** for production deployment
- ✅ **Keep sensitive data** in environment variables only

## 📋 **Required Environment Variables**

### **1. PDF Generation Configuration**

```bash
# No Google API configuration required!
# PDF generation is now handled locally using jsPDF and HTML templates.
# The system uses the HTML template at: public/ai-readiness-check-template/Readiness_Report_Template.html
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
# No Google API configuration required - PDF generation is now local!
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
| ~~Google API variables~~ | ~~No longer required~~ | ~~Removed~~ |
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
