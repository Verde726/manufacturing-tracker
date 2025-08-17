// Manufacturing Production Tracker - Sync Indicator Component
// Shows sync status and pending operations

import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export const SyncIndicator: React.FC = () => {
  const { isOnline, syncPending } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Simulate sync operations
  useEffect(() => {
    if (syncPending > 0 && isOnline) {
      setSyncStatus('syncing');
      
      // Simulate sync completion after 2-5 seconds
      const timeout = setTimeout(() => {
        setSyncStatus('success');
        setLastSyncTime(new Date());
        
        // Reset to idle after showing success
        setTimeout(() => {
          setSyncStatus('idle');
        }, 2000);
      }, Math.random() * 3000 + 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [syncPending, isOnline]);

  const getSyncIcon = () => {
    if (!isOnline) {
      return <WifiOff size={16} className="text-warning" />;
    }
    
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw size={16} className="text-info animate-spin" />;
      case 'success':
        return <CheckCircle size={16} className="text-success" />;
      case 'error':
        return <AlertCircle size={16} className="text-error" />;
      default:
        return <Wifi size={16} className="text-success" />;
    }
  };

  const getSyncText = () => {
    if (!isOnline) {
      return 'Offline';
    }
    
    switch (syncStatus) {
      case 'syncing':
        return `Syncing ${syncPending} items...`;
      case 'success':
        return 'Sync complete';
      case 'error':
        return 'Sync failed';
      default:
        return syncPending > 0 ? `${syncPending} pending` : 'Up to date';
    }
  };

  const shouldShow = !isOnline || syncPending > 0 || syncStatus !== 'idle';

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={`sync-indicator ${syncStatus} ${isExpanded ? 'expanded' : ''}`}>
      <div 
        className="sync-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="sync-icon">
          {getSyncIcon()}
        </div>
        
        <span className="sync-text">
          {getSyncText()}
        </span>
        
        {syncPending > 0 && (
          <button className="sync-expand">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        )}
      </div>

      {isExpanded && syncPending > 0 && (
        <div className="sync-details">
          <div className="sync-queue">
            <h4>Pending Operations</h4>
            <div className="queue-items">
              {/* Simulated pending operations */}
              {Array.from({ length: Math.min(5, syncPending) }, (_, i) => (
                <div key={i} className="queue-item">
                  <Clock size={12} />
                  <span>Production entry #{i + 1}</span>
                  <span className="queue-time">
                    {new Date(Date.now() - (i * 30000)).toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
              
              {syncPending > 5 && (
                <div className="queue-item more">
                  <span>... and {syncPending - 5} more items</span>
                </div>
              )}
            </div>
          </div>
          
          {lastSyncTime && (
            <div className="last-sync">
              <span>Last sync: {lastSyncTime.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          )}
          
          {!isOnline && (
            <div className="offline-notice">
              <AlertCircle size={14} />
              <span>Changes will sync when connection is restored</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};