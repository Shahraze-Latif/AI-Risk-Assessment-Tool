import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RiskLevel, getRiskRecommendation } from '@/lib/scoring';
import { BarChart3, CheckCircle, XCircle, Download } from 'lucide-react';

interface ResultSummaryProps {
  riskLevel: RiskLevel;
  yesCount: number;
  totalQuestions: number;
  onDownloadPDF: () => void;
}

export function ResultSummary({ riskLevel, yesCount, totalQuestions, onDownloadPDF }: ResultSummaryProps) {
  const noCount = totalQuestions - yesCount;
  const recommendation = getRiskRecommendation(riskLevel);
  const yesPercentage = Math.round((yesCount / totalQuestions) * 100);
  const noPercentage = Math.round((noCount / totalQuestions) * 100);

  return (
    <div className="space-y-6">
      {/* Assessment Summary Card */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <span>Assessment Summary</span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Overview of your AI risk assessment responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all duration-200">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700 mb-1">Safe Responses</p>
                <p className="text-3xl font-bold text-green-800">{noCount}</p>
                <p className="text-xs text-green-600">{noPercentage}% of total</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border-2 border-red-200 hover:border-red-300 transition-all duration-200">
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 mb-1">Risk Responses</p>
                <p className="text-3xl font-bold text-red-800">{yesCount}</p>
                <p className="text-xs text-red-600">{yesPercentage}% of total</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-700">
              <span>Risk Level Distribution</span>
              <span>{yesPercentage}% Risk Indicators</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000 ease-out"
                style={{ width: `${yesPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Mobile Download Button - Only visible on mobile */}
          <div className="lg:hidden mt-6 pt-6 border-t border-gray-200">
            <Button
              onClick={onDownloadPDF}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Card */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span>Expert Recommendation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <p className="text-gray-700 leading-relaxed text-base">{recommendation}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
