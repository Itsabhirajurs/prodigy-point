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
    <div className="bg-card rounded-2xl p-5 card-shadow animate-fade-in hover:card-shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110', variantStyles[variant])}>
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-foreground">
          {typeof value === 'number' ? Math.round(value * 10) / 10 : value}
          {suffix && <span className="text-lg font-medium text-muted-foreground ml-1">{suffix}</span>}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};
