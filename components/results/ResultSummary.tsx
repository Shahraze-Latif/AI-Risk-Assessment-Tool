import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskLevel, getRiskRecommendation } from '@/lib/scoring';
import { BarChart3, CheckCircle, XCircle } from 'lucide-react';

interface ResultSummaryProps {
  riskLevel: RiskLevel;
  yesCount: number;
  totalQuestions: number;
}

export function ResultSummary({ riskLevel, yesCount, totalQuestions }: ResultSummaryProps) {
  const noCount = totalQuestions - yesCount;
  const recommendation = getRiskRecommendation(riskLevel);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Assessment Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">No Responses</p>
                <p className="text-2xl font-bold text-gray-900">{noCount}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Yes Responses</p>
                <p className="text-2xl font-bold text-gray-900">{yesCount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{recommendation}</p>
        </CardContent>
      </Card>
    </div>
  );
}
