// Manufacturing Production Tracker - Input Component
// Unified input component with variants and states

import React, { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = [
    'w-full',
    'px-3',
    'py-2.5',
    'text-base',
    'text-text',
    'bg-bg',
    'border',
    'rounded-lg',
    'transition-colors',
    'focus-ring',
    'placeholder:text-text-muted',
    'disabled:opacity-60',
    'disabled:cursor-not-allowed'
  ];

  const stateClasses = error 
    ? ['border-danger', 'focus:border-danger']
    : ['border-border', 'focus:border-primary'];

  const iconPadding = {
    left: leftIcon ? 'pl-10' : '',
    right: rightIcon ? 'pr-10' : ''
  };

  const inputClasses = [
    ...baseClasses,
    ...stateClasses,
    iconPadding.left,
    iconPadding.right,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-text mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helper) && (
        <div className="mt-2">
          {error && (
            <p className="text-sm text-danger flex items-center gap-1">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
          {helper && !error && (
            <p className="text-sm text-text-muted">{helper}</p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helper,
  fullWidth = false,
  resize = 'vertical',
  className = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = [
    'w-full',
    'px-3',
    'py-2.5',
    'text-base',
    'text-text',
    'bg-bg',
    'border',
    'rounded-lg',
    'transition-colors',
    'focus-ring',
    'placeholder:text-text-muted',
    'disabled:opacity-60',
    'disabled:cursor-not-allowed',
    'min-h-[5rem]'
  ];

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x', 
    both: 'resize'
  };

  const stateClasses = error 
    ? ['border-danger', 'focus:border-danger']
    : ['border-border', 'focus:border-primary'];

  const textareaClasses = [
    ...baseClasses,
    ...stateClasses,
    resizeClasses[resize],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-text mb-2"
        >
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        className={textareaClasses}
        {...props}
      />
      
      {(error || helper) && (
        <div className="mt-2">
          {error && (
            <p className="text-sm text-danger flex items-center gap-1">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
          {helper && !error && (
            <p className="text-sm text-text-muted">{helper}</p>
          )}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';