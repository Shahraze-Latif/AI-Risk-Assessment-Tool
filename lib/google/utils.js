/**
 * Google API Utility Functions
 * Common operations for Google Docs, Drive, and Sheets
 */

import { getGoogleAPIs } from './client.js';
import { GOOGLE_CONFIG, PLACEHOLDERS } from './config.js';
import dayjs from 'dayjs';

/**
 * Copy a Google Doc template
 * @param {string} templateId - Template document ID
 * @param {string} newName - Name for the copied document
 * @param {string} folderId - Target folder ID (optional)
 * @returns {Promise<Object>} Copy response
 */
export async function copyDocument(templateId, newName, folderId = null) {
  const { drive } = getGoogleAPIs();
  
  const requestBody = {
    name: newName
  };
  
  if (folderId) {
    requestBody.parents = [folderId];
  }
  
  return await drive.files.copy({
    fileId: templateId,
    requestBody
  });
}

/**
 * Replace placeholders in a Google Doc
 * @param {string} documentId - Document ID
 * @param {Object} replacements - Key-value pairs for replacements
 * @returns {Promise<void>}
 */
export async function replacePlaceholders(documentId, replacements) {
  const { docs } = getGoogleAPIs();
  
  const requests = [];
  
  for (const [placeholder, value] of Object.entries(replacements)) {
    requests.push({
      replaceAllText: {
        containsText: {
          text: placeholder
        },
        replaceText: value
      }
    });
  }
  
  if (requests.length > 0) {
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests
      }
    });
  }
}

/**
 * Export document as PDF
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} PDF response
 */
export async function exportAsPDF(documentId) {
  const { drive } = getGoogleAPIs();
  
  return await drive.files.export({
    fileId: documentId,
    mimeType: 'application/pdf'
  }, {
    responseType: 'stream'
  });
}

/**
 * Upload file to Google Drive
 * @param {Object} fileData - File data
 * @param {string} fileName - File name
 * @param {string} mimeType - MIME type
 * @param {string} folderId - Target folder ID (optional)
 * @returns {Promise<Object>} Upload response
 */
export async function uploadToDrive(fileData, fileName, mimeType, folderId = null) {
  const { drive } = getGoogleAPIs();
  
  const requestBody = {
    name: fileName
  };
  
  if (folderId) {
    requestBody.parents = [folderId];
  }
  
  return await drive.files.create({
    requestBody,
    media: {
      mimeType,
      body: fileData
    }
  });
}

/**
 * Set file permissions to public
 * @param {string} fileId - File ID
 * @returns {Promise<void>}
 */
export async function makeFilePublic(fileId) {
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
export async function deleteFile(fileId) {
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
export async function getFileInfo(fileId, fields = 'id,name,owners,mimeType') {
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
export async function listFilesInFolder(folderId, fields = 'files(id,name,mimeType,createdTime)') {
  const { drive } = getGoogleAPIs();
  
  return await drive.files.list({
    q: `'${folderId}' in parents`,
    fields
  });
}
