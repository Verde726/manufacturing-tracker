// Manufacturing Production Tracker - Daily Summary View Component
// Comprehensive daily summary with employee breakdown and export functionality

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Users, 
  Clock, 
  Target, 
  Package,
  Trash2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useProductionStore } from '../../stores/productionStore';

export const DailySummaryView: React.FC = () => {
  const [showEndOfDayConfirm, setShowEndOfDayConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const {
    getCompletionsToday,
    getActiveEmployees,
    archiveTodaysData
  } = useProductionStore();

  const todaysCompletions = getCompletionsToday();
  const employees = getActiveEmployees();

  // Calculate daily summary by employee
  const employeeSummary = employees.map(employee => {
    const employeeCompletions = todaysCompletions.filter(c => c.employeeId === employee.id);
    const totalHours = employeeCompletions.reduce((sum, c) => sum + (c.duration / (1000 * 60 * 60)), 0);
    const totalUnits = employeeCompletions.reduce((sum, c) => sum + c.quantity, 0);
    const avgEfficiency = employeeCompletions.length > 0 
      ? employeeCompletions.reduce((sum, c) => sum + c.efficiency, 0) / employeeCompletions.length 
      : 0;
    
    return {
      employee: employee.name,
      hours: totalHours,
      units: totalUnits,
      efficiency: avgEfficiency,
      entries: employeeCompletions.length
    };
  }).filter(summary => summary.entries > 0); // Only show employees with entries

  // Calculate daily totals
  const dailyTotals = {
    totalHours: employeeSummary.reduce((sum, emp) => sum + emp.hours, 0),
    totalUnits: employeeSummary.reduce((sum, emp) => sum + emp.units, 0),
    avgEfficiency: employeeSummary.length > 0 
      ? employeeSummary.reduce((sum, emp) => sum + emp.efficiency, 0) / employeeSummary.length 
      : 0,
    totalEntries: employeeSummary.reduce((sum, emp) => sum + emp.entries, 0)
  };

  // Export to CSV
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Create CSV content
      const headers = ['Employee', 'Hours Worked', 'Units Produced', 'Efficiency %', 'Entries'];
      const rows = employeeSummary.map(emp => [
        emp.employee,
        emp.hours.toFixed(2),
        emp.units.toString(),
        emp.efficiency.toFixed(1),
        emp.entries.toString()
      ]);
      
      // Add totals row
      rows.push([
        'DAILY TOTALS',
        dailyTotals.totalHours.toFixed(2),
        dailyTotals.totalUnits.toString(),
        dailyTotals.avgEfficiency.toFixed(1),
        dailyTotals.totalEntries.toString()
      ]);
      
      const csvContent = [
        `Daily Production Summary - ${today}`,
        '',
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `daily-summary-${today}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('✅ Daily summary exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('❌ Failed to export summary. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // End of Day - Archive data
  const handleEndOfDay = async () => {
    setIsArchiving(true);
    try {
      await archiveTodaysData();
      setShowEndOfDayConfirm(false);
      alert('✅ End of day processing complete! Today\'s data has been archived.');
    } catch (error) {
      console.error('End of day failed:', error);
      alert('❌ Failed to process end of day. Please try again.');
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="daily-summary-view">
      <div className="summary-header">
        <div className="summary-title">
          <FileText size={24} />
          <h2>Daily Production Summary</h2>
          <span className="summary-date">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="summary-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleExportCSV}
            disabled={isExporting || employeeSummary.length === 0}
          >
            <Download size={16} />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button 
            className="btn btn-warning"
            onClick={() => setShowEndOfDayConfirm(true)}
            disabled={isArchiving || employeeSummary.length === 0}
          >
            <Trash2 size={16} />
            End of Day
          </button>
        </div>
      </div>

      {/* Daily Totals Cards */}
      <div className="daily-totals-cards">
        <div className="total-card">
          <div className="total-icon">
            <Users size={20} />
          </div>
          <div className="total-content">
            <div className="total-value">{employeeSummary.length}</div>
            <div className="total-label">Active Workers</div>
          </div>
        </div>
        
        <div className="total-card">
          <div className="total-icon">
            <Clock size={20} />
          </div>
          <div className="total-content">
            <div className="total-value">{dailyTotals.totalHours.toFixed(1)}h</div>
            <div className="total-label">Total Hours</div>
          </div>
        </div>
        
        <div className="total-card">
          <div className="total-icon">
            <Package size={20} />
          </div>
          <div className="total-content">
            <div className="total-value">{dailyTotals.totalUnits.toLocaleString()}</div>
            <div className="total-label">Units Produced</div>
          </div>
        </div>
        
        <div className="total-card">
          <div className="total-icon">
            <Target size={20} />
          </div>
          <div className="total-content">
            <div className="total-value">{dailyTotals.avgEfficiency.toFixed(1)}%</div>
            <div className="total-label">Avg Efficiency</div>
          </div>
        </div>
      </div>

      {/* Employee Summary Table */}
      {employeeSummary.length > 0 ? (
        <div className="summary-table">
          <h3>Employee Breakdown</h3>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Hours</th>
                <th>Units</th>
                <th>Efficiency</th>
                <th>Entries</th>
                <th>Avg UPH</th>
              </tr>
            </thead>
            <tbody>
              {employeeSummary.map((emp, index) => {
                const uph = emp.hours > 0 ? emp.units / emp.hours : 0;
                const efficiencyClass = emp.efficiency >= 100 ? 'excellent' : 
                                       emp.efficiency >= 80 ? 'good' : 
                                       emp.efficiency >= 60 ? 'fair' : 'poor';
                
                return (
                  <tr key={index}>
                    <td className="employee-name">{emp.employee}</td>
                    <td className="hours">{emp.hours.toFixed(1)}</td>
                    <td className="units">{emp.units.toLocaleString()}</td>
                    <td className={`efficiency ${efficiencyClass}`}>
                      {emp.efficiency.toFixed(1)}%
                    </td>
                    <td className="entries">{emp.entries}</td>
                    <td className="uph">{uph.toFixed(0)}</td>
                  </tr>
                );
              })}
              
              {/* Totals Row */}
              <tr className="totals-row">
                <td><strong>DAILY TOTALS</strong></td>
                <td><strong>{dailyTotals.totalHours.toFixed(1)}</strong></td>
                <td><strong>{dailyTotals.totalUnits.toLocaleString()}</strong></td>
                <td><strong>{dailyTotals.avgEfficiency.toFixed(1)}%</strong></td>
                <td><strong>{dailyTotals.totalEntries}</strong></td>
                <td><strong>{(dailyTotals.totalHours > 0 ? dailyTotals.totalUnits / dailyTotals.totalHours : 0).toFixed(0)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">
          <AlertTriangle size={48} />
          <h3>No Production Data</h3>
          <p>No production entries recorded for today. Start by adding production entries above.</p>
        </div>
      )}

      {/* End of Day Confirmation Modal */}
      {showEndOfDayConfirm && (
        <div className="modal-overlay" onClick={() => setShowEndOfDayConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Trash2 size={20} />
                End of Day Processing
              </h3>
            </div>
            
            <div className="modal-body">
              <div className="warning-message">
                <AlertTriangle size={24} />
                <div>
                  <h4>Archive Today's Data?</h4>
                  <p>
                    This will move all of today's production data to the archive and clear 
                    the current workspace for tomorrow's operations.
                  </p>
                  <p><strong>This action cannot be undone.</strong></p>
                </div>
              </div>
              
              <div className="summary-stats">
                <h4>Today's Summary:</h4>
                <ul>
                  <li>{employeeSummary.length} workers with recorded production</li>
                  <li>{dailyTotals.totalEntries} total production entries</li>
                  <li>{dailyTotals.totalUnits.toLocaleString()} units produced</li>
                  <li>{dailyTotals.totalHours.toFixed(1)} hours worked</li>
                </ul>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowEndOfDayConfirm(false)}
                disabled={isArchiving}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-warning"
                onClick={handleEndOfDay}
                disabled={isArchiving}
              >
                <CheckCircle size={16} />
                {isArchiving ? 'Processing...' : 'Archive Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};