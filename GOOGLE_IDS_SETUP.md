# Google IDs Setup Guide

This guide explains how to update the Google Document, Sheet, and Drive folder IDs when you get access from the provider.

## 🔧 **Current Configuration**

The system is currently configured with these IDs:

### **Google Document (Template)**
- **Current ID**: `1oG64k9qBy8r8lLJkMS5HF4yxwfXCXYPWxtag9Ubj3XQ`
- **URL**: https://docs.google.com/document/d/1oG64k9qBy8r8lLJkMS5HF4yxwfXCXYPWxtag9Ubj3XQ/edit
- **Purpose**: Master template for report generation

### **Google Sheet (Data Integration)**
- **Current ID**: `1tBb8JeP-x8u2zidMMUetLmpofHczGknkOSlhrpv5_B0`
- **URL**: https://docs.google.com/spreadsheets/d/1tBb8JeP-x8u2zidMMUetLmpofHczGknkOSlhrpv5_B0/edit
- **Purpose**: Data integration and client tracking

### **Google Drive Folder (Report Storage)**
- **Current ID**: `1Qgg1pgcgS20dLBcDqfJm6YJReGzX1Lyh`
- **URL**: https://drive.google.com/drive/folders/1Qgg1pgcgS20dLBcDqfJm6YJReGzX1Lyh
- **Purpose**: Store generated PDF reports

## 🔄 **How to Update IDs**

When you get access from the provider, simply update the IDs in the configuration file:

### **Step 1: Update Configuration File**

Edit `lib/config.ts` and update these values:

```typescript
export const GOOGLE_CONFIG = {
  // Update with new template document ID
  TEMPLATE_DOC_ID: 'NEW_TEMPLATE_DOC_ID_HERE',
  
  // Update with new Google Sheet ID
  GOOGLE_SHEET_ID: 'NEW_GOOGLE_SHEET_ID_HERE',
  
  // Update with new Drive folder ID
  GOOGLE_DRIVE_FOLDER_ID: 'NEW_DRIVE_FOLDER_ID_HERE'
} as const;
```

### **Step 2: Verify Access**

1. **Template Document**: Ensure the service account has "Editor" access
2. **Google Sheet**: Ensure the service account has "Editor" access
3. **Drive Folder**: Ensure the service account has "Editor" access

### **Step 3: Test the System**

1. Deploy the updated configuration
2. Test report generation
3. Verify PDF creation and storage
4. Check template placeholder replacement

## 📋 **Required Permissions**

### **Service Account Access**

The service account needs access to:

1. **Template Document**
   - Permission: Editor
   - Purpose: Copy and modify template for reports

2. **Google Sheet**
   - Permission: Editor
   - Purpose: Data integration and client tracking

3. **Drive Folder**
   - Permission: Editor
   - Purpose: Store generated PDF reports

### **API Permissions**

Ensure these APIs are enabled in Google Cloud Console:

- Google Docs API
- Google Drive API
- Google Sheets API (for future data integration)

## 🧪 **Testing Checklist**

After updating the IDs:

- [ ] Template document is accessible
- [ ] Google Sheet is accessible
- [ ] Drive folder is accessible
- [ ] Service account has proper permissions
- [ ] Report generation works
- [ ] PDF export functions
- [ ] File storage works
- [ ] Placeholder replacement works

## 🔧 **Environment Variables**

Make sure these environment variables are set:

```bash
# Google Service Account Key (JSON format)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Optional: Override Drive folder ID via environment variable
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

## 🚨 **Common Issues**

### **Access Denied Errors**
- Check service account permissions
- Verify document/folder sharing
- Ensure APIs are enabled

### **Template Not Found**
- Verify document ID is correct
- Check document exists and is accessible
- Confirm service account has access

### **Drive Upload Fails**
- Check Drive folder permissions
- Verify folder ID is correct
- Ensure sufficient storage quota

## 📞 **Support**

If you encounter issues:

1. Check Google Cloud Console for API quotas
2. Verify service account permissions
3. Test with a simple document first
4. Review error logs for specific issues

---

**Last Updated**: January 2025  
**Status**: Ready for ID updates when provider access is available
