# Report Generation Setup Guide

This guide covers the complete setup for the Google Docs → PDF → Drive upload report generation pipeline.

## 🎯 **What's Implemented**

### **Complete Report Generation Pipeline:**
- ✅ **Google Docs API Integration**: Copy template and replace placeholders
- ✅ **PDF Export**: Convert Google Doc to PDF
- ✅ **Drive Upload**: Store PDF in configured Drive folder
- ✅ **Supabase Integration**: Save report URL to database
- ✅ **Automatic Trigger**: Report generates after questionnaire completion

## 🔧 **API Endpoints**

### **1. Assessment Submission** (`/api/readiness-check`)
- Processes questionnaire answers
- Calculates scores and generates 30-day plan
- Saves to Supabase with status='processing'
- Returns readiness check ID

### **2. Report Generation** (`/api/generate-report`)
- Fetches assessment data from Supabase
- Copies Google Doc template
- Replaces all placeholders with real data
- Exports as PDF and uploads to Drive
- Updates Supabase with report URL
- Returns Drive file link

## 📋 **Required Environment Variables**

```bash
# Google APIs Configuration
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_TEMPLATE_DOC_ID=1oG64k9qBy8r8lLJkMS5HF4yxwfXCXYPWxtag9Ubj3XQ
GOOGLE_DRIVE_FOLDER_ID=1Qgg1pgcgS20dLBcDqfJm6YJReGzX1Lyh

# Other required variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=your_supabase_service_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_DOMAIN_URL=https://your-domain.com
```

## 🧪 **Testing the Complete Flow**

### **1. End-to-End Test**
1. **Complete Payment**: Go through Stripe checkout
2. **Fill Questionnaire**: Answer all 12 questions
3. **Submit Assessment**: System processes and generates report
4. **Check Supabase**: Verify report_url is saved
5. **Download PDF**: Access the generated report

### **2. Manual Report Generation**
You can also trigger report generation manually:

```bash
curl -X POST https://your-domain.com/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{"readinessCheckId": "your-readiness-check-id"}'
```

## 📊 **Report Content**

### **Placeholders Replaced:**
- `{{CLIENT_NAME}}` → Client's name from Stripe/payment data
- `{{DATE}}` → Report generation date
- `{{OVERALL_SCORE}}` → Weighted overall score and risk label
- `{{HEATMAP_TABLE}}` → Risk heatmap table (6 categories × risk levels)
- `{{AREA_SCORES}}` → Individual area scores with labels
- `{{FINDINGS_BY_AREA}}` → Detailed findings per area
- `{{30_DAY_PLAN}}` → Generated action plan (5-8 tasks)
- `{{APPENDIX}}` → Methodology and next steps

### **Generated Content:**
1. **Executive Summary**: Overall score and risk level
2. **Risk Heatmap**: Visual table of all areas
3. **Detailed Findings**: Per-area analysis with recommendations
4. **30-Day Action Plan**: Prioritized tasks for implementation
5. **Appendix**: Methodology explanation and next steps

## 🔄 **Complete Workflow**

### **1. User Journey**
1. **Payment Complete** → User redirected to questionnaire
2. **Questionnaire Complete** → Data saved with status='processing'
3. **Report Generation** → Automatic PDF creation and upload
4. **Success Confirmation** → User sees completion message

### **2. Backend Process**
1. **Assessment Processing** → Calculate scores and generate plan
2. **Google Doc Copy** → Copy template document
3. **Placeholder Replacement** → Insert real data
4. **PDF Export** → Convert to PDF format
5. **Drive Upload** → Store in configured folder
6. **Database Update** → Save report URL and status='completed'

## 🚀 **Deployment Checklist**

### **Before Deployment:**
- [ ] Google Cloud project created
- [ ] APIs enabled (Docs, Drive)
- [ ] Service account created and key downloaded
- [ ] Template document shared with service account
- [ ] Drive folder created and shared
- [ ] Environment variables set in Vercel
- [ ] Supabase database updated
- [ ] Dependencies installed (`dayjs`)

### **After Deployment:**
- [ ] Test complete payment flow
- [ ] Test questionnaire completion
- [ ] Verify report generation works
- [ ] Check PDF is created and accessible
- [ ] Confirm Supabase record is updated
- [ ] Test manual report generation

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **Google API Authentication**
   - Check service account JSON format
   - Verify API permissions
   - Check quota limits

2. **Template Access**
   - Verify document ID is correct
   - Check sharing permissions
   - Confirm service account access

3. **PDF Generation**
   - Check Drive folder permissions
   - Verify export settings
   - Review error logs

4. **Database Issues**
   - Check Supabase connection
   - Verify table schema
   - Review RLS policies

### **Debug Mode:**
Enable detailed logging:
```bash
DEBUG=readiness-check,google-apis,report-generation
```

## 📈 **Monitoring**

### **Key Metrics:**
- Report generation success rate
- Average processing time
- Google API quota usage
- PDF file sizes
- Drive storage usage

### **Error Tracking:**
Set up alerts for:
- Failed report generations
- API rate limit exceeded
- Database connection issues
- Google API errors

## 🔐 **Security Considerations**

### **Access Control:**
- Service account has minimal required permissions
- Drive folder access is restricted
- Template document is read-only for service account

### **Data Protection:**
- Client data is encrypted in transit
- PDF files are stored securely in Drive
- Database access is controlled via RLS

## 📞 **Support**

### **Documentation:**
- API Documentation: Check code comments
- Google APIs Guide: Google Cloud Console
- Supabase Guide: Supabase Dashboard

### **Getting Help:**
1. Check application logs
2. Review error messages
3. Test with sample data
4. Contact system administrator

---

**Status**: ✅ Complete  
**Last Updated**: January 2025  
**Next Review**: March 2025
