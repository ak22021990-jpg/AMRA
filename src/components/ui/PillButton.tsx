import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import type { ReactNode, MouseEventHandler } from 'react';

interface PillButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  'aria-label'?: string;
}

export const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, onClick, disabled, type = 'button', title, 'aria-label': ariaLabel }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-headline-sm font-bold rounded-full transition-colors';
    const sizeStyles = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    };
    const variantStyles = {
      primary: 'bg-gradient-to-r from-primary to-sensor-cyan text-white shadow-md',
      secondary: 'bg-white border border-slate-200 text-midnight-slate hover:bg-slate-50',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        onClick={onClick}
        disabled={disabled}
        type={type}
        title={title}
        aria-label={ariaLabel}
      >
        {children}
      </motion.button>
    );
  }
);
