// Manufacturing Production Tracker - Header Component
// Top navigation and application branding

import React from 'react';
import { Activity, Settings, Package, BarChart3, FileText, Focus, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

const tabs = [
  { id: 'entry', label: 'Entry', icon: Activity, shortcut: '1' },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, shortcut: '2' },
  { id: 'batches', label: 'Batches', icon: Package, shortcut: '3' },
  { id: 'admin', label: 'Admin', icon: Settings, shortcut: '4' },
  { id: 'reports', label: 'Reports', icon: FileText, shortcut: '5' }
];

export const Header: React.FC = () => {
  const { 
    currentTab, 
    focusMode, 
    isOnline, 
    syncPending,
    setCurrentTab, 
    setFocusMode 
  } = useAppStore();

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  return (
    <header className="manufacturing-header">
      <div className="header-brand">
        <div className="brand-icon">
          <Activity size={24} />
        </div>
        <div className="brand-text">
          <h1>Manufacturing Tracker</h1>
          <span className="version">v1.0</span>
        </div>
      </div>

      <nav className="header-tabs">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <button
              key={tab.id}
              className={`tab-button ${isActive ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
              title={`${tab.label} (Alt+${tab.shortcut})`}
            >
              <IconComponent size={18} />
              <span className="tab-label">{tab.label}</span>
              <span className="tab-shortcut">{tab.shortcut}</span>
            </button>
          );
        })}
      </nav>

      <div className="header-status">
        {/* Online/Offline Status */}
        <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span className="status-text">
            {isOnline ? 'Online' : 'Offline'}
          </span>
          {syncPending > 0 && (
            <span className="sync-pending">({syncPending} pending)</span>
          )}
        </div>

        {/* Focus Mode Toggle */}
        <button
          className={`focus-toggle ${focusMode ? 'active' : ''}`}
          onClick={toggleFocusMode}
          title="Toggle Focus Mode (F)"
        >
          <Focus size={16} />
          <span>Focus</span>
        </button>
      </div>
    </header>
  );
};

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.altKey && !e.ctrlKey && !e.shiftKey) {
    const keyMap: { [key: string]: string } = {
      '1': 'entry',
      '2': 'dashboard', 
      '3': 'batches',
      '4': 'admin',
      '5': 'reports'
    };
    
    if (keyMap[e.key]) {
      e.preventDefault();
      useAppStore.getState().setCurrentTab(keyMap[e.key]);
    }
  }
  
  if (e.key === 'f' || e.key === 'F') {
    if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
      const activeElement = document.activeElement;
      if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        useAppStore.getState().setFocusMode(!useAppStore.getState().focusMode);
      }
    }
  }
});