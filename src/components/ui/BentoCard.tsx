import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import type { ReactNode } from 'react';

interface BentoCardProps {
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: ReactNode;
}

export const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(
  ({ hover = true, padding = 'md', className, children }, ref) => {
    const paddingStyles = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -2, boxShadow: '0 12px 30px -4px rgba(0, 210, 196, 0.15), 0 4px 12px -2px rgba(0, 163, 255, 0.08)' } : undefined}
        className={`bg-white rounded-3xl border border-slate-200 shadow-sm ${paddingStyles[padding]} ${className}`}
      >
        {children}
      </motion.div>
    );
  }
);
