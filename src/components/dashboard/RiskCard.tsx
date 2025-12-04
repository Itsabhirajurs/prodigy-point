import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, TrendingUp, AlertTriangle } from 'lucide-react';

interface RiskCardProps {
  riskLevel: string;
  prediction: string;
  score: number;
}

const getRiskConfig = (risk: string) => {
  switch (risk) {
    case 'Low Risk':
      return {
        color: 'text-success',
        bg: 'bg-success/10',
        border: 'border-success/20',
        icon: Shield,
        gradient: 'gradient-success',
      };
    case 'Medium Risk':
      return {
        color: 'text-warning',
        bg: 'bg-warning/10',
        border: 'border-warning/20',
        icon: AlertTriangle,
        gradient: 'gradient-warning',
      };
    default:
      return {
        color: 'text-destructive',
        bg: 'bg-destructive/10',
        border: 'border-destructive/20',
        icon: AlertTriangle,
        gradient: 'gradient-danger',
      };
  }
};

const getPredictionConfig = (prediction: string) => {
  return prediction === 'On Track'
    ? { color: 'text-success', bg: 'bg-success/10' }
    : { color: 'text-warning', bg: 'bg-warning/10' };
};

export const RiskCard: React.FC<RiskCardProps> = ({ riskLevel, prediction, score }) => {
  const riskConfig = getRiskConfig(riskLevel);
  const predictionConfig = getPredictionConfig(prediction);
  const RiskIcon = riskConfig.icon;

  return (
    <div className={cn(
      'bg-card rounded-2xl p-6 card-shadow-lg border-2 animate-slide-up',
      riskConfig.border
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Risk Analysis</h3>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', riskConfig.gradient)}>
          <RiskIcon className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
          <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full', riskConfig.bg)}>
            <span className={cn('text-xl font-bold', riskConfig.color)}>{riskLevel}</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Predicted Status</p>
          <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full', predictionConfig.bg)}>
            <TrendingUp className={cn('w-5 h-5', predictionConfig.color)} />
            <span className={cn('font-semibold', predictionConfig.color)}>{prediction}</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
          <p className="text-3xl font-bold text-foreground">{score.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
};
