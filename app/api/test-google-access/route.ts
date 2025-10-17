import { NextRequest, NextResponse } from 'next/server';
import { initializeGoogleAPIs } from '@/lib/googleApis';
import { GOOGLE_CONFIG } from '@/lib/config';

export async function GET(request: NextRequest) {
  console.log('🧪 Testing Google API access...');
  
  try {
    // Test 1: Initialize Google APIs
    console.log('🔌 Initializing Google APIs...');
    const { docs, drive } = initializeGoogleAPIs();
    console.log('✅ Google APIs initialized');

    // Test 2: Validate environment variables
    console.log('🔧 Environment variables:');
    console.log('- GOOGLE_TEMPLATE_DOC_ID:', GOOGLE_CONFIG.TEMPLATE_DOC_ID);
    console.log('- GOOGLE_DRIVE_FOLDER_ID:', GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID);
    console.log('- GOOGLE_SERVICE_ACCOUNT_KEY:', process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? 'Set' : 'Missing');

    // Test 3: Test Drive folder access
    console.log('📁 Testing Drive folder access...');
    let folderInfo;
    try {
      const folderResponse = await drive.files.get({
        fileId: GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID,
        fields: 'id,name,mimeType,permissions'
      });
      folderInfo = folderResponse.data;
      console.log('✅ Drive folder accessible:', folderInfo.name);
    } catch (folderError) {
      console.error('❌ Drive folder access failed:', folderError);
      return NextResponse.json({
        success: false,
        error: 'Drive folder access failed',
        details: folderError instanceof Error ? folderError.message : 'Unknown error',
        folderId: GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID
      }, { status: 500 });
    }

    // Test 4: Test template document access
    console.log('📄 Testing template document access...');
    let docInfo;
    try {
      const docResponse = await drive.files.get({
        fileId: GOOGLE_CONFIG.TEMPLATE_DOC_ID,
        fields: 'id,name,mimeType,permissions'
      });
      docInfo = docResponse.data;
      console.log('✅ Template document accessible:', docInfo.name);
    } catch (docError) {
      console.error('❌ Template document access failed:', docError);
      return NextResponse.json({
        success: false,
        error: 'Template document access failed',
        details: docError instanceof Error ? docError.message : 'Unknown error',
        documentId: GOOGLE_CONFIG.TEMPLATE_DOC_ID
      }, { status: 500 });
    }

    // Test 5: Test document content access
    console.log('📖 Testing document content access...');
    try {
      const contentResponse = await docs.documents.get({
        documentId: GOOGLE_CONFIG.TEMPLATE_DOC_ID
      });
      console.log('✅ Document content accessible, title:', contentResponse.data.title);
    } catch (contentError) {
      console.error('❌ Document content access failed:', contentError);
      return NextResponse.json({
        success: false,
        error: 'Document content access failed',
        details: contentError instanceof Error ? contentError.message : 'Unknown error'
      }, { status: 500 });
    }

    // Test 6: Test folder listing
    console.log('📋 Testing folder listing...');
    try {
      const listResponse = await drive.files.list({
        q: `'${GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID}' in parents`,
        fields: 'files(id,name,mimeType)'
      });
      console.log('✅ Folder listing successful, files count:', listResponse.data.files?.length || 0);
    } catch (listError) {
      console.error('❌ Folder listing failed:', listError);
      return NextResponse.json({
        success: false,
        error: 'Folder listing failed',
        details: listError instanceof Error ? listError.message : 'Unknown error'
      }, { status: 500 });
    }

    // All tests passed
    console.log('🎉 All Google API tests passed!');
    return NextResponse.json({
      success: true,
      message: 'All Google API tests passed',
      results: {
        folderAccess: {
          id: folderInfo.id,
          name: folderInfo.name,
          mimeType: folderInfo.mimeType
        },
        documentAccess: {
          id: docInfo.id,
          name: docInfo.name,
          mimeType: docInfo.mimeType
        },
        environmentVariables: {
          templateDocId: GOOGLE_CONFIG.TEMPLATE_DOC_ID,
          driveFolderId: GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID,
          serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? 'Set' : 'Missing'
        }
      }
    });

  } catch (error) {
    console.error('❌ Google API test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Google API test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
