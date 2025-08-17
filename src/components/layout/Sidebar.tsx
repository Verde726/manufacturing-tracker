// Manufacturing Production Tracker - Sidebar Component
// Quick navigation and shortcuts panel

import React from 'react';
import { 
  Clock, 
  Play, 
  BarChart3, 
  Package, 
  Download,
  Upload,
  Settings
} from 'lucide-react';
import { useProductionStore } from '../../stores/productionStore';
import { useAppStore } from '../../stores/appStore';

export const Sidebar: React.FC = () => {
  const { 
    getActiveSessions, 
    getCompletionsToday 
  } = useProductionStore();
  
  const { setCurrentTab } = useAppStore();
  
  const activeSessions = getActiveSessions();
  const todaysCompletions = getCompletionsToday();

  const quickActions = [
    {
      id: 'clock-in',
      label: 'Quick Clock In',
      icon: Play,
      action: () => setCurrentTab('entry'),
      className: 'action-primary'
    },
    {
      id: 'view-dashboard',
      label: 'View Dashboard',
      icon: BarChart3,
      action: () => setCurrentTab('dashboard'),
      className: 'action-secondary'
    },
    {
      id: 'manage-batches',
      label: 'Manage Batches',
      icon: Package,
      action: () => setCurrentTab('batches'),
      className: 'action-secondary'
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Quick Actions</h3>
        <div className="quick-actions">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.id}
                className={`quick-action ${action.className}`}
                onClick={action.action}
                title={action.label}
              >
                <IconComponent size={20} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Active Sessions</h3>
        <div className="session-list">
          {activeSessions.length === 0 ? (
            <div className="empty-state">
              <Clock size={24} />
              <span>No active sessions</span>
            </div>
          ) : (
            activeSessions.slice(0, 3).map((session) => (
              <div key={session.id} className="session-item">
                <div className="session-header">
                  <span className="session-employee">{session.employeeId}</span>
                  <span className="session-status active">Active</span>
                </div>
                <div className="session-details">
                  <span className="session-task">{session.taskId}</span>
                  <span className="session-time">
                    {new Date(session.startTime).toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          
          {activeSessions.length > 3 && (
            <button 
              className="view-more"
              onClick={() => setCurrentTab('entry')}
            >
              View {activeSessions.length - 3} more...
            </button>
          )}
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Today's Summary</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Completions</span>
            <span className="stat-value">{todaysCompletions.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Units</span>
            <span className="stat-value">
              {todaysCompletions.reduce((sum, c) => sum + c.quantity, 0).toLocaleString()}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Efficiency</span>
            <span className="stat-value">
              {todaysCompletions.length > 0 
                ? Math.round(todaysCompletions.reduce((sum, c) => sum + c.efficiency, 0) / todaysCompletions.length)
                : 0}%
            </span>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Tools</h3>
        <div className="tool-actions">
          <button className="tool-action" title="Export Data">
            <Download size={16} />
            <span>Export</span>
          </button>
          <button className="tool-action" title="Import Data">
            <Upload size={16} />
            <span>Import</span>
          </button>
          <button 
            className="tool-action" 
            title="Settings"
            onClick={() => setCurrentTab('admin')}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
};