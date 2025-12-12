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
      'bg-gradient-to-br from-card/95 via-card to-card/90 rounded-2xl p-6 card-shadow-lg border-2 animate-slide-up transition-all duration-300 hover:shadow-neon-lg group',
      riskConfig.border,
      'hover:scale-102 hover:-translate-y-2'
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground uppercase tracking-wider">Risk Analysis</h3>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-neon', riskConfig.gradient)}>
          <RiskIcon className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-medium">Risk Level</p>
          <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg border-2 transition-all duration-300 group-hover:scale-105', riskConfig.bg, 'border-current/30 group-hover:border-current/60')}>
            <span className={cn('', riskConfig.color)}>{riskLevel}</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-medium">Predicted Status</p>
          <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold transition-all duration-300 group-hover:scale-105', predictionConfig.bg, 'border-current/30 group-hover:border-current/60')}>
            <TrendingUp className={cn('w-5 h-5', predictionConfig.color)} />
            <span className={cn('', predictionConfig.color)}>{prediction}</span>
          </div>
        </div>

        <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 group-hover:border-primary/40 transition-all duration-300">
          <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-medium">Overall Score</p>
          <p className="text-4xl font-bold text-foreground">{score.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
};
