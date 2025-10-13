'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { RiskBadge } from '@/components/results/RiskBadge';
import { ResultSummary } from '@/components/results/ResultSummary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Assessment } from '@/lib/supabaseClient';
import { getRiskRecommendation } from '@/lib/scoring';
import { Download, Home, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assessmentId) {
      setError('No assessment ID provided');
      setLoading(false);
      return;
    }

    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assessment/${assessmentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch assessment');
        }
        const data = await response.json();
        setAssessment(data);
      } catch (err) {
        setError('Failed to load assessment results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  const generatePDF = () => {
    if (!assessment) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Header with company branding and decorative line
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 25, 112); // Navy blue
    doc.text('System Risk Assessment Report', margin, yPosition);
    yPosition += 6;
    
    // Decorative line
    doc.setDrawColor(25, 25, 112);
    doc.setLineWidth(1.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 12;

    // Summary section with dynamic height based on content
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const summaryTitle = 'Summary:';
    const summaryTitleWidth = doc.getTextWidth(summaryTitle);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const riskColor = assessment.risk_level === 'Low' ? [34, 197, 94] :
                      assessment.risk_level === 'Medium' ? [249, 115, 22] :
                      [239, 68, 68];
    doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
    const summaryText = `Based on your answers, your system has been classified as: ${assessment.risk_level}`;
    const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 2 * margin - 12);
    
    // Calculate dynamic height based on content
    const summaryHeight = Math.max(28, 15 + (splitSummary.length * 6));
    
    doc.setFillColor(240, 248, 255); // Light blue background
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, summaryHeight, 3, 3, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(summaryTitle, margin + 6, yPosition + 10);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.text(splitSummary, margin + 6, yPosition + 20);
    yPosition += summaryHeight + 8;

    // Key Observations section with dynamic height
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const obsTitle = 'Key Observations:';
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const obsText1 = `• Total questions answered: ${assessment.total_questions}`;
    const obsText2 = `• "Yes" responses: ${assessment.yes_count}`;
    const obsText3 = `• Risk category: ${assessment.risk_level}`;
    
    // Calculate dynamic height based on content (3 lines + title)
    const obsHeight = Math.max(28, 15 + (3 * 6));
    
    doc.setFillColor(250, 250, 250); // Very light gray
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, obsHeight, 3, 3, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(obsTitle, margin + 6, yPosition + 8);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(obsText1, margin + 6, yPosition + 15);
    doc.text(obsText2, margin + 6, yPosition + 21);
    doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.text(obsText3, margin + 6, yPosition + 27);
    doc.setTextColor(0, 0, 0);
    yPosition += obsHeight + 8;

    // Recommendations section with dynamic height
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const recTitle = 'Recommendations:';
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const recommendations = [
      'Review your data handling and documentation process.',
      'Keep a clear record of how your system makes key decisions.',
      'Ensure users understand when AI is being used.'
    ];

    // Calculate dynamic height based on content (title + 3 recommendations)
    const recHeight = Math.max(28, 15 + (3 * 6));
    
    doc.setFillColor(245, 255, 245); // Very light green
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, recHeight, 3, 3, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(recTitle, margin + 6, yPosition + 8);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    recommendations.forEach((rec, index) => {
      doc.text(`• ${rec}`, margin + 6, yPosition + 15 + (index * 6));
    });

    yPosition += recHeight + 8;

    // Disclaimer section with dynamic height
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const disclaimerTitle = 'Disclaimer:';

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const disclaimer = 'This is an early-stage assessment tool designed to help identify general risk levels. It is not a legal certification.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin - 12);
    
    // Calculate dynamic height based on content
    const disclaimerHeight = Math.max(25, 15 + (splitDisclaimer.length * 4));
    
    doc.setFillColor(248, 249, 250); // Light gray background
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, disclaimerHeight, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(disclaimerTitle, margin + 6, yPosition + 8);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(splitDisclaimer, margin + 6, yPosition + 16);
    yPosition += disclaimerHeight + 8;

    // Generated by footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text('Generated by: AI Global Innovations', margin, yPosition);

    // No document border for cleaner look

    doc.save(`system-risk-assessment-${assessment.id}.pdf`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your results...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !assessment) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-red-600 mb-4">{error || 'Assessment not found'}</p>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Return to Home Page
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Assessment Complete
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Your AI risk assessment has been successfully completed
              </p>
              <RiskBadge riskLevel={assessment.risk_level} className="mb-8" />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
              {/* Results Summary - Takes up 2 columns on large screens */}
              <div className="lg:col-span-2">
                <ResultSummary
                  riskLevel={assessment.risk_level}
                  yesCount={assessment.yes_count}
                  totalQuestions={assessment.total_questions}
                  onDownloadPDF={generatePDF}
                />
              </div>

              {/* Action Cards - Takes up 1 column on large screens */}
              <div className="space-y-6">
                {/* Download Card - Hidden on mobile */}
                <Card className="hidden lg:block border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Download className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Download Report</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Get a detailed PDF report of your assessment
                    </p>
                    <Button
                      onClick={generatePDF}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF Report
                    </Button>
                  </CardContent>
                </Card>

                {/* Next Steps Card */}
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Next Steps
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-700 mb-6">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Share this report with stakeholders
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Review identified risk areas
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Implement governance frameworks
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Schedule quarterly reassessments
                      </li>
                    </ul>
                    
                    
                  </CardContent>
                 
                  </Card>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
