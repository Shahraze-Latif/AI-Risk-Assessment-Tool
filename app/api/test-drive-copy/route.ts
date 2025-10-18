import { NextRequest, NextResponse } from 'next/server';
import { initializeGoogleAPIs } from '@/lib/googleApis';
import { GOOGLE_CONFIG } from '@/lib/config';

export async function GET(request: NextRequest) {
  console.log('🧪 Testing Drive API copy functionality...');
  
  try {
    // Initialize Google APIs
    const { drive } = initializeGoogleAPIs();
    
    // Test 1: List files in the target folder
    console.log('📁 Testing folder access...');
    const folderResponse = await drive.files.list({
      q: `'${GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID}' in parents`,
      fields: 'files(id,name,mimeType)'
    });
    console.log('✅ Folder access successful, files count:', folderResponse.data.files?.length || 0);
    
    // Test 2: Get template document info
    console.log('📄 Testing template document access...');
    const templateResponse = await drive.files.get({
      fileId: GOOGLE_CONFIG.TEMPLATE_DOC_ID,
      fields: 'id,name,mimeType,owners'
    });
    console.log('✅ Template access successful:', templateResponse.data.name);
    
    // Test 3: Try to copy the template
    console.log('📋 Testing template copy...');
    const copyResponse = await drive.files.copy({
      fileId: GOOGLE_CONFIG.TEMPLATE_DOC_ID,
      requestBody: {
        name: `Test_Copy_${new Date().toISOString().split('T')[0]}`,
        parents: [GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID]
      }
    });
    
    const newDocId = copyResponse.data.id;
    console.log('✅ Template copy successful:', newDocId);
    
    if (!newDocId) {
      throw new Error('No document ID returned from copy operation');
    }
    
    // Test 4: Clean up the test file
    console.log('🧹 Cleaning up test file...');
    await drive.files.delete({
      fileId: newDocId as string
    });
    console.log('✅ Test file deleted');
    
    return NextResponse.json({
      success: true,
      message: 'All Drive API tests passed',
      results: {
        folderAccess: {
          filesCount: folderResponse.data.files?.length || 0,
          folderId: GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID
        },
        templateAccess: {
          id: templateResponse.data.id,
          name: templateResponse.data.name,
          mimeType: templateResponse.data.mimeType
        },
        copyTest: {
          success: true,
          newDocId: newDocId,
          cleanedUp: true
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Drive API test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Drive API test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      step: 'drive_api_test'
    }, { status: 500 });
  }
}
