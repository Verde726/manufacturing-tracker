// Manufacturing Production Tracker - Card Component
// Flexible card container with header, content, and footer areas

import React from 'react';
import type { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  elevated = false
}) => {
  const baseClasses = [
    'bg-surface',
    'border',
    'border-border',
    'rounded-xl',
    'transition-shadow'
  ];

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6'
  };

  const shadowClasses = elevated 
    ? ['shadow-lg', 'hover:shadow-xl']
    : ['shadow-card'];

  const classes = [
    ...baseClasses,
    ...shadowClasses,
    paddingClasses[padding],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  actions
}) => {
  const classes = [
    'flex',
    'items-center',
    'justify-between',
    'mb-4',
    'pb-3',
    'border-b',
    'border-border',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="flex-1 min-w-0">
        {children}
      </div>
      {actions && (
        <div className="flex items-center gap-2 ml-4">
          {actions}
        </div>
      )}
    </div>
  );
};

CardHeader.displayName = 'CardHeader';

// Card Title
export interface CardTitleProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
  size = 'md',
  icon
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const classes = [
    'flex',
    'items-center',
    'gap-2',
    'font-semibold',
    'text-text',
    'tracking-tight',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <h3 className={classes}>
      {icon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </h3>
  );
};

CardTitle.displayName = 'CardTitle';

// Card Description
export interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = ''
}) => {
  const classes = [
    'text-text-muted',
    'text-sm',
    'mt-1',
    className
  ].filter(Boolean).join(' ');

  return (
    <p className={classes}>
      {children}
    </p>
  );
};

CardDescription.displayName = 'CardDescription';

// Card Content
export interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = ''
}) => {
  const classes = [
    'text-text',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

CardContent.displayName = 'CardContent';

// Card Footer
export interface CardFooterProps {
  children: ReactNode;
  className?: string;
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  justify = 'end'
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  };

  const classes = [
    'flex',
    'items-center',
    'gap-3',
    'pt-4',
    'mt-4',
    'border-t',
    'border-border',
    justifyClasses[justify],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

CardFooter.displayName = 'CardFooter';

// Metric Card for KPIs
export interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  trend,
  trendValue,
  icon,
  className = ''
}) => {
  const trendIcons = {
    up: (
      <svg className="w-4 h-4 text-success" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ),
    down: (
      <svg className="w-4 h-4 text-danger" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
    neutral: (
      <svg className="w-4 h-4 text-text-muted" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    )
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-danger',
    neutral: 'text-text-muted'
  };

  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon && (
              <span className="text-text-muted" aria-hidden="true">
                {icon}
              </span>
            )}
            <p className="text-sm font-medium text-text-muted uppercase tracking-wide">
              {title}
            </p>
          </div>
          
          <p className="text-3xl font-bold text-text leading-tight">
            {value}
          </p>
          
          {description && (
            <p className="text-sm text-text-muted mt-1">
              {description}
            </p>
          )}
          
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trendColors[trend]}`}>
              {trendIcons[trend]}
              <span className="font-medium">{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

MetricCard.displayName = 'MetricCard';

// Empty State Card
export interface EmptyStateCardProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  title,
  description,
  action,
  icon,
  className = ''
}) => {
  return (
    <Card className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="flex justify-center mb-4 text-text-muted">
          {icon}
        </div>
      )}
      
      <CardTitle size="lg" className="justify-center mb-2">
        {title}
      </CardTitle>
      
      <CardDescription className="max-w-md mx-auto mb-6">
        {description}
      </CardDescription>
      
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </Card>
  );
};

EmptyStateCard.displayName = 'EmptyStateCard';