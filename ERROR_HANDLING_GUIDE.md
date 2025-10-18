# 🚨 Comprehensive Error Handling Guide

## Overview

The AI Risk Assessment Tool now includes comprehensive error handling throughout the application to ensure robust operation, better debugging, and improved user experience.

## 🏗️ Error Handling Architecture

### 1. Centralized Error System (`lib/errors.ts`)

#### **Error Classes**
- **`GoogleAPIError`** - Google API specific errors with context
- **`ConfigurationError`** - Missing or invalid configuration
- **`ValidationError`** - Input validation failures
- **`AppError`** - Standardized error format

#### **Error Handlers**
- **`handleGoogleAPIError()`** - Maps Google API errors to specific codes
- **`handleConfigurationError()`** - Configuration validation
- **`handleValidationError()`** - Input validation
- **`logError()`** - Centralized error logging
- **`safeAsync()`** - Safe async operation wrapper

### 2. Google API Client Error Handling (`lib/google/client.ts`)

#### **Service Account Validation**
```typescript
// Validates JSON format
// Checks required fields: type, project_id, private_key, client_email
// Ensures type is "service_account"
// Provides detailed error messages
```

#### **Authentication Error Handling**
- Invalid JWT signature detection
- Missing credentials validation
- Scope permission verification

### 3. Google Utility Functions (`lib/google/utils.ts`)

#### **Input Validation**
- Parameter type checking
- Required field validation
- Null/undefined handling

#### **Operation Error Handling**
- **`copyDocument()`** - Template copying with fallback strategies
- **`replacePlaceholders()`** - Document editing with validation
- **`exportAsPDF()`** - PDF export with error recovery
- **`uploadToDrive()`** - File upload with retry logic
- **`makeFilePublic()`** - Permission setting with warnings
- **`deleteFile()`** - Cleanup with non-critical error handling

### 4. Report Generation API (`app/api/generate-report/route.ts`)

#### **Step-by-Step Error Handling**
Each step of report generation has specific error handling:

1. **Request Validation**
   - JSON parsing errors
   - Required field validation
   - Type checking

2. **Configuration Validation**
   - Missing environment variables
   - Invalid Google configuration
   - Service account validation

3. **Database Operations**
   - Readiness check fetching
   - Update operations
   - Connection errors

4. **Google API Operations**
   - Template copying
   - Placeholder replacement
   - PDF export
   - File upload
   - Permission setting
   - Cleanup operations

## 🔍 Error Codes Reference

### Google API Errors
- **`GOOGLE_API_BAD_REQUEST`** (400) - Invalid request
- **`GOOGLE_API_UNAUTHORIZED`** (401) - Authentication failed
- **`GOOGLE_API_FORBIDDEN`** (403) - Access forbidden
- **`GOOGLE_API_NOT_FOUND`** (404) - Resource not found
- **`GOOGLE_API_RATE_LIMIT`** (429) - Rate limit exceeded
- **`GOOGLE_API_SERVER_ERROR`** (500) - Server error
- **`GOOGLE_API_QUOTA_EXCEEDED`** - Storage quota exceeded
- **`GOOGLE_API_JWT_ERROR`** - Invalid JWT signature

### Configuration Errors
- **`CONFIG_ERROR`** - Missing configuration
- **`VALIDATION_ERROR`** - Input validation failed
- **`DATABASE_ERROR`** - Database operation failed
- **`NOT_FOUND`** - Resource not found

### Report Generation Errors
- **`STEP_1_COPY_FAILED`** - Template copy failed
- **`STEP_2_PREPARE_FAILED`** - Replacement data preparation failed
- **`STEP_3_PLACEHOLDER_FAILED`** - Placeholder replacement failed
- **`STEP_4_EXPORT_FAILED`** - PDF export failed
- **`STEP_5_UPLOAD_FAILED`** - File upload failed
- **`STEP_6_PERMISSIONS_FAILED`** - Permission setting failed
- **`STEP_7_CLEANUP_FAILED`** - Cleanup failed

## 📊 Error Response Format

### Success Response
```json
{
  "success": true,
  "reportUrl": "https://drive.google.com/file/d/...",
  "message": "Report generated successfully",
  "readinessCheckId": "uuid"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": "Technical details",
  "step": "STEP_NAME",
  "context": {
    "operation": "operation_name",
    "additional": "context_data"
  }
}
```

## 🛠️ Error Handling Features

### 1. **Detailed Logging**
- Structured error logging with context
- Operation tracking
- Step-by-step debugging information
- Error categorization

### 2. **Graceful Degradation**
- Non-critical errors don't stop the process
- Fallback strategies for Google API operations
- Partial success handling

### 3. **User-Friendly Messages**
- Clear error descriptions
- Actionable error messages
- Technical details for debugging

### 4. **Error Recovery**
- Retry mechanisms for transient errors
- Alternative strategies for quota issues
- Cleanup operations even on failure

## 🔧 Debugging Guide

### 1. **Check Logs**
Look for structured error logs with:
- Operation context
- Step information
- Error codes
- Technical details

### 2. **Common Issues**

#### **Google API Errors**
```bash
# Check service account key
node scripts/encode-service-account.js

# Test Google API access
node scripts/testGoogle.js
```

#### **Configuration Errors**
- Missing environment variables
- Invalid Google IDs
- Service account permissions

#### **Database Errors**
- Supabase connection issues
- RLS policy problems
- Data validation errors

### 3. **Error Monitoring**
- Monitor console logs for error patterns
- Track error rates by operation
- Identify common failure points

## 🚀 Best Practices

### 1. **Error Prevention**
- Validate inputs early
- Check configuration on startup
- Use type-safe operations

### 2. **Error Handling**
- Always handle errors explicitly
- Provide meaningful error messages
- Log errors with context

### 3. **User Experience**
- Don't expose technical details to users
- Provide actionable error messages
- Implement retry mechanisms where appropriate

## 📝 Error Handling Checklist

- ✅ **Input Validation** - All inputs validated
- ✅ **Configuration Checks** - Environment variables verified
- ✅ **Google API Errors** - Comprehensive error mapping
- ✅ **Database Errors** - Connection and operation handling
- ✅ **Step-by-Step Tracking** - Each operation monitored
- ✅ **Graceful Degradation** - Non-critical errors handled
- ✅ **Detailed Logging** - Structured error information
- ✅ **User-Friendly Messages** - Clear error descriptions
- ✅ **Error Recovery** - Fallback strategies implemented
- ✅ **Cleanup Operations** - Resources cleaned up on failure

## 🎯 Benefits

1. **Better Debugging** - Detailed error information
2. **Improved Reliability** - Graceful error handling
3. **Enhanced User Experience** - Clear error messages
4. **Easier Maintenance** - Structured error logging
5. **Production Ready** - Robust error handling

The error handling system ensures that the application can handle various failure scenarios gracefully while providing detailed information for debugging and monitoring.
