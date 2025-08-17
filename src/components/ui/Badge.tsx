// Manufacturing Production Tracker - Badge Component
// Status badges with semantic variants

import React from 'react';
import type { ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  children
}) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'border',
    'uppercase',
    'tracking-wide'
  ];

  // Size classes
  const sizeClasses = {
    sm: ['text-xs', 'px-2', 'py-0.5', 'rounded'],
    md: ['text-sm', 'px-2.5', 'py-1', 'rounded'],
    lg: ['text-base', 'px-3', 'py-1.5', 'rounded-lg']
  };

  // Variant classes
  const variantClasses = {
    default: [
      'bg-muted',
      'text-text',
      'border-border'
    ],
    primary: [
      'bg-primary',
      'text-primary-foreground',
      'border-primary'
    ],
    secondary: [
      'bg-secondary',
      'text-secondary-foreground', 
      'border-secondary'
    ],
    success: [
      'bg-success/10',
      'text-success',
      'border-success/20'
    ],
    warning: [
      'bg-warning/10',
      'text-warning',
      'border-warning/20'
    ],
    danger: [
      'bg-danger/10',
      'text-danger',
      'border-danger/20'
    ],
    info: [
      'bg-info/10',
      'text-info',
      'border-info/20'
    ]
  };

  const classes = [
    ...baseClasses,
    ...sizeClasses[size],
    ...variantClasses[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

// Status badge for manufacturing states
export interface StatusBadgeProps {
  status: 'active' | 'open' | 'completed' | 'closed' | 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
  children
}) => {
  const statusConfig = {
    active: {
      variant: 'success' as const,
      label: 'Active',
      icon: '●'
    },
    open: {
      variant: 'info' as const,
      label: 'Open',
      icon: '○'
    },
    completed: {
      variant: 'success' as const,
      label: 'Completed',
      icon: '✓'
    },
    closed: {
      variant: 'default' as const,
      label: 'Closed',
      icon: '■'
    },
    excellent: {
      variant: 'success' as const,
      label: 'Excellent',
      icon: '★'
    },
    good: {
      variant: 'success' as const,
      label: 'Good',
      icon: '▲'
    },
    fair: {
      variant: 'warning' as const,
      label: 'Fair',
      icon: '●'
    },
    poor: {
      variant: 'danger' as const,
      label: 'Poor',
      icon: '▼'
    },
    offline: {
      variant: 'default' as const,
      label: 'Offline',
      icon: '○'
    }
  };

  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} size={size} className={className}>
      <span className="mr-1" aria-hidden="true">
        {config.icon}
      </span>
      {children || config.label}
    </Badge>
  );
};

StatusBadge.displayName = 'StatusBadge';

// Efficiency badge with percentage
export interface EfficiencyBadgeProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export const EfficiencyBadge: React.FC<EfficiencyBadgeProps> = ({
  percentage,
  size = 'md',
  className = '',
  showIcon = true
}) => {
  const getVariant = (pct: number): BadgeProps['variant'] => {
    if (pct >= 100) return 'success';
    if (pct >= 80) return 'warning';
    return 'danger';
  };

  const getIcon = (pct: number): string => {
    if (pct >= 100) return '↗';
    if (pct >= 80) return '→';
    return '↘';
  };

  const variant = getVariant(percentage);
  const icon = getIcon(percentage);

  return (
    <Badge variant={variant} size={size} className={className}>
      {showIcon && (
        <span className="mr-1" aria-hidden="true">
          {icon}
        </span>
      )}
      {Math.round(percentage)}%
    </Badge>
  );
};

EfficiencyBadge.displayName = 'EfficiencyBadge';

// Shift badge
export interface ShiftBadgeProps {
  shift: 'day' | 'night' | 'swing';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ShiftBadge: React.FC<ShiftBadgeProps> = ({
  shift,
  size = 'md',
  className = ''
}) => {
  const shiftConfig = {
    day: {
      label: 'Day',
      icon: '☀'
    },
    night: {
      label: 'Night',
      icon: '☽'
    },
    swing: {
      label: 'Swing',
      icon: '⟲'
    }
  };

  const config = shiftConfig[shift];

  return (
    <Badge variant="primary" size={size} className={className}>
      <span className="mr-1" aria-hidden="true">
        {config.icon}
      </span>
      {config.label}
    </Badge>
  );
};

ShiftBadge.displayName = 'ShiftBadge';