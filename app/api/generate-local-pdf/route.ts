import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { formatReportData, generateLocalPDF, ReportData } from '@/lib/pdfGenerator';
import { logError } from '@/lib/errors';

interface GenerateLocalPDFRequest {
  readinessCheckId: string;
}

export async function POST(request: NextRequest) {
  console.log('🚀 Starting local PDF generation...');
  
  try {
    // Parse and validate request body
    let body: GenerateLocalPDFRequest;
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

    // Format data for PDF generation
    console.log('📄 Formatting report data...');
    const reportData = formatReportData(
      readinessCheck.assessment_data,
      readinessCheck.client_name || 'Client'
    );

    console.log('✅ Report data formatted successfully');

    // Generate PDF
    console.log('📄 Generating PDF...');
    const pdfBlob = await generateLocalPDF(reportData);
    
    console.log('✅ PDF generated successfully');

    // Convert blob to base64 for response
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Update readiness check with PDF data
    console.log('💾 Updating readiness check with PDF data...');
    const { error: updateError } = await supabase
      .from('readiness_checks')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', readinessCheckId);

    if (updateError) {
      logError(updateError, { 
        operation: 'updateReadinessCheck', 
        readinessCheckId
      });
      // Don't fail the request, just log the error
      console.warn('⚠️ Failed to update readiness check status');
    }

    console.log('🎉 Local PDF generation completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'PDF generated successfully',
      readinessCheckId,
      pdfData: base64,
      filename: `Client_ReadinessCheck_${new Date().toISOString().split('T')[0]}.pdf`
    });

  } catch (error) {
    logError(error as Error, { operation: 'generateLocalPDF' });
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error during PDF generation',
      code: 'UNEXPECTED_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
