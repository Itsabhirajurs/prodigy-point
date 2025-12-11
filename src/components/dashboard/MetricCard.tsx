import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  suffix?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  description?: string;
}

const variantStyles = {
  default: 'gradient-primary',
  success: 'gradient-success',
  warning: 'gradient-warning',
  danger: 'gradient-danger',
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  suffix = '',
  variant = 'default',
  description,
}) => {
  return (
    <div className="bg-card rounded-2xl p-6 card-shadow card-hover animate-slide-up border border-border/50 overflow-hidden relative">
      {/* Gradient background accent */}
      <div className={cn('absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20', 
        variant === 'success' && 'bg-success',
        variant === 'warning' && 'bg-warning',
        variant === 'danger' && 'bg-destructive',
        variant === 'default' && 'bg-primary'
      )}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center shadow-lg', variantStyles[variant])}>
            <Icon className="w-7 h-7 text-primary-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
              {typeof value === 'number' ? Math.round(value * 10) / 10 : value}
            </p>
            {suffix && <span className="text-lg font-medium text-muted-foreground">{suffix}</span>}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground pt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};
