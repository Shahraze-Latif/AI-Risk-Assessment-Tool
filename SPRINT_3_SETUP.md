# Sprint 3: Report Generation & Delivery Setup

This guide covers the complete setup for Sprint 3 of the AI Compliance Readiness Check system.

## 🎯 **Sprint 3 Overview**

Sprint 3 implements the complete report generation and delivery flow:
- ✅ Google Docs API integration
- ✅ PDF generation and storage
- ✅ Admin interface for report management
- ✅ Template pack with 5 compliance templates
- ✅ Complete end-to-end workflow

## 🔧 **Setup Requirements**

### 1. Google Cloud Setup

#### **Create Service Account**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the following APIs:
   - Google Docs API
   - Google Drive API
4. Go to **IAM & Admin** → **Service Accounts**
5. Create a new service account:
   - Name: `ai-compliance-readiness-check`
   - Description: `Service account for AI Compliance Readiness Check`
6. Create and download the JSON key file

#### **Configure Permissions**

1. Add the service account to your Google Doc template:
   - Open the template document (ID: `1ipBRhSi31pwGMImbXxCRCa5TUCGwdz0P`)
   - Share with the service account email
   - Grant "Editor" permissions

2. Create a Google Drive folder for reports:
   - Create folder: "AI Compliance Reports"
   - Share with service account
   - Grant "Editor" permissions
   - Note the folder ID for the API

### 2. Environment Variables

Add these to your `.env.local` and Vercel environment:

```bash
# Google APIs Configuration
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

# Google Drive Folder ID (optional, for organizing reports)
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

### 3. Install Dependencies

```bash
npm install googleapis
```

## 📋 **Template Setup**

### 1. Google Doc Template

The system uses a master template with these placeholders:

```
{{CLIENT_NAME}}        - Client's name
{{DATE}}              - Report generation date
{{OVERALL_SCORE}}     - Weighted overall score and label
{{HEATMAP_TABLE}}     - Risk heatmap table
{{AREA_SCORES}}        - Individual area scores
{{FINDINGS_BY_AREA}}   - Detailed findings per area
{{30_DAY_PLAN}}        - Generated action plan
{{APPENDIX}}           - Methodology and next steps
```

### 2. Template Files

Add these template files to `/public/templates/`:

- `model-inventory.docx` - AI model inventory template
- `data-map.docx` - Data mapping template
- `vendor-register.docx` - Vendor management template
- `dpia-lite.docx` - Data protection impact assessment
- `policy-brief.docx` - AI policy template

## 🚀 **Deployment Steps**

### 1. Update Environment Variables

In your Vercel dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add `GOOGLE_SERVICE_ACCOUNT_KEY` with your service account JSON
3. Add `GOOGLE_DRIVE_FOLDER_ID` (optional)
4. Redeploy the application

### 2. Test Google API Connection

Test the connection by visiting `/admin/reports` and trying to generate a report.

### 3. Verify Template Access

Ensure the service account can access the Google Doc template:
- Document ID: `1ipBRhSi31pwGMImbXxCRCa5TUCGwdz0P`
- Service account has "Editor" permissions

## 🧪 **Testing Checklist**

### 1. Complete Flow Test

- [ ] User completes payment
- [ ] User fills out questionnaire
- [ ] Admin generates report
- [ ] PDF is created and stored
- [ ] Report URL is saved to database
- [ ] User can download report

### 2. Template Testing

- [ ] All placeholders are replaced correctly
- [ ] PDF exports without errors
- [ ] Google Drive integration works
- [ ] Template files are accessible
- [ ] Admin interface functions properly

### 3. Error Handling

- [ ] Invalid client ID handling
- [ ] Google API error handling
- [ ] Network timeout handling
- [ ] Permission error handling

## 📊 **Admin Interface**

### Access Admin Panel

Navigate to `/admin/reports` to:
- View all readiness checks
- Generate reports for paid assessments
- Download completed reports
- Monitor processing status
- Access template files

### Key Features

1. **Report Management**
   - View all assessments
   - Generate reports on demand
   - Download completed reports
   - Monitor processing status

2. **Template Management**
   - Access all template files
   - Download compliance templates
   - Manage template versions

3. **Analytics Dashboard**
   - Total assessments
   - Completion rates
   - Processing status
   - Performance metrics

## 🔧 **Configuration Options**

### 1. Scoring Weights

Edit `lib/readinessScoring.ts` to adjust category weights:

```typescript
export const CATEGORY_WEIGHTS = {
  governance: 0.25,        // 25%
  data: 0.20,            // 20%
  security: 0.20,         // 20%
  vendors: 0.15,          // 15%
  human_oversight: 0.10,   // 10%
  transparency: 0.10      // 10%
} as const;
```

### 2. Risk Thresholds

Modify risk level thresholds in the same file:

```typescript
function getOverallLabel(weightedScore: number): 'Low' | 'Medium' | 'High' {
  if (weightedScore <= 1) {        // Adjust threshold
    return 'Low';
  } else if (weightedScore <= 2) { // Adjust threshold
    return 'Medium';
  } else {
    return 'High';
  }
}
```

### 3. 30-Day Plan Rules

Update plan generation rules:

```typescript
function generatePlan(areaScores: Record<string, AreaScore>, answers: Record<string, number>): string[] {
  const plan: string[] = [];
  
  // Add your custom rules here
  if (areaScores.security.score >= 2) {
    plan.push("Enable MFA and RBAC for admins");
  }
  
  return plan;
}
```

## 🐛 **Troubleshooting**

### Common Issues

1. **Google API Authentication**
   - Check service account JSON format
   - Verify API permissions
   - Check quota limits

2. **Template Access**
   - Verify document ID
   - Check sharing permissions
   - Confirm service account access

3. **PDF Generation**
   - Check Google Drive permissions
   - Verify export settings
   - Review error logs

4. **Database Issues**
   - Check Supabase connection
   - Verify table schema
   - Review RLS policies

### Debug Mode

Enable detailed logging:

```bash
DEBUG=readiness-check,google-apis
```

## 📈 **Monitoring**

### Key Metrics to Track

- Report generation success rate
- Average processing time
- Google API quota usage
- Client satisfaction scores

### Performance Monitoring

- API response times
- Database query performance
- File storage usage
- Error rates

## 🔐 **Security Considerations**

### 1. Access Control

- Restrict admin interface access
- Use strong authentication
- Monitor admin actions
- Regular access reviews

### 2. Data Protection

- Encrypt sensitive data
- Secure API endpoints
- Regular security audits
- GDPR compliance

### 3. Backup and Recovery

- Regular database backups
- Template file backups
- Configuration backups
- Disaster recovery plan

## 📞 **Support**

### Documentation

- Admin Guide: `/public/ADMIN_GUIDE.md`
- API Documentation: Check code comments
- Template Guide: `/public/templates/README.md`

### Getting Help

1. Check application logs
2. Review error messages
3. Test with sample data
4. Contact system administrator

---

**Sprint 3 Status**: ✅ Complete  
**Last Updated**: January 2025  
**Next Review**: March 2025

