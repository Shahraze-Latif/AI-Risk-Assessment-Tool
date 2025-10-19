/**
 * Local PDF Generation Utility
 * Generates PDF reports locally using jsPDF and HTML template
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
  
  // Appendix
  EU_AI_Act_101: string;
  US_Healthcare_Lens: string;
}

/**
 * Generate PDF report locally using HTML template
 * @param data - Report data to populate template
 * @returns Promise<Blob> - Generated PDF as blob
 */
export async function generateLocalPDF(data: ReportData): Promise<Blob> {
  try {
    console.log('📄 Starting local PDF generation...');
    
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
    document.body.appendChild(container);
    
    // 4. Convert to canvas and generate multi-page PDF
    console.log('🖼️ Converting to canvas...');
    const canvas = await html2canvas(container, { 
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
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
    
    // 5. Cleanup
    console.log('🧹 Cleaning up...');
    document.body.removeChild(container);
    
    console.log('✅ PDF generation completed');
    
    // Return as blob
    return pdf.output('blob');
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download PDF file
 * @param data - Report data
 * @param filename - Optional filename
 */
export async function downloadPDF(data: ReportData, filename?: string): Promise<void> {
  try {
    const pdfBlob = await generateLocalPDF(data);
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `Client_ReadinessCheck_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    console.log('✅ PDF downloaded successfully');
    
  } catch (error) {
    console.error('❌ PDF download failed:', error);
    throw error;
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
  
  // Extract area scores
  const areaScores = assessmentData.area_scores || {};
  
  // Generate top risks (areas with lowest scores)
  const sortedAreas = Object.entries(areaScores)
    .sort(([,a], [,b]) => (a as number) - (b as number))
    .slice(0, 3)
    .map(([area]) => area);
  
  // Generate quick wins (areas with highest scores)
  const quickWins = Object.entries(areaScores)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 2)
    .map(([area]) => area);
  
  // Generate findings for each area
  const generateFindings = (area: string, score: number) => {
    if (score >= 80) return `Strong ${area} practices with comprehensive policies and procedures.`;
    if (score >= 60) return `Good ${area} foundation with some areas for improvement.`;
    if (score >= 40) return `Moderate ${area} practices with significant gaps to address.`;
    return `Weak ${area} practices requiring immediate attention and improvement.`;
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
  
  return {
    // Header Section
    ClientName: clientName,
    ReportDate: currentDate,
    
    // Executive Summary
    TopRisks: sortedAreas.join(', '),
    QuickWins: quickWins.join(', '),
    
    // Risk Heatmap
    Governance_Level: getRiskLevel(areaScores.Governance || 0),
    Data_Level: getRiskLevel(areaScores.Data || 0),
    Security_Level: getRiskLevel(areaScores.Security || 0),
    Vendors_Level: getRiskLevel(areaScores.Vendors || 0),
    HumanOversight_Level: getRiskLevel(areaScores.HumanOversight || 0),
    Transparency_Level: getRiskLevel(areaScores.Transparency || 0),
    
    // Findings by Area
    Governance_Why: generateWhy('Governance'),
    Governance_Findings: generateFindings('Governance', areaScores.Governance || 0),
    Data_Why: generateWhy('Data'),
    Data_Findings: generateFindings('Data', areaScores.Data || 0),
    Security_Why: generateWhy('Security'),
    Security_Findings: generateFindings('Security', areaScores.Security || 0),
    Vendors_Why: generateWhy('Vendors'),
    Vendors_Findings: generateFindings('Vendors', areaScores.Vendors || 0),
    HumanOversight_Why: generateWhy('HumanOversight'),
    HumanOversight_Findings: generateFindings('Human Oversight', areaScores.HumanOversight || 0),
    Transparency_Why: generateWhy('Transparency'),
    Transparency_Findings: generateFindings('Transparency', areaScores.Transparency || 0),
    
    // Appendix
    EU_AI_Act_101: 'The EU AI Act establishes a comprehensive regulatory framework for AI systems, categorizing them by risk level and imposing specific requirements for high-risk AI applications.',
    US_Healthcare_Lens: 'Healthcare AI systems in the US must comply with HIPAA, FDA regulations, and state privacy laws, requiring robust data protection and clinical validation.'
  };
}

/**
 * Convert numeric score to risk level
 * @param score - Numeric score (0-100)
 * @returns Risk level string
 */
function getRiskLevel(score: number): string {
  if (score >= 80) return 'Low Risk';
  if (score >= 60) return 'Medium Risk';
  if (score >= 40) return 'High Risk';
  return 'Critical Risk';
}
