# Quick Guide: Updating Google IDs

## 🎯 **Current Setup**

Your system is now configured with these Google IDs:

- **Template Document**: `1oG64k9qBy8r8lLJkMS5HF4yxwfXCXYPWxtag9Ubj3XQ`
- **Google Sheet**: `1tBb8JeP-x8u2zidMMUetLmpofHczGknkOSlhrpv5_B0`
- **Drive Folder**: `1Qgg1pgcgS20dLBcDqfJm6YJReGzX1Lyh`

## 🔄 **When You Get Provider Access**

Simply update the environment variables:

### **In Vercel Dashboard:**
1. Go to **Settings** → **Environment Variables**
2. Update these variables:
   - `GOOGLE_TEMPLATE_DOC_ID` → Provider's template document ID
   - `GOOGLE_SHEET_ID` → Provider's Google Sheet ID
   - `GOOGLE_DRIVE_FOLDER_ID` → Provider's Drive folder ID
3. Redeploy the application

### **In Local Development:**
1. Update `.env.local` file:
   ```bash
   GOOGLE_TEMPLATE_DOC_ID=PROVIDER_TEMPLATE_DOC_ID
   GOOGLE_SHEET_ID=PROVIDER_GOOGLE_SHEET_ID
   GOOGLE_DRIVE_FOLDER_ID=PROVIDER_DRIVE_FOLDER_ID
   ```
2. Restart your development server

## ✅ **What's Ready Now**

1. **System is configured** with your current IDs
2. **Easy to update** when provider access is available
3. **All functionality** will work with new IDs
4. **No code changes** needed beyond ID updates

## 🧪 **Testing with Current IDs**

You can test the system now with your current IDs:

1. **Set up Google Cloud project** with service account
2. **Share your documents** with the service account
3. **Test report generation** to verify everything works
4. **Update IDs later** when provider access is available

## 📋 **Next Steps**

1. **Deploy current system** with your IDs
2. **Test the complete flow** (payment → questionnaire → report)
3. **Get provider access** to their documents
4. **Update IDs** in `lib/config.ts`
5. **Redeploy** with new IDs

The system is ready to work with both your current IDs and the provider's IDs when available!
