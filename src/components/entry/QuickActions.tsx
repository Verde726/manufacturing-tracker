// Manufacturing Production Tracker - Quick Actions Component
// Quick action buttons for common tasks

import React from 'react';
import { Download, Upload, RotateCcw, Focus, Users, Package } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useProductionStore } from '../../stores/productionStore';

export const QuickActions: React.FC = () => {
  const { focusMode, setFocusMode, setCurrentTab } = useAppStore();
  const { refreshAll } = useProductionStore();

  const handleExportToday = () => {
    // TODO: Implement CSV export
    console.log('Export today\'s data');
  };

  const handleImportCSV = () => {
    // TODO: Implement CSV import
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Import CSV file:', file.name);
        // TODO: Process CSV import
      }
    };
    input.click();
  };

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

  const quickActions = [
    {
      id: 'export',
      label: 'Export Today',
      icon: Download,
      action: handleExportToday,
      className: 'action-secondary'
    },
    {
      id: 'import',
      label: 'Import CSV',
      icon: Upload,
      action: handleImportCSV,
      className: 'action-secondary'
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
            >
              <IconComponent size={18} />
              <span className="action-label">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};