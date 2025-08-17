// Manufacturing Production Tracker - Button Component
// Unified button component with variants, sizes, and states

import React, { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}, ref) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'font-medium',
    'transition-colors',
    'focus-ring',
    'disabled:opacity-60',
    'disabled:cursor-not-allowed',
    'disabled:pointer-events-none'
  ];

  // Size classes
  const sizeClasses = {
    sm: ['text-sm', 'px-3', 'py-2', 'h-9', 'min-w-[2.25rem]', 'rounded'],
    md: ['text-base', 'px-4', 'py-3', 'h-11', 'min-w-[2.75rem]', 'rounded-lg'],
    lg: ['text-lg', 'px-6', 'py-4', 'h-12', 'min-w-[3rem]', 'rounded-xl']
  };

  // Variant classes
  const variantClasses = {
    primary: [
      'bg-primary',
      'text-primary-foreground',
      'border-0',
      'hover:opacity-95',
      'active:opacity-90',
      'shadow-sm',
      'hover:shadow-card'
    ],
    secondary: [
      'bg-muted',
      'text-text',
      'border',
      'border-border',
      'hover:bg-border',
      'active:bg-surface-elevated',
      'shadow-sm'
    ],
    outline: [
      'bg-bg',
      'text-text',
      'border',
      'border-border',
      'hover:bg-surface',
      'active:bg-muted',
      'shadow-sm'
    ],
    ghost: [
      'bg-transparent',
      'text-text',
      'border-0',
      'hover:bg-muted',
      'active:bg-border'
    ],
    danger: [
      'bg-danger',
      'text-danger-foreground',
      'border-0',
      'hover:opacity-95',
      'active:opacity-90',
      'shadow-sm',
      'hover:shadow-card'
    ]
  };

  const classes = [
    ...baseClasses,
    ...sizeClasses[size],
    ...variantClasses[variant],
    fullWidth ? 'w-full' : '',
    loading ? 'loading' : '',
    className
  ].filter(Boolean).join(' ');

  const renderIcon = (position: 'left' | 'right') => {
    if (!icon || iconPosition !== position) return null;
    
    return (
      <span className={`flex-shrink-0 ${loading ? 'opacity-0' : ''}`}>
        {icon}
      </span>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <span className="opacity-0 flex items-center gap-2">
            {renderIcon('left')}
            {children}
            {renderIcon('right')}
          </span>
          <span className="absolute inset-0 flex items-center justify-center">
            <svg 
              className="animate-spin h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        </>
      );
    }

    return (
      <>
        {renderIcon('left')}
        {children}
        {renderIcon('right')}
      </>
    );
  };

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
});

Button.displayName = 'Button';

// Additional button variants for specific use cases
export const IconButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'children'> & { 
  icon: ReactNode; 
  'aria-label': string;
  tooltip?: string;
}>(({ icon, size = 'md', variant = 'ghost', className = '', ...props }, ref) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };
  
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={`aspect-square p-0 ${className}`}
      {...props}
    >
      <span className={iconSizes[size]}>
        {icon}
      </span>
    </Button>
  );
});

IconButton.displayName = 'IconButton';

// Button group for related actions
export interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ 
  children, 
  className = '',
  orientation = 'horizontal'
}) => {
  const orientationClasses = {
    horizontal: 'flex-row [&>button:not(:first-child)]:ml-[-1px] [&>button:not(:first-child):not(:last-child)]:rounded-none [&>button:first-child]:rounded-r-none [&>button:last-child]:rounded-l-none',
    vertical: 'flex-col [&>button:not(:first-child)]:mt-[-1px] [&>button:not(:first-child):not(:last-child)]:rounded-none [&>button:first-child]:rounded-b-none [&>button:last-child]:rounded-t-none'
  };

  return (
    <div className={`inline-flex ${orientationClasses[orientation]} ${className}`}>
      {children}
    </div>
  );
};

ButtonGroup.displayName = 'ButtonGroup';