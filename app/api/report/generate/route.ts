import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { initializeGoogleAPIs } from '@/lib/googleApis';
import { GOOGLE_CONFIG, PLACEHOLDERS } from '@/lib/config';

interface ReportGenerationRequest {
  clientId: string;
}

interface ReportData {
  clientName: string;
  clientEmail: string;
  date: string;
  overallScore: number;
  overallLabel: string;
  areaScores: Record<string, { score: number; label: string }>;
  plan: string[];
  heatmap: Record<string, number>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ReportGenerationRequest = await request.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Fetch the readiness check record from Supabase
    const { data: readinessCheck, error: fetchError } = await supabase
      .from('readiness_checks')
      .select('*')
      .eq('id', clientId)
      .eq('status', 'processing')
      .single();

    if (fetchError || !readinessCheck) {
      return NextResponse.json({ error: 'Readiness check not found or not ready for processing' }, { status: 404 });
    }

    const assessmentData = readinessCheck.assessment_data;
    if (!assessmentData) {
      return NextResponse.json({ error: 'Assessment data not found' }, { status: 400 });
    }

    // Prepare report data
    const reportData: ReportData = {
      clientName: readinessCheck.client_name || 'Client',
      clientEmail: readinessCheck.client_email || '',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      overallScore: assessmentData.weighted_score,
      overallLabel: assessmentData.overall_label,
      areaScores: assessmentData.area_scores,
      plan: assessmentData.plan || [],
      heatmap: assessmentData.heatmap || {}
    };

    // Initialize Google APIs
    const { docs, drive } = initializeGoogleAPIs();

    // Generate the report
    const reportUrl = await generateReport(docs, drive, reportData);

    // Update the readiness check record with report URL
    const { error: updateError } = await supabase
      .from('readiness_checks')
      .update({
        status: 'completed',
        report_url: reportUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId);

    if (updateError) {
      console.error('Error updating readiness check:', updateError);
      return NextResponse.json({ error: 'Failed to update record with report URL' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reportUrl,
      message: 'Report generated successfully'
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

async function generateReport(docs: any, drive: any, data: ReportData): Promise<string> {
  try {
    // Copy the template document
    const copyResponse = await drive.files.copy({
      fileId: GOOGLE_CONFIG.TEMPLATE_DOC_ID,
      requestBody: {
        name: `Client_ReadinessCheck_${new Date().toISOString().split('T')[0]}.pdf`
      }
    });

    const newDocId = copyResponse.data.id;
    console.log('Created new document:', newDocId);

    // Prepare replacement data
    const replacements = await prepareReplacements(data);

    // Replace placeholders in the document
    await replacePlaceholders(docs, newDocId, replacements);

    // Export as PDF
    const pdfResponse = await drive.files.export({
      fileId: newDocId,
      mimeType: 'application/pdf'
    }, {
      responseType: 'stream'
    });

    // Upload PDF to Drive
    const pdfFileName = `Client_ReadinessCheck_${new Date().toISOString().split('T')[0]}.pdf`;
    const uploadResponse = await drive.files.create({
      requestBody: {
        name: pdfFileName,
        parents: [GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID] // Use the configured Drive folder ID
      },
      media: {
        mimeType: 'application/pdf',
        body: pdfResponse.data
      }
    });

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: uploadResponse.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Clean up the temporary document
    await drive.files.delete({
      fileId: newDocId
    });

    return `https://drive.google.com/file/d/${uploadResponse.data.id}/view`;

  } catch (error) {
    console.error('Error in generateReport:', error);
    throw error;
  }
}

async function prepareReplacements(data: ReportData) {
  // Build heatmap table
  const heatmapTable = buildHeatmapTable(data.areaScores);
  
  // Build area scores section
  const areaScores = buildAreaScores(data.areaScores);
  
  // Build findings by area
  const findingsByArea = buildFindingsByArea(data.areaScores);
  
  // Build 30-day plan
  const thirtyDayPlan = buildThirtyDayPlan(data.plan);
  
  // Build appendix
  const appendix = buildAppendix();

  return {
    [PLACEHOLDERS.CLIENT_NAME]: data.clientName,
    [PLACEHOLDERS.DATE]: data.date,
    [PLACEHOLDERS.OVERALL_SCORE]: `${data.overallScore} (${data.overallLabel})`,
    [PLACEHOLDERS.HEATMAP_TABLE]: heatmapTable,
    [PLACEHOLDERS.AREA_SCORES]: areaScores,
    [PLACEHOLDERS.FINDINGS_BY_AREA]: findingsByArea,
    [PLACEHOLDERS.THIRTY_DAY_PLAN]: thirtyDayPlan,
    [PLACEHOLDERS.APPENDIX]: appendix
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
    // Get the document content
    const doc = await docs.documents.get({
      documentId: docId
    });

    const requests = [];

    // Replace each placeholder
    for (const [placeholder, replacement] of Object.entries(replacements)) {
      // Find and replace text
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

