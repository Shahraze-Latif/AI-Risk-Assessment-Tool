import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getGoogleAPIs } from '@/lib/google/client';
import { GOOGLE_CONFIG, validateGoogleConfig, PLACEHOLDERS } from '@/lib/google/config';
import { 
  copyDocument, 
  replacePlaceholders, 
  exportAsPDF, 
  uploadToDrive, 
  makeFilePublic, 
  deleteFile 
} from '@/lib/google/utils';
import { 
  GoogleAPIError, 
  ConfigurationError, 
  ValidationError,
  handleGoogleAPIError,
  handleConfigurationError,
  handleValidationError,
  logError,
  safeAsync,
  createError 
} from '@/lib/errors';
import dayjs from 'dayjs';

interface GenerateReportRequest {
  readinessCheckId: string;
}

export async function POST(request: NextRequest) {
  console.log('🚀 Starting report generation...');
  
  try {
    // Parse and validate request body
    let body: GenerateReportRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      logError(parseError as Error, { operation: 'parseRequest' });
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON in request body',
        code: 'INVALID_JSON'
      }, { status: 400 });
    }

    const { readinessCheckId } = body;

    console.log('📋 Readiness Check ID:', readinessCheckId);

    // Validate input
    if (!readinessCheckId || typeof readinessCheckId !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Readiness Check ID is required and must be a string',
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    // Validate Google configuration
    const configValidation = validateGoogleConfig();
    if (!configValidation.isValid) {
      const error = handleConfigurationError(configValidation.missing);
      logError(error, { operation: 'validateConfig' });
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        missing: configValidation.missing 
      }, { status: 500 });
    }

    // Fetch readiness check data
    console.log('📊 Fetching readiness check data...');
    const { data: readinessCheck, error: fetchError } = await supabase
      .from('readiness_checks')
      .select('*')
      .eq('id', readinessCheckId)
      .single();

    if (fetchError) {
      logError(fetchError, { operation: 'fetchReadinessCheck', readinessCheckId });
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch readiness check from database',
        code: 'DATABASE_ERROR',
        details: fetchError.message
      }, { status: 500 });
    }

    if (!readinessCheck) {
      return NextResponse.json({ 
        success: false, 
        error: 'Readiness check not found',
        code: 'NOT_FOUND'
      }, { status: 404 });
    }

    console.log('✅ Readiness check found:', readinessCheck.client_name);

    // Initialize Google APIs
    console.log('🔑 Initializing Google APIs...');
    let docs, drive;
    try {
      const googleAPIs = getGoogleAPIs();
      docs = googleAPIs.docs;
      drive = googleAPIs.drive;
      console.log('✅ Google APIs initialized');
    } catch (apiError) {
      logError(apiError as Error, { operation: 'initializeGoogleAPIs' });
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to initialize Google APIs',
        code: 'GOOGLE_API_INIT_ERROR',
        details: apiError instanceof Error ? apiError.message : 'Unknown error'
      }, { status: 500 });
    }

    // Generate report
    console.log('📄 Generating report...');
    let reportUrl: string;
    try {
      reportUrl = await generateReport(docs, drive, readinessCheck);
      console.log('✅ Report generated successfully:', reportUrl);
    } catch (reportError) {
      logError(reportError as Error, { 
        operation: 'generateReport', 
        readinessCheckId,
        clientName: readinessCheck.client_name 
      });
      
      // Determine error type and response
      if (reportError instanceof GoogleAPIError) {
        return NextResponse.json({ 
          success: false, 
          error: 'Google API error during report generation',
          code: reportError.code,
          details: reportError.message,
          step: reportError.context?.step || 'unknown'
        }, { status: 500 });
      } else if (reportError instanceof ConfigurationError) {
        return NextResponse.json({ 
          success: false, 
          error: 'Configuration error during report generation',
          code: reportError.code,
          details: reportError.message,
          missing: reportError.missing
        }, { status: 500 });
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'Report generation failed',
          code: 'REPORT_GENERATION_ERROR',
          details: reportError instanceof Error ? reportError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Update readiness check with report URL
    console.log('💾 Updating readiness check with report URL...');
    const { error: updateError } = await supabase
      .from('readiness_checks')
      .update({ 
        report_url: reportUrl,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', readinessCheckId);

    if (updateError) {
      logError(updateError, { 
        operation: 'updateReadinessCheck', 
        readinessCheckId,
        reportUrl 
      });
      return NextResponse.json({ 
        success: false, 
        error: 'Report generated but failed to save URL to database',
        code: 'DATABASE_UPDATE_ERROR',
        details: updateError.message,
        reportUrl // Include the URL so it's not lost
      }, { status: 500 });
    }

    console.log('🎉 Report generation completed successfully!');

    return NextResponse.json({
      success: true,
      reportUrl,
      message: 'Report generated successfully',
      readinessCheckId
    });

  } catch (error) {
    logError(error as Error, { operation: 'generateReport' });
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error during report generation',
      code: 'UNEXPECTED_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function generateReport(docs: any, drive: any, readinessCheck: any): Promise<string> {
  const assessmentData = readinessCheck.assessment_data;
  const clientName = readinessCheck.client_name || 'Client';
  const currentDate = dayjs().format('MMMM D, YYYY');

  console.log('📊 Assessment data:', {
    hasAreaScores: !!assessmentData?.area_scores,
    hasWeightedScore: !!assessmentData?.weighted_score,
    hasOverallLabel: !!assessmentData?.overall_label,
    hasPlan: !!assessmentData?.plan
  });

  // Validate assessment data
  if (!assessmentData) {
    throw new ValidationError('Assessment data is missing', 'assessment_data');
  }

  // Step 1: Copy the template document
  console.log('📋 STEP 1: Copying template document...');
  console.log('🔗 Template ID:', GOOGLE_CONFIG.TEMPLATE_DOC_ID);
  console.log('📁 Target folder ID:', GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID);
  
  let copyResponse;
  let newDocId: string;
  
  try {
    // Try copying directly to the service account's folder
    copyResponse = await copyDocument(
      GOOGLE_CONFIG.TEMPLATE_DOC_ID!,
      `Client_ReadinessCheck_${dayjs().format('YYYY-MM-DD')}`,
      GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID!
    );
    console.log('✅ STEP 1 SUCCESS: Template copied to service account folder');
    console.log('📄 New document ID:', copyResponse.data.id);
    
    newDocId = copyResponse.data.id;
    if (!newDocId) {
      throw new Error('No document ID returned from copy operation');
    }

    // Transfer ownership to service account to avoid storage quota issues
    console.log('🔄 Transferring ownership to service account...');
    try {
      const serviceAccountEmail = GOOGLE_CONFIG.SERVICE_ACCOUNT_EMAIL;
      if (serviceAccountEmail) {
        await drive.permissions.create({
          fileId: newDocId,
          requestBody: {
            role: "writer",
            type: "user",
            emailAddress: serviceAccountEmail
          }
        });
        console.log('✅ Ownership transferred to service account:', serviceAccountEmail);
      } else {
        console.warn('⚠️ GOOGLE_SERVICE_ACCOUNT_EMAIL not configured - skipping ownership transfer');
      }
    } catch (ownershipError) {
      console.error('❌ Failed to transfer ownership:', ownershipError);
      // Don't throw here - continue with the process
      console.warn('⚠️ Continuing without ownership transfer - may cause quota issues');
    }
  } catch (copyError) {
    const error = handleGoogleAPIError(
      copyError,
      'copyDocument',
      { 
        step: 'STEP_1_COPY',
        templateId: GOOGLE_CONFIG.TEMPLATE_DOC_ID,
        folderId: GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID,
        clientName 
      }
    );
    logError(error, { operation: 'generateReport', step: 'STEP_1_COPY' });
    throw error;
  }

  // Step 2: Prepare replacement data
  console.log('🔄 STEP 2: Preparing replacement data...');
  let replacements: Record<string, string>;
  
  try {
    replacements = await prepareReplacements(assessmentData, clientName, currentDate);
    console.log('✅ STEP 2 SUCCESS: Replacement data prepared');
    console.log('📊 Replacements count:', Object.keys(replacements).length);
  } catch (replaceError) {
    const error = handleGoogleAPIError(
      replaceError,
      'prepareReplacements',
      { 
        step: 'STEP_2_PREPARE',
        clientName,
        hasAssessmentData: !!assessmentData
      }
    );
    logError(error, { operation: 'generateReport', step: 'STEP_2_PREPARE' });
    throw error;
  }

  // Step 3: Replace placeholders in the document
  console.log('✏️ STEP 3: Replacing placeholders in document...');
  
  try {
    await replacePlaceholders(newDocId, replacements);
    console.log('✅ STEP 3 SUCCESS: Placeholders replaced successfully');
  } catch (placeholderError) {
    const error = handleGoogleAPIError(
      placeholderError,
      'replacePlaceholders',
      { 
        step: 'STEP_3_PLACEHOLDER',
        documentId: newDocId,
        replacementCount: Object.keys(replacements).length
      }
    );
    logError(error, { operation: 'generateReport', step: 'STEP_3_PLACEHOLDER' });
    throw error;
  }

  // Step 4: Export as PDF
  console.log('📄 STEP 4: Exporting document as PDF...');
  let pdfResponse;
  
  try {
    pdfResponse = await exportAsPDF(newDocId);
    console.log('✅ STEP 4 SUCCESS: Document exported as PDF');
    console.log('📊 PDF response type:', typeof pdfResponse.data);
  } catch (exportError) {
    const error = handleGoogleAPIError(
      exportError,
      'exportAsPDF',
      { 
        step: 'STEP_4_EXPORT',
        documentId: newDocId
      }
    );
    logError(error, { operation: 'generateReport', step: 'STEP_4_EXPORT' });
    throw error;
  }

  // Step 5: Upload PDF to Drive
  console.log('☁️ STEP 5: Uploading PDF to Google Drive...');
  console.log('📁 Target folder ID:', GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID);
  
  let uploadResponse;
  let uploadedFileId: string;
  
  try {
    const pdfFileName = `Client_ReadinessCheck_${clientName}_${dayjs().format('YYYY-MM-DD')}.pdf`;
    uploadResponse = await uploadToDrive(
      pdfResponse.data,
      pdfFileName,
      'application/pdf',
      GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID!
    );
    console.log('✅ STEP 5 SUCCESS: PDF uploaded to Drive');
    console.log('📄 Uploaded file ID:', uploadResponse.data.id);
    
    uploadedFileId = uploadResponse.data.id;
    if (!uploadedFileId) {
      throw new Error('No file ID returned from upload operation');
    }
  } catch (uploadError) {
    const error = handleGoogleAPIError(
      uploadError,
      'uploadToDrive',
      { 
        step: 'STEP_5_UPLOAD',
        fileName: `Client_ReadinessCheck_${clientName}_${dayjs().format('YYYY-MM-DD')}.pdf`,
        folderId: GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID
      }
    );
    logError(error, { operation: 'generateReport', step: 'STEP_5_UPLOAD' });
    throw error;
  }

  // Step 6: Set permissions to make PDF publicly accessible
  console.log('🔓 STEP 6: Setting file permissions...');
  
  try {
    await makeFilePublic(uploadedFileId);
    console.log('✅ STEP 6 SUCCESS: File permissions set');
  } catch (permissionError) {
    // Don't throw here - the file is uploaded, just not publicly accessible
    const error = handleGoogleAPIError(
      permissionError,
      'makeFilePublic',
      { 
        step: 'STEP_6_PERMISSIONS',
        fileId: uploadedFileId
      }
    );
    logError(error, { operation: 'generateReport', step: 'STEP_6_PERMISSIONS' });
    console.warn('⚠️ File uploaded but permissions failed - file may not be publicly accessible');
  }

  // Step 7: Clean up the temporary document
  console.log('🧹 STEP 7: Cleaning up temporary document...');
  
  try {
    await deleteFile(newDocId);
    console.log('✅ STEP 7 SUCCESS: Temporary document deleted');
  } catch (cleanupError) {
    // Don't throw here - the main process succeeded
    const error = handleGoogleAPIError(
      cleanupError,
      'deleteFile',
      { 
        step: 'STEP_7_CLEANUP',
        documentId: newDocId
      }
    );
    logError(error, { operation: 'generateReport', step: 'STEP_7_CLEANUP' });
    console.warn('⚠️ Report generated but cleanup failed');
  }

  const reportUrl = `https://drive.google.com/file/d/${uploadedFileId}/view`;
  console.log('🎉 ALL STEPS COMPLETED: Report generation successful');
  console.log('🔗 Report URL:', reportUrl);
  
  return reportUrl;
}

async function prepareReplacements(assessmentData: any, clientName: string, currentDate: string): Promise<Record<string, string>> {
  try {
    // Validate inputs
    if (!clientName || typeof clientName !== 'string') {
      throw handleValidationError('clientName', 'Client name must be a non-empty string');
    }
    
    if (!currentDate || typeof currentDate !== 'string') {
      throw handleValidationError('currentDate', 'Current date must be a non-empty string');
    }
    
    if (!assessmentData || typeof assessmentData !== 'object') {
      throw handleValidationError('assessmentData', 'Assessment data must be an object');
    }

    console.log('🔄 Preparing replacements for:', { clientName, currentDate });

    const replacements: Record<string, string> = {
      [PLACEHOLDERS.CLIENT_NAME]: clientName,
      [PLACEHOLDERS.DATE]: currentDate,
      [PLACEHOLDERS.OVERALL_SCORE]: assessmentData.weighted_score?.toString() || 'N/A',
      [PLACEHOLDERS.HEATMAP_TABLE]: generateHeatmapTable(assessmentData.heatmap || {}),
      [PLACEHOLDERS.AREA_SCORES]: generateAreaScores(assessmentData.area_scores || {}),
      [PLACEHOLDERS.FINDINGS_BY_AREA]: generateFindingsByArea(assessmentData.area_scores || {}),
      [PLACEHOLDERS.THIRTY_DAY_PLAN]: generateThirtyDayPlan(assessmentData.plan || []),
      [PLACEHOLDERS.APPENDIX]: generateAppendix(assessmentData)
    };

    console.log('✅ Replacements prepared:', Object.keys(replacements).length, 'placeholders');
    return replacements;

  } catch (error) {
    logError(error as Error, { 
      operation: 'prepareReplacements', 
      clientName, 
      currentDate,
      hasAssessmentData: !!assessmentData 
    });
    throw error;
  }
}

function generateHeatmapTable(heatmap: any): string {
  // Implementation for heatmap table generation
  return 'Heatmap table content';
}

function generateAreaScores(areaScores: any): string {
  // Implementation for area scores generation
  return 'Area scores content';
}

function generateFindingsByArea(areaScores: any): string {
  // Implementation for findings by area generation
  return 'Findings by area content';
}

function generateThirtyDayPlan(plan: any[]): string {
  // Implementation for 30-day plan generation
  return '30-day plan content';
}

function generateAppendix(assessmentData: any): string {
  // Implementation for appendix generation
  return 'Appendix content';
}