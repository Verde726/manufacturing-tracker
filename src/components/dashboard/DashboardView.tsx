// Manufacturing Production Tracker - Dashboard View Component
// Analytics and metrics dashboard

import React from 'react';
import { BarChart3, TrendingUp, Activity, Clock } from 'lucide-react';

export const DashboardView: React.FC = () => {
  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h1>
          <BarChart3 size={24} />
          Production Analytics Dashboard
        </h1>
        <p>Comprehensive production metrics and performance insights</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <TrendingUp size={20} />
            <h3>OEE Trends</h3>
          </div>
          <div className="card-content">
            <p>Overall Equipment Effectiveness tracking and trends will be displayed here.</p>
            <div className="placeholder-chart">
              <div className="chart-bar" style={{ height: '60%' }}></div>
              <div className="chart-bar" style={{ height: '80%' }}></div>
              <div className="chart-bar" style={{ height: '70%' }}></div>
              <div className="chart-bar" style={{ height: '90%' }}></div>
              <div className="chart-bar" style={{ height: '85%' }}></div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <Activity size={20} />
            <h3>FPY Analysis</h3>
          </div>
          <div className="card-content">
            <p>First Pass Yield metrics and quality analysis will be shown here.</p>
            <div className="placeholder-metrics">
              <div className="metric">
                <span className="metric-label">Current FPY:</span>
                <span className="metric-value success">96.5%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Target FPY:</span>
                <span className="metric-value">95.0%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <Clock size={20} />
            <h3>Performance by Shift</h3>
          </div>
          <div className="card-content">
            <p>Shift-based performance comparison and analysis.</p>
            <div className="shift-performance">
              <div className="shift-item">
                <span className="shift-name">Day Shift</span>
                <span className="shift-metric">87% Efficiency</span>
              </div>
              <div className="shift-item">
                <span className="shift-name">Night Shift</span>
                <span className="shift-metric">82% Efficiency</span>
              </div>
              <div className="shift-item">
                <span className="shift-name">Swing Shift</span>
                <span className="shift-metric">85% Efficiency</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="coming-soon">
        <h2>🚧 Advanced Analytics Coming Soon</h2>
        <p>
          This dashboard will include comprehensive OEE calculations, FPY tracking, 
          bottleneck analysis, and real-time Andon alerts. Features are being 
          implemented according to ISA-95 manufacturing standards.
        </p>
      </div>
    </div>
  );
};