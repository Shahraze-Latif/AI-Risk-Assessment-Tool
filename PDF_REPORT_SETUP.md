# PDF Report Generation Setup Guide

## Overview
This guide explains how to set up automated PDF report generation from your Google Sheet data using a Google Doc template.

## Prerequisites
- Google Apps Script deployed and working
- Google Sheet with Intake, Scores, and Plan tabs
- Google Doc template with placeholders
- Google Drive folder for PDF output

## Step 1: Create Google Doc Template

1. **Create a new Google Doc** with your report template
2. **Add placeholders** using the format `{{PlaceholderName}}`
3. **Save the document** and note its ID from the URL

### Required Placeholders:
```
{{ClientName}}
{{ReportDate}}
{{TopRisks}}
{{QuickWins}}

{{Governance_Level}}
{{Data_Level}}
{{Security_Level}}
{{Vendors_Level}}
{{HumanOversight_Level}}
{{Transparency_Level}}

{{Governance_Why}}
{{Data_Why}}
{{Security_Why}}
{{Vendors_Why}}
{{HumanOversight_Why}}
{{Transparency_Why}}

{{Governance_Findings}}
{{Data_Findings}}
{{Security_Findings}}
{{Vendors_Findings}}
{{HumanOversight_Findings}}
{{Transparency_Findings}}

{{EU_AI_Act_101}}
{{US_Healthcare_Lens}}
```

## Step 2: Create Output Folder

1. **Create a Google Drive folder** for PDF outputs
2. **Note the folder ID** from the URL
3. **Ensure the Apps Script has access** to this folder

## Step 3: Update Configuration

In your Google Apps Script (`Code.gs`), update these lines:

```javascript
const TEMPLATE_ID = 'YOUR_GOOGLE_DOC_TEMPLATE_ID'; // Replace with your template Google Doc ID
const OUTPUT_FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID'; // Replace with your output folder ID
```

## Step 4: Test the Setup

1. **Run a test assessment** through your questionnaire
2. **Check the Google Drive folder** for the generated PDF
3. **Verify the PDF content** matches your template

## How It Works

### 1. **Template Duplication**
- Creates a copy of your template document
- Preserves the original template unchanged

### 2. **Data Extraction**
- Gets latest row from Intake tab
- Retrieves scores from Scores tab
- Processes form data for insights

### 3. **Placeholder Replacement**
- Replaces all `{{PlaceholderName}}` with actual data
- Generates intelligent insights based on scores
- Creates compliance-specific recommendations

### 4. **PDF Generation**
- Converts the filled document to PDF
- Saves to specified Drive folder
- Names file: `Client_ReadinessCheck_YYYY-MM-DD.pdf`
- Cleans up temporary copy

## Generated Content Examples

### Top Risks
- Automatically identifies areas with scores ≥2
- Lists them in order of severity
- Example: "Security (3/3), Data (2/3), Vendors (2/3)"

### Quick Wins
- Suggests immediate actionable items
- Based on current scores and form data
- Example: "Add AI disclosure text, Enable MFA, Publish AI policy"

### Level Descriptions
- **Low Risk**: Score ≤1
- **Medium Risk**: Score ≤2  
- **High Risk**: Score ≥3

### Why Explanations
- Contextual explanations for each area
- Based on actual scores and form responses
- Tailored to specific risk levels

### Findings
- Detailed recommendations for each area
- Bullet-pointed actionable items
- Specific to the assessment results

### Compliance Insights
- **EU AI Act**: Based on EUUsers flag and transparency/oversight scores
- **US Healthcare**: Based on PHI flag and data/security scores

## File Naming
- Format: `Client_ReadinessCheck_YYYY-MM-DD.pdf`
- Example: `Client_ReadinessCheck_2025-01-20.pdf`

## Troubleshooting

### Common Issues:
1. **Template not found**: Check TEMPLATE_ID is correct
2. **Folder access denied**: Ensure Apps Script has Drive permissions
3. **Placeholders not replaced**: Check placeholder format matches exactly
4. **PDF not generated**: Verify template document is accessible

### Debug Steps:
1. Check Apps Script execution logs
2. Verify template document permissions
3. Test with a simple template first
4. Ensure all required sheets exist

## Security Notes
- Template document should be read-only for most users
- Output folder should have appropriate sharing settings
- Apps Script runs with the same permissions as the script owner

## Next Steps
1. Create your Google Doc template
2. Set up the output folder
3. Update the configuration in the script
4. Test with a sample assessment
5. Customize the template as needed

The PDF generation will now happen automatically when users complete the questionnaire!







