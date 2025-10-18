/**
 * Google API Utility Functions
 * Common operations for Google Docs, Drive, and Sheets
 */

import { getGoogleAPIs } from './client';
import { GOOGLE_CONFIG, PLACEHOLDERS } from './config';
import { 
  GoogleAPIError, 
  handleGoogleAPIError, 
  logError,
  safeAsync,
  ValidationError,
  handleValidationError 
} from '../errors';
import dayjs from 'dayjs';

/**
 * Copy a Google Doc template
 * @param {string} templateId - Template document ID
 * @param {string} newName - Name for the copied document
 * @param {string} folderId - Target folder ID (optional)
 * @returns {Promise<Object>} Copy response
 */
export async function copyDocument(templateId: string, newName: string, folderId: string | null = null) {
  // Input validation
  if (!templateId || typeof templateId !== 'string') {
    throw handleValidationError('templateId', 'Template ID must be a non-empty string');
  }
  
  if (!newName || typeof newName !== 'string') {
    throw handleValidationError('newName', 'Document name must be a non-empty string');
  }
  
  if (folderId && typeof folderId !== 'string') {
    throw handleValidationError('folderId', 'Folder ID must be a string or null');
  }

  const result = await safeAsync(
    async () => {
      const { drive } = getGoogleAPIs();
      
      const requestBody: any = {
        name: newName
      };
      
      if (folderId) {
        requestBody.parents = [folderId];
      }
      
      console.log('📋 Copying document:', { templateId, newName, folderId });
      
      const response = await drive.files.copy({
        fileId: templateId,
        requestBody
      });
      
      console.log('✅ Document copied successfully:', response.data.id);
      return response;
    },
    { operation: 'copyDocument', templateId, newName, folderId }
  );

  if (!result.success) {
    const error = result.error;
    if (error?.details?.code === 404) {
      throw handleGoogleAPIError(
        error.details,
        'copyDocument',
        { templateId, newName, folderId }
      );
    }
    throw error;
  }

  return result.data;
}

/**
 * Replace placeholders in a Google Doc
 * @param {string} documentId - Document ID
 * @param {Object} replacements - Key-value pairs for replacements
 * @returns {Promise<void>}
 */
export async function replacePlaceholders(documentId: string, replacements: Record<string, string>) {
  // Input validation
  if (!documentId || typeof documentId !== 'string') {
    throw handleValidationError('documentId', 'Document ID must be a non-empty string');
  }
  
  if (!replacements || typeof replacements !== 'object') {
    throw handleValidationError('replacements', 'Replacements must be an object');
  }

  const result = await safeAsync(
    async () => {
      const { docs } = getGoogleAPIs();
      
      const requests = [];
      
      for (const [placeholder, value] of Object.entries(replacements)) {
        if (placeholder && value !== undefined) {
          requests.push({
            replaceAllText: {
              containsText: {
                text: placeholder
              },
              replaceText: value
            }
          });
        }
      }
      
      if (requests.length > 0) {
        console.log('✏️ Replacing placeholders:', { documentId, count: requests.length });
        
        await docs.documents.batchUpdate({
          documentId,
          requestBody: {
            requests
          }
        });
        
        console.log('✅ Placeholders replaced successfully');
      } else {
        console.log('⚠️ No valid replacements to process');
      }
    },
    { operation: 'replacePlaceholders', documentId, replacementCount: Object.keys(replacements).length }
  );

  if (!result.success) {
    throw result.error;
  }
}

/**
 * Export document as PDF
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} PDF response
 */
export async function exportAsPDF(documentId: string) {
  // Input validation
  if (!documentId || typeof documentId !== 'string') {
    throw handleValidationError('documentId', 'Document ID must be a non-empty string');
  }

  const result = await safeAsync(
    async () => {
      const { drive } = getGoogleAPIs();
      
      console.log('📄 Exporting document as PDF:', documentId);
      
      const response = await drive.files.export({
        fileId: documentId,
        mimeType: 'application/pdf'
      }, {
        responseType: 'stream'
      });
      
      console.log('✅ PDF export successful');
      return response;
    },
    { operation: 'exportAsPDF', documentId }
  );

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

/**
 * Upload file to Google Drive
 * @param {Object} fileData - File data
 * @param {string} fileName - File name
 * @param {string} mimeType - MIME type
 * @param {string} folderId - Target folder ID (optional)
 * @returns {Promise<Object>} Upload response
 */
export async function uploadToDrive(fileData: any, fileName: string, mimeType: string, folderId: string | null = null) {
  // Input validation
  if (!fileData) {
    throw handleValidationError('fileData', 'File data is required');
  }
  
  if (!fileName || typeof fileName !== 'string') {
    throw handleValidationError('fileName', 'File name must be a non-empty string');
  }
  
  if (!mimeType || typeof mimeType !== 'string') {
    throw handleValidationError('mimeType', 'MIME type must be a non-empty string');
  }
  
  if (folderId && typeof folderId !== 'string') {
    throw handleValidationError('folderId', 'Folder ID must be a string or null');
  }

  const result = await safeAsync(
    async () => {
      const { drive } = getGoogleAPIs();
      
      const requestBody: any = {
        name: fileName
      };
      
      if (folderId) {
        requestBody.parents = [folderId];
      }
      
      console.log('☁️ Uploading file to Drive:', { fileName, mimeType, folderId });
      
      const response = await drive.files.create({
        requestBody,
        media: {
          mimeType,
          body: fileData
        }
      });
      
      console.log('✅ File uploaded successfully:', response.data.id);
      return response;
    },
    { operation: 'uploadToDrive', fileName, mimeType, folderId }
  );

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

/**
 * Set file permissions to public
 * @param {string} fileId - File ID
 * @returns {Promise<void>}
 */
export async function makeFilePublic(fileId: string) {
  const { drive } = getGoogleAPIs();
  
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone'
    }
  });
}

/**
 * Delete a file
 * @param {string} fileId - File ID
 * @returns {Promise<void>}
 */
export async function deleteFile(fileId: string) {
  const { drive } = getGoogleAPIs();
  
  await drive.files.delete({
    fileId
  });
}

/**
 * Get file information
 * @param {string} fileId - File ID
 * @param {string} fields - Fields to retrieve
 * @returns {Promise<Object>} File information
 */
export async function getFileInfo(fileId: string, fields: string = 'id,name,owners,mimeType') {
  const { drive } = getGoogleAPIs();
  
  return await drive.files.get({
    fileId,
    fields
  });
}

/**
 * List files in a folder
 * @param {string} folderId - Folder ID
 * @param {string} fields - Fields to retrieve
 * @returns {Promise<Object>} Files list
 */
export async function listFilesInFolder(folderId: string, fields: string = 'files(id,name,mimeType,createdTime)') {
  const { drive } = getGoogleAPIs();
  
  return await drive.files.list({
    q: `'${folderId}' in parents`,
    fields
  });
}
