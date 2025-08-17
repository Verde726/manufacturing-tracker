// Manufacturing Production Tracker - Loading Screen Component
// Full-screen loading indicator for app initialization

import React from 'react';
import { Activity, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  progress 
}) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-icon">
          <Activity size={48} />
          <Loader2 size={24} className="spinner" />
        </div>
        
        <h1 className="loading-title">Manufacturing Tracker</h1>
        
        <div className="loading-message">
          <span>{message}</span>
          {progress !== undefined && (
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
        
        <div className="loading-details">
          <span>Initializing offline-first production tracking...</span>
        </div>
      </div>
    </div>
  );
};