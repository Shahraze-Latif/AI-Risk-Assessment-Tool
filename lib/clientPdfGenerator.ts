/**
 * Client-side PDF Generation Utility
 * Generates PDF reports directly in the browser using jsPDF and HTML template
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReportData {
  // Header Section
  ClientName: string;
  ReportDate: string;
  
  // Executive Summary
  TopRisks: string;
  QuickWins: string;
  
  // Risk Heatmap
  Governance_Level: string;
  Data_Level: string;
  Security_Level: string;
  Vendors_Level: string;
  HumanOversight_Level: string;
  Transparency_Level: string;
  
  // Findings by Area
  Governance_Why: string;
  Governance_Findings: string;
  Data_Why: string;
  Data_Findings: string;
  Security_Why: string;
  Security_Findings: string;
  Vendors_Why: string;
  Vendors_Findings: string;
  HumanOversight_Why: string;
  HumanOversight_Findings: string;
  Transparency_Why: string;
  Transparency_Findings: string;
  
  // 30-Day Action Plan
  ActionPlanRows: string;
  
  // Appendix
  EU_AI_Act_101: string;
  US_Healthcare_Lens: string;
}

/**
 * Generate PDF report directly in the browser
 * @param data - Report data to populate template
 * @param filename - Optional filename for download
 */
