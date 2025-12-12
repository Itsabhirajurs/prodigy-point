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
    <div className="bg-card rounded-2xl p-6 card-shadow animate-fade-in hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group border-2 border-transparent hover:border-primary/30">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3', variantStyles[variant])}>
          <Icon className="w-7 h-7 text-primary-foreground" />
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
