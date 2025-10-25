# PDF Generation Troubleshooting Guide

## Issue: Placeholders Not Being Replaced

If your PDF shows `{{ClientName}}` instead of actual data, follow these steps:

## Step 1: Check Configuration

### 1.1 Update Template ID
In your Google Apps Script (`Code.gs`), find these lines:
```javascript
const TEMPLATE_ID = 'YOUR_GOOGLE_DOC_TEMPLATE_ID';
const OUTPUT_FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID';
```

**Replace with your actual IDs:**
```javascript
const TEMPLATE_ID = '1ABC123def456GHI789jkl012MNO345pqr678'; // Your actual Google Doc ID
const OUTPUT_FOLDER_ID = '1XYZ789abc012DEF345ghi678JKL901mno234'; // Your actual Drive folder ID
```

### 1.2 Get Your Google Doc ID
1. Open your Google Doc template
2. Copy the ID from the URL: `https://docs.google.com/document/d/[DOC_ID]/edit`
3. Replace `YOUR_GOOGLE_DOC_TEMPLATE_ID` with this ID

### 1.3 Get Your Drive Folder ID
1. Open your Google Drive folder
2. Copy the ID from the URL: `https://drive.google.com/drive/folders/[FOLDER_ID]`
3. Replace `YOUR_GOOGLE_DRIVE_FOLDER_ID` with this ID

## Step 2: Test the Configuration

### 2.1 Run Test Function
In Google Apps Script, run the `testPDFGeneration()` function:
1. Go to Google Apps Script
2. Select `testPDFGeneration` from the function dropdown
3. Click "Run"
4. Check the execution log for errors

### 2.2 Check Execution Log
Look for these messages:
- ✅ `PDF generation test successful` = Working
- ❌ `PDF generation test failed` = Check the error message
- ⚠️ `PDF generation skipped` = IDs not configured

## Step 3: Verify Template Format

### 3.1 Check Placeholder Format
Your template should have placeholders exactly like this:
```
{{ClientName}}
{{ReportDate}}
{{TopRisks}}
{{QuickWins}}
```

**NOT like this:**
```
{ClientName}
{{ClientName}}
{{clientname}}
```

### 3.2 Test with Simple Template
Create a simple test template with just:
```
Client: {{ClientName}}
Date: {{ReportDate}}
```

## Step 4: Check Permissions

### 4.1 Apps Script Permissions
1. Go to Google Apps Script
2. Click "Review permissions"
3. Grant access to Google Drive and Google Docs

### 4.2 Document Permissions
1. Make sure the Apps Script owner can access your template document
2. Make sure the Apps Script owner can access your output folder

## Step 5: Debug Step by Step

### 5.1 Check if PDF Generation is Called
Look in the execution log for:
- `✅ PDF report generated` = PDF generation was called
- `⚠️ PDF generation skipped` = Configuration issue
- `❌ Error generating PDF report` = Runtime error

### 5.2 Check Data Flow
The script should:
1. Get data from Intake tab ✅
2. Get scores from Scores tab ✅
3. Create copy of template ✅
4. Replace placeholders ✅
5. Save as PDF ✅
6. Clean up copy ✅

## Step 6: Common Issues & Solutions

### Issue 1: "Template not found"
**Solution:** Check TEMPLATE_ID is correct and document is accessible

### Issue 2: "Folder access denied"
**Solution:** Check OUTPUT_FOLDER_ID is correct and folder is accessible

### Issue 3: "Placeholders not replaced"
**Solution:** Check placeholder format matches exactly `{{PlaceholderName}}`

### Issue 4: "PDF not generated"
**Solution:** Check template document permissions and format

## Step 7: Manual Test

### 7.1 Create Test Document
1. Create a new Google Doc
2. Add text: `Hello {{ClientName}}`
3. Save and get the document ID
4. Update TEMPLATE_ID in the script
5. Run testPDFGeneration()

### 7.2 Check Output
1. Go to your Drive folder
2. Look for `Client_ReadinessCheck_YYYY-MM-DD.pdf`
3. Open the PDF and check if "Hello Test Client" appears

## Step 8: Full Integration Test

### 8.1 Complete Assessment Flow
1. Go through the full questionnaire
2. Submit the form
3. Check the execution log
4. Check your Drive folder for the PDF

### 8.2 Verify Content
Open the generated PDF and verify:
- Client name appears correctly
- Date is current
- Risk levels are populated
- Findings are detailed
- All placeholders are replaced

## Still Not Working?

### Check These:
1. **Template ID**: Is it the correct Google Doc ID?
2. **Folder ID**: Is it the correct Drive folder ID?
3. **Permissions**: Can the script access both document and folder?
4. **Placeholders**: Are they exactly `{{PlaceholderName}}` format?
5. **Execution**: Is the script actually running the PDF generation?

### Get Help:
1. Check the execution log for specific error messages
2. Run `testPDFGeneration()` function to isolate the issue
3. Verify your template document has the correct placeholder format
4. Make sure both template and folder are accessible to the script owner

The most common issue is incorrect TEMPLATE_ID or OUTPUT_FOLDER_ID configuration!





