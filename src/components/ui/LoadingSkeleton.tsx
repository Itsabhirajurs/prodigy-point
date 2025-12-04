import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'avatar' | 'chart';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className, variant = 'text' }) => {
  const baseClass = 'animate-pulse bg-muted rounded';

  switch (variant) {
    case 'card':
      return (
        <div className={cn('bg-card rounded-2xl p-5 card-shadow', className)}>
          <div className={cn(baseClass, 'w-12 h-12 rounded-xl mb-4')} />
          <div className={cn(baseClass, 'h-4 w-24 mb-2')} />
          <div className={cn(baseClass, 'h-8 w-16')} />
        </div>
      );
    case 'avatar':
      return <div className={cn(baseClass, 'w-16 h-16 rounded-2xl', className)} />;
    case 'chart':
      return (
        <div className={cn('bg-card rounded-2xl p-5 card-shadow', className)}>
          <div className={cn(baseClass, 'h-5 w-40 mb-4')} />
          <div className={cn(baseClass, 'h-64 w-full')} />
        </div>
      );
    default:
      return <div className={cn(baseClass, 'h-4 w-full', className)} />;
  }
};
