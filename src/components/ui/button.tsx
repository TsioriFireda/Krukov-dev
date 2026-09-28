import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'krukov';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer';
    
    const variants = {
      default: 'bg-stone-900 text-white hover:bg-stone-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
      krukov: 'bg-[#541515] text-white hover:bg-[#6e1c1c] shadow-xs active:scale-[0.99]',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-xs',
      outline: 'border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-900 dark:text-slate-100',
      secondary: 'bg-stone-100 dark:bg-slate-800 text-stone-900 dark:text-slate-100 hover:bg-stone-200 dark:hover:bg-slate-700',
      ghost: 'hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-700 dark:text-slate-200',
      link: 'text-[#541515] dark:text-rose-400 underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-11 rounded-lg px-8 text-base',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
