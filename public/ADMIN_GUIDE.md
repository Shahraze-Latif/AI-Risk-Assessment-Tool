# AI Compliance Readiness Check - Admin Guide

## 📋 Overview

This guide explains how to manage the AI Compliance Readiness Check system, including adjusting scoring weights, updating templates, and regenerating reports.

## 🔧 System Configuration

### Environment Variables

Ensure these environment variables are set in your deployment:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=your_supabase_service_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Google APIs Configuration
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

# Domain Configuration
NEXT_PUBLIC_DOMAIN_URL=https://your-domain.com
```

## 📊 Adjusting Scoring Weights and Thresholds

### 1. Category Weights

Edit `lib/readinessScoring.ts` to modify category weights:

```typescript
export const CATEGORY_WEIGHTS = {
  governance: 0.25,        // 25% - Adjust as needed
  data: 0.20,            // 20% - Adjust as needed
  security: 0.20,         // 20% - Adjust as needed
  vendors: 0.15,          // 15% - Adjust as needed
  human_oversight: 0.10,   // 10% - Adjust as needed
  transparency: 0.10      // 10% - Adjust as needed
} as const;
```

**Important**: Weights must total 1.0 (100%).

### 2. Risk Level Thresholds

Modify the `getOverallLabel` function in `lib/readinessScoring.ts`:

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

Update the `generatePlan` function in `lib/readinessScoring.ts`:

```typescript
function generatePlan(areaScores: Record<string, AreaScore>, answers: Record<string, number>): string[] {
  const plan: string[] = [];

  // Security ≥ 2 → "Enable MFA and RBAC for admins"
  if (areaScores.security.score >= 2) {  // Adjust threshold
    plan.push("Enable MFA and RBAC for admins");
  }

  // Add more rules as needed...
  return plan;
}
```

## 📝 Updating Google Doc Template

### 1. Access the Template

The master template is located at:
- **Document ID**: `1ipBRhSi31pwGMImbXxCRCa5TUCGwdz0P`
- **Access**: Google Docs with service account permissions

### 2. Available Placeholders

Replace these placeholders in your template:

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

### 3. Template Structure

Recommended template sections:

1. **Executive Summary**
   - Overall score and risk level
   - Key findings overview

2. **Risk Heatmap**
   - Visual table of all areas
   - Color-coded risk levels

3. **Detailed Findings**
   - Per-area analysis
   - Specific recommendations

4. **30-Day Action Plan**
   - Prioritized tasks
   - Implementation timeline

5. **Appendix**
   - Methodology explanation
   - Next steps guidance

## 🔄 Regenerating Reports

### 1. Admin Interface

Access the admin panel at `/admin/reports` to:
- View all readiness checks
- Generate reports for paid assessments
- Download completed reports
- Monitor processing status

### 2. Manual Regeneration

Use the API endpoint directly:

```bash
curl -X POST https://your-domain.com/api/report/generate \
  -H "Content-Type: application/json" \
  -d '{"clientId": "readiness-check-id"}'
```

### 3. Bulk Regeneration

For multiple reports, use the admin interface or create a script:

```javascript
const clientIds = ['id1', 'id2', 'id3'];
for (const id of clientIds) {
  await fetch('/api/report/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: id })
  });
}
```

## 📁 Template Management

### 1. Template Files

Store template files in `/public/templates/`:

- `model-inventory.docx` - AI model inventory template
- `data-map.docx` - Data mapping template
- `vendor-register.docx` - Vendor management template
- `dpia-lite.docx` - Data protection impact assessment
- `policy-brief.docx` - AI policy template

### 2. Updating Templates

1. Replace files in `/public/templates/`
2. Update template links in admin interface
3. Test template downloads
4. Update documentation

### 3. Template Access

Templates are accessible via:
- Admin interface: `/admin/reports`
- Direct links: `/templates/filename.docx`
- API endpoint: `/api/templates/filename`

## 🧪 Testing and Validation

### 1. Test Flow

Complete end-to-end testing:

1. **Payment Flow**
   - Create test payment
   - Verify webhook processing
   - Check database status

2. **Questionnaire**
   - Complete all 12 questions
   - Verify scoring calculation
   - Check data storage

3. **Report Generation**
   - Generate test report
   - Verify placeholder replacement
   - Check PDF export
   - Test download functionality

### 2. Validation Checklist

- [ ] All placeholders replaced correctly
- [ ] PDF exports without errors
- [ ] Google Drive integration works
- [ ] Email notifications sent
- [ ] Admin interface functional
- [ ] Template downloads work
- [ ] Scoring calculations accurate

## 🚨 Troubleshooting

### Common Issues

1. **Google API Errors**
   - Check service account permissions
   - Verify API quotas
   - Review authentication setup

2. **Template Not Found**
   - Verify document ID
   - Check service account access
   - Confirm template exists

3. **PDF Generation Fails**
   - Check Google Drive permissions
   - Verify file export settings
   - Review error logs

4. **Scoring Issues**
   - Validate answer data
   - Check weight calculations
   - Review threshold settings

### Debug Mode

Enable detailed logging:

```bash
DEBUG=readiness-check,google-apis
```

### Support Contacts

- **Technical Issues**: Check application logs
- **Google API Issues**: Google Cloud Console
- **Stripe Issues**: Stripe Dashboard
- **Database Issues**: Supabase Dashboard

## 📈 Monitoring and Analytics

### 1. Key Metrics

Track these metrics:
- Total assessments completed
- Average processing time
- Report generation success rate
- Client satisfaction scores

### 2. Performance Monitoring

Monitor:
- API response times
- Google API quota usage
- Database query performance
- File storage usage

### 3. Error Tracking

Set up alerts for:
- Failed report generations
- API rate limit exceeded
- Database connection issues
- Google API errors

## 🔐 Security Considerations

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

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Contact**: Admin Support

