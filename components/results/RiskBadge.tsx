import { RiskLevel, getRiskColor } from '@/lib/scoring';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface RiskBadgeProps {
  riskLevel: RiskLevel;
  className?: string;
}

export function RiskBadge({ riskLevel, className = '' }: RiskBadgeProps) {
  const Icon = riskLevel === 'Low' ? CheckCircle : riskLevel === 'Medium' ? AlertTriangle : AlertCircle;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`px-6 py-3 rounded-lg border-2 ${getRiskColor(riskLevel)} flex items-center space-x-2`}>
        <Icon className="h-6 w-6" />
        <span className="text-2xl font-bold">{riskLevel} Risk</span>
      </div>
    </div>
  );
}
