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
      'relative overflow-hidden rounded-2xl p-8 card-shadow-xl border-2 animate-slide-up',
      riskConfig.border,
      'bg-gradient-to-br from-card to-card/50'
    )}>
      {/* Animated background accent */}
      <div className={cn(
        'absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl opacity-30 animate-pulse-soft',
        'bg-success' === riskLevel ? 'bg-success' : riskLevel === 'Medium Risk' ? 'bg-warning' : 'bg-destructive'
      )}></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">Risk Analysis</h3>
            <p className="text-sm text-muted-foreground">Your academic standing</p>
          </div>
          <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg', riskConfig.gradient)}>
            <RiskIcon className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        <div className="space-y-6">
          {/* Risk Level Badge */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Risk Level</p>
            <div className={cn('inline-flex items-center gap-3 px-6 py-3 rounded-full font-bold text-lg shadow-lg', riskConfig.bg, riskConfig.color)}>
              <span className="inline-block w-3 h-3 rounded-full" style={{ 
                backgroundColor: riskLevel === 'Low Risk' ? '#22c55e' : riskLevel === 'Medium Risk' ? '#eab308' : '#ef4444' 
              }}></span>
              {riskLevel}
            </div>
          </div>

          {/* Score */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Overall Score</p>
            <div className="flex items-end gap-3">
              <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {Math.round(score * 10) / 10}
              </div>
              <div className="text-muted-foreground text-sm mb-2">/100</div>
            </div>
            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
              <div 
                className={cn('h-full rounded-full transition-all duration-500', riskConfig.gradient)}
                style={{ width: `${Math.min(100, score)}%` }}
              />
            </div>
          </div>

          {/* Prediction */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Predicted Status</p>
            <div className={cn('inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-lg', predictionConfig.bg)}>
              <TrendingUp className="w-4 h-4" />
              <span>{prediction}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
