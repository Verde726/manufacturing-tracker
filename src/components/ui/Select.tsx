// Manufacturing Production Tracker - Select Component
// Unified select component with variants and states

import React, { forwardRef } from 'react';
import type { SelectHTMLAttributes, ReactNode } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  placeholder?: string;
  options: SelectOption[];
  fullWidth?: boolean;
  leftIcon?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helper,
  placeholder,
  options,
  fullWidth = false,
  leftIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
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
    'disabled:opacity-60',
    'disabled:cursor-not-allowed',
    'appearance-none',
    'cursor-pointer'
  ];

  const stateClasses = error 
    ? ['border-danger', 'focus:border-danger']
    : ['border-border', 'focus:border-primary'];

  const iconPadding = leftIcon ? 'pl-10' : '';

  const selectClasses = [
    ...baseClasses,
    ...stateClasses,
    iconPadding,
    'pr-10', // Always add right padding for the dropdown arrow
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-text mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted pointer-events-none z-10">
            {leftIcon}
          </div>
        )}
        
        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted pointer-events-none">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
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

Select.displayName = 'Select';

// Multi-select component (simplified version)
export interface MultiSelectProps extends Omit<SelectProps, 'options' | 'onChange'> {
  options: SelectOption[];
  value?: string[];
  onChange?: (values: string[]) => void;
  maxSelections?: number;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  error,
  helper,
  placeholder = "Select options...",
  options,
  value = [],
  onChange,
  maxSelections,
  fullWidth = false,
  className = '',
  id
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectId = id || `multiselect-${Math.random().toString(36).substr(2, 9)}`;

  const handleOptionToggle = (optionValue: string) => {
    if (!onChange) return;
    
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : maxSelections && value.length >= maxSelections
        ? value
        : [...value, optionValue];
    
    onChange(newValue);
  };

  const selectedLabels = value
    .map(v => options.find(opt => opt.value === v)?.label)
    .filter(Boolean);

  const displayText = selectedLabels.length === 0 
    ? placeholder 
    : selectedLabels.length === 1 
      ? selectedLabels[0]
      : `${selectedLabels.length} selected`;

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
    'disabled:opacity-60',
    'disabled:cursor-not-allowed',
    'cursor-pointer',
    'pr-10'
  ];

  const stateClasses = error 
    ? ['border-danger', 'focus:border-danger']
    : ['border-border', 'focus:border-primary'];

  const triggerClasses = [
    ...baseClasses,
    ...stateClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`${fullWidth ? 'w-full' : ''} relative`}>
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-text mb-2"
        >
          {label}
        </label>
      )}
      
      <button
        type="button"
        id={selectId}
        className={triggerClasses}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={`block truncate text-left ${selectedLabels.length === 0 ? 'text-text-muted' : ''}`}>
          {displayText}
        </span>
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-bg border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            const isDisabled = option.disabled || (maxSelections && !isSelected && value.length >= maxSelections);
            
            return (
              <button
                key={option.value}
                type="button"
                className={`
                  w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors
                  ${isSelected ? 'bg-primary text-primary-foreground' : 'text-text'}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  first:rounded-t-lg last:rounded-b-lg
                `}
                onClick={() => handleOptionToggle(option.value)}
                disabled={!!isDisabled}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {isSelected && (
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
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
};

MultiSelect.displayName = 'MultiSelect';