import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'glass-dark';
  noPadding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'glass', noPadding = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${variant} ${noPadding ? '' : 'p-6'} overflow-hidden transition-all duration-300 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
