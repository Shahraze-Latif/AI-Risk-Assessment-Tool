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
    const margin = 20;
    let yPosition = margin;

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Risk Assessment Report', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report ID: ${assessment.id}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Date: ${new Date(assessment.created_at).toLocaleDateString()}`, margin, yPosition);
    yPosition += 15;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Assessment Results', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const riskColor = assessment.risk_level === 'Low' ? [34, 197, 94] :
                      assessment.risk_level === 'Medium' ? [249, 115, 22] :
                      [239, 68, 68];
    doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.text(`Risk Level: ${assessment.risk_level}`, margin, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Yes Responses: ${assessment.yes_count}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Total Questions: ${assessment.total_questions}`, margin, yPosition);
    yPosition += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommendation', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const recommendation = getRiskRecommendation(assessment.risk_level);
    const splitRecommendation = doc.splitTextToSize(recommendation, pageWidth - 2 * margin);
    doc.text(splitRecommendation, margin, yPosition);
    yPosition += splitRecommendation.length * 7 + 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Next Steps', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const nextSteps = [
      '1. Share this report with relevant stakeholders',
      '2. Review and address identified risk areas',
      '3. Implement recommended governance frameworks',
      '4. Schedule regular reassessments (recommended: quarterly)'
    ];

    nextSteps.forEach(step => {
      doc.text(step, margin, yPosition);
      yPosition += 7;
    });

    yPosition += 20;
    const disclaimerY = doc.internal.pageSize.getHeight() - 30;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    const disclaimer = 'Disclaimer: This assessment provides general guidance only and should not be considered professional legal or compliance advice. Consult with qualified professionals for specific recommendations.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin);
    doc.text(splitDisclaimer, margin, disclaimerY);

    doc.save(`ai-risk-assessment-${assessment.id}.pdf`);
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
                <Button>Return Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Assessment Complete</h1>
            <RiskBadge riskLevel={assessment.risk_level} className="mb-6" />
          </div>

          <ResultSummary
            riskLevel={assessment.risk_level}
            yesCount={assessment.yes_count}
            totalQuestions={assessment.total_questions}
          />

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={generatePDF}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF Report
            </Button>
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </Link>
          </div>

          <div className="mt-12 p-6 bg-gray-50 rounded-lg border">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">What's Next?</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• Share this report with relevant stakeholders</li>
              <li>• Review and address identified risk areas</li>
              <li>• Implement recommended governance frameworks</li>
              <li>• Schedule regular reassessments (recommended: quarterly)</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