export async function generateClientPDF(data: ReportData, filename?: string): Promise<void> {
  try {
    console.log('📄 Starting client-side PDF generation...');
    
    // 1. Fetch the HTML template
    console.log('📋 Loading HTML template...');
    const response = await fetch('/ai-readiness-check-template/Readiness_Report_Template.html');
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.statusText}`);
    }
    let html = await response.text();
    
    console.log('✅ Template loaded successfully');
    
    // 2. Replace placeholders with actual data
    console.log('🔄 Replacing placeholders...');
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      html = html.replace(regex, value || '');
    });
    
    console.log('✅ Placeholders replaced');
    
    // 3. Create a temporary element to render
    console.log('🎨 Creating temporary container...');
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '800px'; // Set fixed width for consistent rendering
    container.style.backgroundColor = '#ffffff';
    document.body.appendChild(container);
    
    // 4. Convert to canvas and generate multi-page PDF
    console.log('🖼️ Converting to canvas...');
    const canvas = await html2canvas(container, { 
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: container.scrollHeight
    });
    
    console.log('📄 Generating multi-page PDF...');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = imgProps.width;
    const imgHeight = imgProps.height;
    
    // Calculate how many pages we need
    const ratio = imgWidth / pdfWidth;
    const scaledHeight = imgHeight / ratio;
    const totalPages = Math.ceil(scaledHeight / pdfHeight);
    
    console.log(`📄 Creating ${totalPages} pages for content`);
    
    // Add content to multiple pages with proper margins
    const margin = 40; // 1 inch margins on left and right (unchanged)
    const topMargin = 80; // Increased top margin
    const bottomMargin = 80; // Increased bottom margin
    const contentWidth = pdfWidth - (2 * margin);
    const contentHeight = pdfHeight - topMargin - bottomMargin;
    
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      
      const yOffset = -i * pdfHeight;
      pdf.addImage(imgData, 'PNG', margin, topMargin + yOffset, contentWidth, scaledHeight);
    }
    
    // 5. Download the PDF
    const finalFilename = filename || `Client_ReadinessCheck_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(finalFilename);
    
    // 6. Cleanup
    console.log('🧹 Cleaning up...');
    document.body.removeChild(container);
    
    console.log('✅ PDF generation and download completed');
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert readiness assessment data to report data format
 * @param assessmentData - Raw assessment data from Supabase
 * @param clientName - Client name
 * @returns ReportData - Formatted data for PDF generation
 */
export function formatReportData(assessmentData: any, clientName: string): ReportData {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  console.log('📊 Processing assessment data:', assessmentData);
  
  // Extract area scores from the actual data structure
  const areaScores = assessmentData.area_scores || {};
  const heatmap = assessmentData.heatmap || {};
  const answers = assessmentData.answers || {};
  console.log('📊 Area scores:', areaScores);
  console.log('📊 Heatmap:', heatmap);
  console.log('📊 Answers:', answers);
  
  // Generate top risks (areas with highest scores in heatmap - these are the problem areas)
  const sortedAreas = Object.entries(heatmap)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([area]) => area);
  
  // Generate quick wins (areas with lowest scores - these are strengths)
  const quickWins = Object.entries(heatmap)
    .sort(([,a], [,b]) => (a as number) - (b as number))
    .slice(0, 2)
    .map(([area]) => area);
  
  console.log('📊 Top risks (highest scores):', sortedAreas);
  console.log('📊 Quick wins (lowest scores):', quickWins);
  
  // Generate findings for each area based on 0-3 scoring system
  const generateFindings = (area: string, score: number) => {
    if (score <= 1) return `Strong ${area} practices with comprehensive policies and procedures.`;
    if (score === 2) return `Moderate ${area} practices with some gaps to address.`;
    if (score === 3) return `Significant ${area} gaps requiring immediate attention and improvement.`;
    return `Critical ${area} issues requiring urgent remediation.`;
  };
  
  const generateWhy = (area: string) => {
    const whyMap: Record<string, string> = {
      'Governance': 'Effective governance ensures AI systems are developed and deployed responsibly, with clear accountability and oversight.',
      'Data': 'Data quality and management are critical for AI system performance and compliance with privacy regulations.',
      'Security': 'Robust security measures protect AI systems from threats and ensure data integrity and confidentiality.',
      'Vendors': 'Third-party AI vendors must meet security and compliance standards to maintain system integrity.',
      'HumanOversight': 'Human oversight ensures AI decisions are monitored, validated, and can be overridden when necessary.',
      'Transparency': 'Transparency in AI systems builds trust and enables accountability for AI-driven decisions.'
    };
    return whyMap[area] || `Strong ${area} practices are essential for AI compliance and risk management.`;
  };
  
  // Define action plan item interface
  interface ActionPlanItem {
    task: string;
    owner: string;
    effort: string;
    impact: string;
    due: string;
  }
  
  // Generate 30-day action plan based on exact client specification
  const generateActionPlan = (): ActionPlanItem[] => {
    const actionPlan: ActionPlanItem[] = [];
    
    // Security ≥ 2 AND MFA = No → "Enable MFA and RBAC for all admin users"
    if (heatmap.security >= 2) {
      actionPlan.push({
        task: 'Enable MFA and RBAC for all admin users',
        owner: 'IT',
        effort: 'S',
        impact: 'High',
        due: 'Week 1'
      });
    }
    
    // Vendors ≥ 2 OR no DPA → "Execute DPA with AI provider; review SOC2/ISO docs"
    if (heatmap.vendors >= 2 || answers.contracts >= 2) {
      actionPlan.push({
        task: 'Execute DPA with AI provider; review SOC2/ISO docs',
        owner: 'Ops/Legal',
        effort: 'M',
        impact: 'High',
        due: 'Week 2'
      });
    }
    
    // Human Oversight ≥ 2 → "Add real-time human review for escalations; define fallback"
    if (heatmap.human_oversight >= 2) {
      actionPlan.push({
        task: 'Add real-time human review for escalations; define fallback',
        owner: 'Product',
        effort: 'M',
        impact: 'High',
        due: 'Week 2'
      });
    }
    
    // Data ≥ 2 AND PHI = Yes → "Limit PHI in prompts; add redaction"
    if (heatmap.data >= 2 && answers.sensitive_data === 3) {
      actionPlan.push({
        task: 'Limit PHI in prompts; add redaction',
        owner: 'Data',
        effort: 'M',
        impact: 'High',
        due: 'Week 3'
      });
    }
    
    // Transparency ≥ 2 → "Add AI disclosure text in UI and Help Center"
    if (heatmap.transparency >= 2) {
      actionPlan.push({
        task: 'Add AI disclosure text in UI and Help Center',
        owner: 'Product',
        effort: 'S',
        impact: 'Med',
        due: 'Week 3'
      });
    }
    
    // Governance ≥ 2 → "Publish 1-page AI policy; assign RACI for approvals"
    if (heatmap.governance >= 2) {
      actionPlan.push({
        task: 'Publish 1-page AI policy; assign RACI for approvals',
        owner: 'Leadership',
        effort: 'S',
        impact: 'Med',
        due: 'Week 4'
      });
    }
    
    // If no specific gaps found, add general improvement actions
    if (actionPlan.length === 0) {
      actionPlan.push(
        {
          task: 'Review and update AI governance policies',
          owner: 'Legal',
          effort: 'Small',
          impact: 'Medium',
          due: 'Week 1'
        },
        {
          task: 'Conduct security assessment of AI systems',
          owner: 'Security',
          effort: 'Medium',
          impact: 'High',
          due: 'Week 2'
        }
      );
    }
    
    return actionPlan;
  };
  
  const actionPlan = generateActionPlan();
  console.log('📊 Action plan:', actionPlan);
  
  return {
    // Header Section
    ClientName: clientName,
    ReportDate: currentDate,
    
    // Executive Summary
    TopRisks: sortedAreas.length > 0 ? sortedAreas.join(', ') : 'Governance, Data, Security',
    QuickWins: quickWins.length > 0 ? quickWins.join(', ') : 'Transparency, Human Oversight',
    
    // Risk Heatmap - use heatmap scores directly
    Governance_Level: getRiskLevel(heatmap.governance || 0),
    Data_Level: getRiskLevel(heatmap.data || 0),
    Security_Level: getRiskLevel(heatmap.security || 0),
    Vendors_Level: getRiskLevel(heatmap.vendors || 0),
    HumanOversight_Level: getRiskLevel(heatmap.human_oversight || 0),
    Transparency_Level: getRiskLevel(heatmap.transparency || 0),
    
    // Findings by Area - use heatmap scores
    Governance_Why: generateWhy('Governance'),
    Governance_Findings: generateFindings('Governance', heatmap.governance || 0),
    Data_Why: generateWhy('Data'),
    Data_Findings: generateFindings('Data', heatmap.data || 0),
    Security_Why: generateWhy('Security'),
    Security_Findings: generateFindings('Security', heatmap.security || 0),
    Vendors_Why: generateWhy('Vendors'),
    Vendors_Findings: generateFindings('Vendors', heatmap.vendors || 0),
    HumanOversight_Why: generateWhy('HumanOversight'),
    HumanOversight_Findings: generateFindings('Human Oversight', heatmap.human_oversight || 0),
    Transparency_Why: generateWhy('Transparency'),
    Transparency_Findings: generateFindings('Transparency', heatmap.transparency || 0),
    
    // 30-Day Action Plan
    ActionPlanRows: actionPlan.map((item: ActionPlanItem) => 
      `<tr>
        <td class="c3"><p class="c0"><span class="c2">${item.task}</span></p></td>
        <td class="c3"><p class="c0"><span class="c2">${item.owner}</span></p></td>
        <td class="c3"><p class="c0"><span class="c2">${item.effort}</span></p></td>
        <td class="c3"><p class="c0"><span class="c2">${item.impact}</span></p></td>
        <td class="c3"><p class="c0"><span class="c2">${item.due}</span></p></td>
      </tr>`
    ).join(''),
    
    // Appendix
    EU_AI_Act_101: 'The EU AI Act establishes a comprehensive regulatory framework for AI systems, categorizing them by risk level and imposing specific requirements for high-risk AI applications.',
    US_Healthcare_Lens: 'Healthcare AI systems in the US must comply with HIPAA, FDA regulations, and state privacy laws, requiring robust data protection and clinical validation.'
  };
}

/**
 * Convert numeric score to risk level based on the actual scoring system
 * @param score - Numeric score (0-3)
 * @returns Risk level string
 */
function getRiskLevel(score: number): string {
  if (score <= 1) return 'Low Risk';
  if (score === 2) return 'Medium Risk';
  if (score === 3) return 'High Risk';
  return 'Critical Risk';
}
