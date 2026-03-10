import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, fullWidth = false, id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <div className={`flex flex-col gap-2 ${widthClass}`}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-white text-shadow-sm">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`
            bg-[#043927]/60 border border-[#C5A059]/30 shadow-[inset_0_0_15px_rgba(0,168,107,0.1)] backdrop-blur-[25px] rounded-[12px]
            w-full px-4 py-3 text-white placeholder:text-white/60
            focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold
            transition-all duration-200
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
