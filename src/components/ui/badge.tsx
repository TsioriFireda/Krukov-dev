import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'krukov';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-stone-900 text-white dark:bg-slate-100 dark:text-slate-900',
    krukov: 'bg-[#541515] text-white',
    secondary: 'bg-stone-100 text-stone-800 dark:bg-slate-800 dark:text-slate-200',
    destructive: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
    outline: 'border border-stone-200 dark:border-slate-800 text-stone-800 dark:text-slate-200',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
