import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { initializeGoogleAPIs } from '@/lib/googleApis';
import { GOOGLE_CONFIG } from '@/lib/config';
import dayjs from 'dayjs';

interface GenerateReportRequest {
  readinessCheckId: string;
}

export async function POST(request: NextRequest) {
  console.log('🚀 Starting report generation...');
  
  try {
    const body: GenerateReportRequest = await request.json();
    const { readinessCheckId } = body;

    console.log('📋 Readiness Check ID:', readinessCheckId);

    if (!readinessCheckId) {
      console.error('❌ No readiness check ID provided');
      return NextResponse.json({ 
        error: 'Readiness check ID is required',
        details: 'No readinessCheckId provided in request body'
      }, { status: 400 });
    }

    // Validate environment variables
    console.log('🔧 Validating environment variables...');
    const envValidation = validateEnvironmentVariables();
    if (!envValidation.valid) {
      console.error('❌ Environment validation failed:', envValidation.errors);
      return NextResponse.json({ 
        error: 'Configuration error',
        details: envValidation.errors
      }, { status: 500 });
    }
    console.log('✅ Environment variables validated');

    // Fetch the readiness check record from Supabase
    console.log('📊 Fetching readiness check from Supabase...');
    const { data: readinessCheck, error: fetchError } = await supabase
      .from('readiness_checks')
      .select('*')
      .eq('id', readinessCheckId)
      .single();

    if (fetchError) {
      console.error('❌ Supabase fetch error:', fetchError);
      return NextResponse.json({ 
        error: 'Database error',
        details: `Failed to fetch readiness check: ${fetchError.message}`
      }, { status: 500 });
    }

    if (!readinessCheck) {
      console.error('❌ Readiness check not found');
      return NextResponse.json({ 
        error: 'Readiness check not found',
        details: `No record found with ID: ${readinessCheckId}`
      }, { status: 404 });
    }

    console.log('✅ Readiness check found:', {
      id: readinessCheck.id,
      status: readinessCheck.status,
      hasAssessmentData: !!readinessCheck.assessment_data
    });

    if (!readinessCheck.assessment_data) {
      console.error('❌ No assessment data found');
      return NextResponse.json({ 
        error: 'Assessment data not found',
        details: 'The readiness check record exists but contains no assessment data'
      }, { status: 400 });
    }

    // Initialize Google APIs
    console.log('🔌 Initializing Google APIs...');
    let docs, drive;
    try {
      const googleAPIs = initializeGoogleAPIs();
      docs = googleAPIs.docs;
      drive = googleAPIs.drive;
      console.log('✅ Google APIs initialized successfully');
    } catch (googleError) {
      console.error('❌ Google APIs initialization failed:', googleError);
      return NextResponse.json({ 
        error: 'Google APIs initialization failed',
        details: googleError instanceof Error ? googleError.message : 'Unknown Google API error'
      }, { status: 500 });
    }

    // Generate the report
    console.log('📄 Starting report generation...');
    let reportUrl;
    try {
      reportUrl = await generateReport(docs, drive, readinessCheck);
      console.log('✅ Report generated successfully:', reportUrl);
    } catch (reportError) {
      console.error('❌ Report generation failed:', reportError);
      return NextResponse.json({ 
        error: 'Report generation failed',
        details: reportError instanceof Error ? reportError.message : 'Unknown report generation error'
      }, { status: 500 });
    }

    // Update the readiness check record with report URL
    console.log('💾 Updating Supabase with report URL...');
    const { error: updateError } = await supabase
      .from('readiness_checks')
      .update({
        status: 'completed',
        report_url: reportUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', readinessCheckId);

    if (updateError) {
      console.error('❌ Supabase update error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update record with report URL',
        details: `Report generated but failed to save URL: ${updateError.message}`
      }, { status: 500 });
    }

    console.log('✅ Report generation completed successfully');
    return NextResponse.json({
      success: true,
      report_url: reportUrl,
      message: 'Report generated and saved successfully'
    });

  } catch (error) {
    console.error('❌ Unexpected error in report generation:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

function validateEnvironmentVariables() {
  const errors: string[] = [];
  
  // Check required environment variables
  const requiredVars = [
    'GOOGLE_SERVICE_ACCOUNT_KEY',
    'GOOGLE_TEMPLATE_DOC_ID',
    'GOOGLE_DRIVE_FOLDER_ID'
  ];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing environment variable: ${varName}`);
    }
  }
  
  // Validate Google Service Account Key format
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      if (!key.type || !key.project_id || !key.private_key) {
        errors.push('GOOGLE_SERVICE_ACCOUNT_KEY is not a valid service account JSON');
      }
    } catch (e) {
      errors.push('GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

async function generateReport(docs: any, drive: any, readinessCheck: any): Promise<string> {
  console.log('📄 Starting report generation process...');
  
  try {
    const assessmentData = readinessCheck.assessment_data;
    const clientName = readinessCheck.client_name || 'Client';
    const currentDate = dayjs().format('MMMM D, YYYY');

    console.log('📊 Assessment data:', {
      hasAreaScores: !!assessmentData.area_scores,
      hasWeightedScore: !!assessmentData.weighted_score,
      hasOverallLabel: !!assessmentData.overall_label,
      hasPlan: !!assessmentData.plan
    });

    // Step 1: Copy the template document
    console.log('📋 Copying template document...');
    console.log('🔗 Template ID:', GOOGLE_CONFIG.TEMPLATE_DOC_ID);
    
    let copyResponse;
    try {
      copyResponse = await drive.files.copy({
        fileId: GOOGLE_CONFIG.TEMPLATE_DOC_ID,
        requestBody: {
          name: `Client_ReadinessCheck_${dayjs().format('YYYY-MM-DD')}`
        }
      });
    } catch (copyError) {
      console.error('❌ Failed to copy template:', copyError);
      throw new Error(`Failed to copy template document: ${copyError instanceof Error ? copyError.message : 'Unknown error'}`);
    }

    const newDocId = copyResponse.data.id;
    if (!newDocId) {
      throw new Error('Template copy failed - no document ID returned');
    }
    console.log('✅ Template copied successfully:', newDocId);

    // Step 2: Prepare replacement data
    console.log('🔄 Preparing replacement data...');
    let replacements;
    try {
      replacements = await prepareReplacements(assessmentData, clientName, currentDate);
      console.log('✅ Replacement data prepared:', Object.keys(replacements));
    } catch (replaceError) {
      console.error('❌ Failed to prepare replacements:', replaceError);
      throw new Error(`Failed to prepare replacement data: ${replaceError instanceof Error ? replaceError.message : 'Unknown error'}`);
    }

    // Step 3: Replace placeholders in the document
    console.log('✏️ Replacing placeholders in document...');
    try {
      await replacePlaceholders(docs, newDocId, replacements);
      console.log('✅ Placeholders replaced successfully');
    } catch (placeholderError) {
      console.error('❌ Failed to replace placeholders:', placeholderError);
      throw new Error(`Failed to replace placeholders: ${placeholderError instanceof Error ? placeholderError.message : 'Unknown error'}`);
    }

    // Step 4: Export as PDF
    console.log('📄 Exporting document as PDF...');
    let pdfResponse;
    try {
      pdfResponse = await drive.files.export({
        fileId: newDocId,
        mimeType: 'application/pdf'
      }, {
        responseType: 'stream'
      });
      console.log('✅ Document exported as PDF');
    } catch (exportError) {
      console.error('❌ Failed to export PDF:', exportError);
      throw new Error(`Failed to export PDF: ${exportError instanceof Error ? exportError.message : 'Unknown error'}`);
    }

    // Step 5: Upload PDF to Drive
    console.log('☁️ Uploading PDF to Google Drive...');
    console.log('📁 Target folder ID:', GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID);
    
    const pdfFileName = `Client_ReadinessCheck_${dayjs().format('YYYY-MM-DD')}.pdf`;
    let uploadResponse;
    try {
      uploadResponse = await drive.files.create({
        requestBody: {
          name: pdfFileName,
          parents: [GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID]
        },
        media: {
          mimeType: 'application/pdf',
          body: pdfResponse.data
        }
      });
      console.log('✅ PDF uploaded successfully:', uploadResponse.data.id);
    } catch (uploadError) {
      console.error('❌ Failed to upload PDF:', uploadError);
      throw new Error(`Failed to upload PDF to Drive: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
    }

    const uploadedFileId = uploadResponse.data.id;
    if (!uploadedFileId) {
      throw new Error('PDF upload failed - no file ID returned');
    }

    // Step 6: Make the file publicly accessible
    console.log('🔓 Setting file permissions...');
    try {
      await drive.permissions.create({
        fileId: uploadedFileId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
      console.log('✅ File permissions set successfully');
    } catch (permissionError) {
      console.error('❌ Failed to set permissions:', permissionError);
      // Don't throw here - the file is uploaded, just not publicly accessible
      console.warn('⚠️ File uploaded but permissions failed - file may not be publicly accessible');
    }

    // Step 7: Clean up the temporary document
    console.log('🧹 Cleaning up temporary document...');
    try {
      await drive.files.delete({
        fileId: newDocId
      });
      console.log('✅ Temporary document deleted');
    } catch (cleanupError) {
      console.error('❌ Failed to delete temporary document:', cleanupError);
      // Don't throw here - the main process succeeded
      console.warn('⚠️ Report generated but cleanup failed');
    }

    const reportUrl = `https://drive.google.com/file/d/${uploadedFileId}/view`;
    console.log('🎉 Report generation completed successfully:', reportUrl);
    
    return reportUrl;

  } catch (error) {
    console.error('❌ Error in generateReport:', error);
    throw error;
  }
}

async function prepareReplacements(assessmentData: any, clientName: string, currentDate: string) {
  // Build heatmap table
  const heatmapTable = buildHeatmapTable(assessmentData.area_scores);
  
  // Build area scores section
  const areaScores = buildAreaScores(assessmentData.area_scores);
  
  // Build findings by area
  const findingsByArea = buildFindingsByArea(assessmentData.area_scores);
  
  // Build 30-day plan
  const thirtyDayPlan = buildThirtyDayPlan(assessmentData.plan);
  
  // Build appendix
  const appendix = buildAppendix();

  return {
    '{{CLIENT_NAME}}': clientName,
    '{{DATE}}': currentDate,
    '{{OVERALL_SCORE}}': `${assessmentData.weighted_score} (${assessmentData.overall_label})`,
    '{{HEATMAP_TABLE}}': heatmapTable,
    '{{AREA_SCORES}}': areaScores,
    '{{FINDINGS_BY_AREA}}': findingsByArea,
    '{{30_DAY_PLAN}}': thirtyDayPlan,
    '{{APPENDIX}}': appendix
  };
}

function buildHeatmapTable(areaScores: Record<string, { score: number; label: string }>): string {
  const categories = [
    { name: 'Governance', weight: '25%' },
    { name: 'Data', weight: '20%' },
    { name: 'Security', weight: '20%' },
    { name: 'Vendors', weight: '15%' },
    { name: 'Human Oversight', weight: '10%' },
    { name: 'Transparency', weight: '10%' }
  ];

  let table = '| Category | Weight | Score | Risk Level |\n|----------|--------|-------|------------|\n';
  
  categories.forEach(category => {
    const scoreData = areaScores[category.name.toLowerCase().replace(' ', '_')];
    if (scoreData) {
      table += `| ${category.name} | ${category.weight} | ${scoreData.score} | ${scoreData.label} |\n`;
    }
  });

  return table;
}

function buildAreaScores(areaScores: Record<string, { score: number; label: string }>): string {
  let content = '';
  
  Object.entries(areaScores).forEach(([category, data]) => {
    const categoryName = category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    content += `**${categoryName}**: ${data.score}/3 (${data.label})\n\n`;
  });

  return content;
}

function buildFindingsByArea(areaScores: Record<string, { score: number; label: string }>): string {
  let findings = '';
  
  Object.entries(areaScores).forEach(([category, data]) => {
    const categoryName = category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (data.score >= 2) {
      findings += `**${categoryName}** - High Risk (${data.score}/3)\n`;
      findings += `- Requires immediate attention\n`;
      findings += `- Consider implementing best practices\n\n`;
    } else if (data.score >= 1) {
      findings += `**${categoryName}** - Medium Risk (${data.score}/3)\n`;
      findings += `- Monitor and improve gradually\n`;
      findings += `- Good foundation, needs enhancement\n\n`;
    } else {
      findings += `**${categoryName}** - Low Risk (${data.score}/3)\n`;
      findings += `- Well implemented\n`;
      findings += `- Continue current practices\n\n`;
    }
  });

  return findings;
}

function buildThirtyDayPlan(plan: string[]): string {
  if (plan.length === 0) {
    return 'No specific action items identified based on current assessment.';
  }

  let content = '**30-Day Action Plan:**\n\n';
  plan.forEach((item, index) => {
    content += `${index + 1}. ${item}\n`;
  });

  return content;
}

function buildAppendix(): string {
  return `**Appendix A: Assessment Methodology**

This assessment evaluates AI compliance readiness across six key areas:

1. **Governance** (25% weight) - Policies, roles, and oversight structures
2. **Data** (20% weight) - Data handling, privacy, and geography
3. **Security** (20% weight) - Access controls and protection measures
4. **Vendors** (15% weight) - Third-party AI provider management
5. **Human Oversight** (10% weight) - Human-in-the-loop processes
6. **Transparency** (10% weight) - Disclosure and record-keeping

**Scoring Scale:**
- 0-1: Low Risk (Well implemented)
- 2: Medium Risk (Needs improvement)
- 3: High Risk (Requires immediate attention)

**Next Steps:**
1. Review findings with your team
2. Prioritize high-risk areas
3. Implement 30-day action plan
4. Schedule follow-up assessment in 90 days`;
}

async function replacePlaceholders(docs: any, docId: string, replacements: Record<string, string>) {
  try {
    const requests = [];

    // Replace each placeholder
    for (const [placeholder, replacement] of Object.entries(replacements)) {
      requests.push({
        replaceAllText: {
          containsText: {
            text: placeholder,
            matchCase: false
          },
          replaceText: replacement
        }
      });
    }

    // Execute all replacements
    if (requests.length > 0) {
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests
        }
      });
    }

  } catch (error) {
    console.error('Error replacing placeholders:', error);
    throw error;
  }
}
