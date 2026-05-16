import React from 'react';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95',
      secondary: 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 active:scale-95',
      outline: 'bg-transparent text-primary-400 border border-primary-500/50 hover:bg-primary-500/10 active:scale-95',
      ghost: 'bg-transparent text-slate-400 hover:bg-slate-800 transition-all active:scale-95',
      danger: 'bg-red-600/20 text-red-500 border border-red-500/30 hover:bg-red-600/30 shadow-sm active:scale-95',
    };

    const sizes = {
      sm: 'px-4 py-1.5 text-xs',
      md: 'px-6 py-2.5 text-sm',
      lg: 'px-8 py-3.5 text-base',
      icon: 'p-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={loading || disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-immersive-bg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
