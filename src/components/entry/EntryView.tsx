// Manufacturing Production Tracker - Entry View Component
// Main clock in/out interface and active session management

import React from 'react';
import { ClockInForm } from './ClockInForm';
import { ProductionEntryForm } from './ProductionEntryForm';
import { DailySummaryView } from './DailySummaryView';
import { ActiveSessions } from './ActiveSessions';
import { TodaysProduction } from './TodaysProduction';
import { KPICards } from './KPICards';
import { QuickActions } from './QuickActions';

export const EntryView: React.FC = () => {
  return (
    <div className="entry-view">
      <div className="entry-layout">
        {/* Left Column - Main Entry Interface */}
        <div className="entry-main">
          {/* Quick Actions Bar */}
          <QuickActions />
          
          {/* Clock In Form */}
          <div className="entry-section">
            <ClockInForm />
          </div>
          
          {/* Production Entry Form */}
          <div className="entry-section">
            <ProductionEntryForm />
          </div>
          
          {/* Active Sessions */}
          <div className="entry-section">
            <ActiveSessions />
          </div>
          
          {/* Daily Summary View */}
          <div className="entry-section">
            <DailySummaryView />
          </div>
          
          {/* Today's Production Log */}
          <div className="entry-section">
            <TodaysProduction />
          </div>
        </div>
        
        {/* Right Column - KPIs and Quick Info */}
        <div className="entry-sidebar">
          {/* Live KPI Cards */}
          <div className="entry-section">
            <KPICards />
          </div>
          
          {/* Additional widgets would go here */}
        </div>
      </div>
    </div>
  );
};