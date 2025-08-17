// Manufacturing Production Tracker - Alert Panel Component
// Displays system alerts and notifications

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle, 
  X, 
  Bell, 
  BellOff 
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  dismissed?: boolean;
  persistent?: boolean;
}

export const AlertPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Sample alerts for demonstration
  useEffect(() => {
    const sampleAlerts: Alert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Low Efficiency Detected',
        message: 'Employee John D. completed last task at 65% efficiency',
        timestamp: new Date().toISOString(),
        persistent: false
      },
      {
        id: '2',
        type: 'info',
        title: 'Batch Nearly Complete',
        message: 'Batch B-2024-001 is 95% complete (950/1000 units)',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        persistent: false
      }
    ];
    
    setAlerts(sampleAlerts);
  }, []);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const dismissAll = () => {
    setAlerts(prev => prev.filter(alert => alert.persistent));
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'info':
        return <Info size={16} />;
      case 'success':
        return <CheckCircle size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      case 'error':
        return <XCircle size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  const visibleAlerts = alerts.filter(alert => !alert.dismissed);
  
  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className={`alert-panel ${isMinimized ? 'minimized' : ''}`}>
      <div className="alert-header">
        <div className="alert-title">
          <Bell size={16} />
          <span>Alerts ({visibleAlerts.length})</span>
        </div>
        <div className="alert-actions">
          {visibleAlerts.length > 1 && (
            <button 
              className="btn btn-ghost small"
              onClick={dismissAll}
              title="Dismiss All"
            >
              Clear All
            </button>
          )}
          <button 
            className="btn btn-ghost small"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Bell size={14} /> : <BellOff size={14} />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="alert-list">
          {visibleAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`alert-item ${alert.type}`}
            >
              <div className="alert-icon">
                {getAlertIcon(alert.type)}
              </div>
              
              <div className="alert-content">
                <div className="alert-item-header">
                  <h4 className="alert-item-title">{alert.title}</h4>
                  <span className="alert-timestamp">
                    {new Date(alert.timestamp).toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="alert-item-message">{alert.message}</p>
              </div>
              
              {!alert.persistent && (
                <button 
                  className="alert-dismiss"
                  onClick={() => dismissAlert(alert.id)}
                  title="Dismiss"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};