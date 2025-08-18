// Manufacturing Production Tracker - Reports View Component
// Comprehensive reporting and analytics

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  Users, 
  Package,
  TrendingUp,
  Clock,
  Filter
} from 'lucide-react';
import { useProductionStore } from '../../stores/productionStore';

type ReportType = 'daily' | 'employee' | 'batch' | 'efficiency' | 'oee' | 'quality';

export const ReportsView: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('daily');
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const { 
    getCompletionsToday 
  } = useProductionStore();

  const reportTypes = [
    {
      id: 'daily' as ReportType,
      title: 'Daily Production',
      description: 'Daily production summary with KPIs',
      icon: Calendar
    },
    {
      id: 'employee' as ReportType,
      title: 'Employee Performance',
      description: 'Individual employee metrics and trends',
      icon: Users
    },
    {
      id: 'batch' as ReportType,
      title: 'Batch Report',
      description: 'Batch progress and completion analysis',
      icon: Package
    },
    {
      id: 'efficiency' as ReportType,
      title: 'Efficiency Analysis',
      description: 'Efficiency trends and bottleneck analysis',
      icon: TrendingUp
    },
    {
      id: 'oee' as ReportType,
      title: 'OEE Report',
      description: 'Overall Equipment Effectiveness metrics',
      icon: BarChart3
    },
    {
      id: 'quality' as ReportType,
      title: 'Quality Report',
      description: 'First Pass Yield and quality metrics',
      icon: Clock
    }
  ];

  const generateReport = () => {
    console.log(`Generating ${selectedReport} report from ${dateFrom} to ${dateTo}`);
    // TODO: Implement actual report generation
  };

  const exportReport = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting ${selectedReport} report as ${format}`);
    // TODO: Implement export functionality
  };

  const getTodaysStats = () => {
    const todaysCompletions = getCompletionsToday();
    const totalUnits = todaysCompletions.reduce((sum, c) => sum + c.quantity, 0);
    const totalHours = todaysCompletions.reduce((sum, c) => sum + (c.duration / (1000 * 60 * 60)), 0);
    const avgEfficiency = todaysCompletions.length > 0 
      ? todaysCompletions.reduce((sum, c) => sum + c.efficiency, 0) / todaysCompletions.length 
      : 0;
    
    return { totalUnits, totalHours, avgEfficiency, completions: todaysCompletions.length };
  };

  const stats = getTodaysStats();

  return (
    <div className="reports-view">
      <div className="reports-header">
        <h1>
          <FileText size={24} />
          Production Reports & Analytics
        </h1>
        <p>Generate comprehensive reports and export production data</p>
      </div>

      <div className="reports-layout">
        {/* Report Selection */}
        <div className="report-selector">
          <h2>
            <Filter size={20} />
            Select Report Type
          </h2>
          
          <div className="report-types">
            {reportTypes.map((reportType) => {
              const IconComponent = reportType.icon;
              return (
                <button
                  key={reportType.id}
                  className={`report-type-card ${selectedReport === reportType.id ? 'selected' : ''}`}
                  onClick={() => setSelectedReport(reportType.id)}
                >
                  <div className="report-type-icon">
                    <IconComponent size={24} />
                  </div>
                  <div className="report-type-content">
                    <h3>{reportType.title}</h3>
                    <p>{reportType.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Configuration */}
        <div className="report-config">
          <h2>Report Configuration</h2>
          
          <div className="config-form">
            <div className="form-group">
              <label htmlFor="dateFrom">
                <Calendar size={16} />
                From Date
              </label>
              <input
                type="date"
                id="dateFrom"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dateTo">
                <Calendar size={16} />
                To Date
              </label>
              <input
                type="date"
                id="dateTo"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            
            <div className="report-actions">
              <button 
                className="btn btn-primary"
                onClick={generateReport}
              >
                <BarChart3 size={16} />
                Generate Report
              </button>
              
              <div className="export-options">
                <button 
                  className="btn btn-secondary"
                  onClick={() => exportReport('csv')}
                >
                  <Download size={16} />
                  CSV
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => exportReport('excel')}
                >
                  <Download size={16} />
                  Excel
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => exportReport('pdf')}
                >
                  <Download size={16} />
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <h2>Today's Quick Stats</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Package size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalUnits.toLocaleString()}</div>
                <div className="stat-label">Total Units</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Clock size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalHours.toFixed(1)}h</div>
                <div className="stat-label">Production Hours</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{Math.round(stats.avgEfficiency)}%</div>
                <div className="stat-label">Avg Efficiency</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FileText size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.completions}</div>
                <div className="stat-label">Completions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Report Preview */}
        <div className="report-preview">
          <h2>Report Preview</h2>
          
          <div className="preview-content">
            <div className="preview-header">
              <h3>{reportTypes.find(r => r.id === selectedReport)?.title} Report</h3>
              <span className="preview-date">
                {dateFrom === dateTo ? dateFrom : `${dateFrom} to ${dateTo}`}
              </span>
            </div>
            
            <div className="preview-table">
              <table>
                <thead>
                  <tr>
                    {selectedReport === 'daily' && (
                      <>
                        <th>Date</th>
                        <th>Total Units</th>
                        <th>Hours</th>
                        <th>Efficiency</th>
                        <th>Completions</th>
                      </>
                    )}
                    {selectedReport === 'employee' && (
                      <>
                        <th>Employee</th>
                        <th>Units</th>
                        <th>Hours</th>
                        <th>Efficiency</th>
                        <th>Tasks</th>
                      </>
                    )}
                    {selectedReport === 'batch' && (
                      <>
                        <th>Batch</th>
                        <th>Product</th>
                        <th>Progress</th>
                        <th>Status</th>
                        <th>Created</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="preview-placeholder">
                      Preview data will appear here after generating the report
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};