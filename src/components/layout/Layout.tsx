// Manufacturing Production Tracker - Main Layout Component
// Provides the main application shell with navigation and status bar

import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { AlertPanel } from '../ui/AlertPanel';
import { SyncIndicator } from '../ui/SyncIndicator';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { focusMode } = useAppStore();

  return (
    <div className={`manufacturing-layout ${focusMode ? 'focus-mode' : ''}`}>
      {/* Header with navigation and status */}
      <Header />
      
      {/* Status bar for key metrics */}
      <StatusBar />
      
      {/* Main content area */}
      <div className="layout-body">
        {/* Sidebar navigation - hidden in focus mode */}
        {!focusMode && <Sidebar />}
        
        {/* Main content */}
        <main className="main-content">
          <div className="content-wrapper">
            {children}
          </div>
          
          {/* Sync indicator - shows when sync is pending */}
          <SyncIndicator />
          
          {/* Alert panel for notifications */}
          <AlertPanel />
        </main>
      </div>
    </div>
  );
};