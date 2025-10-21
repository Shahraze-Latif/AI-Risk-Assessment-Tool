# Google Sheets Integration Setup

This guide explains how to set up Google Sheets integration for the AI Risk Assessment Tool.

## 📋 **Step 1: Create Google Sheet**

1. **Create a new Google Sheet** with the following tabs:
   - `Intake` (for form submissions)
   - `Scores` (for risk scores)
   - `Plan` (for action plans)

2. **Set up Intake tab headers** (Row 1):
   ```
   Company | Industry | UseCases | DataCategories | PHI | EUUsers | Vendors | ModelType | 
   Controls_MFA | Controls_RBAC | Controls_Encryption | Controls_Logging | 
   OversightLevel | Links | ClientName | ClientEmail | SubmissionDate
   ```

3. **Set up Scores tab headers** (Row 1):
   ```
   Company | ClientName | Date | Governance_Score_0to3 | Data_Score_0to3 | Security_Score_0to3 | 
   Vendors_Score_0to3 | HumanOversight_Score_0to3 | Transparency_Score_0to3
   ```
   
   **Note**: The script looks for columns containing both the area name and "Score_0to3"

## 🔧 **Step 2: Deploy Google Apps Script**

1. **Open Google Apps Script** (script.google.com)
2. **Create a new project**
3. **Copy the code** from `google-apps-script/Code.gs`
4. **Replace `YOUR_SHEET_ID_HERE`** with your actual Google Sheet ID
5. **Deploy as Web App**:
   - Click "Deploy" → "New deployment"
   - Type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
6. **Copy the Web App URL**

## 🔗 **Step 3: Update Next.js Code**

1. **Replace the placeholder URL** in `app/questionnaire/readiness/page.tsx`:
   ```typescript
   const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
   ```
   Replace `YOUR_GOOGLE_APPS_SCRIPT_URL` with your actual Web App URL.

## ✅ **Step 4: Test Integration**

1. **Complete a test assessment**
2. **Check the Intake tab** - should see a new row with form data
3. **Verify all fields** are populated correctly

## 🚨 **Troubleshooting**

- **CORS errors**: Make sure you're using `mode: 'no-cors'`
- **Sheet not found**: Verify the sheet ID and tab names
- **Permission errors**: Ensure the script has access to the sheet
- **Data not appearing**: Check the browser console for errors

## 📊 **Expected Data Flow**

```
User completes questionnaire → Assessment processed → Data sent to Google Sheets → 
Intake tab updated with form data
```

## 🔄 **Next Steps**

After Step 1 is working:
- Step 2: Add scores to Scores tab
- Step 3: Add auto-generated plan to Plan tab
