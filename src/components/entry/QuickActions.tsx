// Manufacturing Production Tracker - Quick Actions Component
// Quick action buttons for common tasks

import React, { useState } from 'react';
import { RotateCcw, Focus, Users, Package, LogOut } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useProductionStore } from '../../stores/productionStore';

export const QuickActions: React.FC = () => {
  const { focusMode, setFocusMode, setCurrentTab } = useAppStore();
  const { refreshAll, getActiveSessions, endSession } = useProductionStore();
  const [isClockingOutAll, setIsClockingOutAll] = useState(false);
  
  const activeSessions = getActiveSessions();


  const handleRefresh = async () => {
    try {
      await refreshAll();
      console.log('Data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  // Clock out all active sessions
  const handleClockOutAll = async () => {
    if (activeSessions.length === 0) {
      alert('No active sessions to clock out.');
      return;
    }
    
    const confirmed = window.confirm(
      `Clock out all ${activeSessions.length} active sessions? This will end all current work sessions.`
    );
    
    if (confirmed) {
      setIsClockingOutAll(true);
      try {
        // Clock out all active sessions
        for (const session of activeSessions) {
          await endSession(session.id, 'End of day clock out');
        }
        alert(`Successfully clocked out ${activeSessions.length} sessions.`);
        await refreshAll(); // Refresh data to update UI
      } catch (error) {
        console.error('Failed to clock out all sessions:', error);
        alert('Failed to clock out some sessions. Please try again.');
      } finally {
        setIsClockingOutAll(false);
      }
    }
  };

  const quickActions = [
    {
      id: 'clockoutall',
      label: `Clock Out All (${activeSessions.length})`,
      icon: LogOut,
      action: handleClockOutAll,
      className: activeSessions.length > 0 ? 'action-warning' : 'action-disabled',
      disabled: activeSessions.length === 0 || isClockingOutAll
    },
    {
      id: 'refresh',
      label: 'Refresh Data',
      icon: RotateCcw,
      action: handleRefresh,
      className: 'action-secondary'
    },
    {
      id: 'focus',
      label: focusMode ? 'Exit Focus' : 'Focus Mode',
      icon: Focus,
      action: toggleFocusMode,
      className: focusMode ? 'action-warning' : 'action-ghost'
    },
    {
      id: 'employees',
      label: 'Manage Staff',
      icon: Users,
      action: () => setCurrentTab('admin'),
      className: 'action-ghost'
    },
    {
      id: 'batches',
      label: 'View Batches',
      icon: Package,
      action: () => setCurrentTab('batches'),
      className: 'action-ghost'
    }
  ];

  return (
    <div className="quick-actions">
      <div className="quick-actions-header">
        <h3>Quick Actions</h3>
      </div>
      
      <div className="actions-grid">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              className={`quick-action ${action.className}`}
              onClick={action.action}
              title={action.label}
              disabled={action.disabled}
            >
              <IconComponent size={18} />
              <span className="action-label">
                {action.id === 'clockoutall' && isClockingOutAll ? 'Clocking Out...' : action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};