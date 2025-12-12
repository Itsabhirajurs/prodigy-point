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
    <div className="bg-gradient-to-br from-card/95 via-card to-card/90 rounded-2xl p-6 card-shadow animate-fade-in hover:shadow-neon-lg transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer group border-2 border-primary/30 hover:border-primary/60 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-125 group-hover:rotate-6 shadow-lg group-hover:shadow-neon', variantStyles[variant])}>
          <Icon className="w-7 h-7 text-primary-foreground" />
        </div>
      </div>
      <div className="space-y-1 relative z-10">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
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
