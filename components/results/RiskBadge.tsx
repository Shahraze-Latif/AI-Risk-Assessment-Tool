import { RiskLevel, getRiskColor } from '@/lib/scoring';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface RiskBadgeProps {
  riskLevel: RiskLevel;
  className?: string;
}

export function RiskBadge({ riskLevel, className = '' }: RiskBadgeProps) {
  const Icon = riskLevel === 'Low' ? CheckCircle : riskLevel === 'Medium' ? AlertTriangle : AlertCircle;
  
  const getRiskStyles = (level: string) => {
    switch (level) {
      case 'Low':
        return {
          container: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200',
          icon: 'text-white',
          text: 'text-white'
        };
      case 'Medium':
        return {
          container: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200',
          icon: 'text-white',
          text: 'text-white'
        };
      case 'High':
        return {
          container: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-200',
          icon: 'text-white',
          text: 'text-white'
        };
      default:
        return {
          container: 'bg-gray-500 text-white',
          icon: 'text-white',
          text: 'text-white'
        };
    }
  };

  const styles = getRiskStyles(riskLevel);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`px-8 py-4 rounded-2xl border-0 ${styles.container} flex items-center space-x-3 transform hover:scale-105 transition-all duration-200`}>
        <Icon className={`h-8 w-8 ${styles.icon}`} />
        <span className={`text-3xl font-bold ${styles.text}`}>{riskLevel} Risk</span>
      </div>
    </div>
  );
}
