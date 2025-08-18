// Manufacturing Production Tracker - Today's Production Component
// Table showing today's completed production entries

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  User, 
  Package, 
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  X,
  Trash2
} from 'lucide-react';
import { useProductionStore } from '../../stores/productionStore';

export const TodaysProduction: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'high_eff' | 'low_eff'>('all');

  const {
    getCompletionsToday,
    employees,
    tasks,
    products,
    batches,
    deleteCompletion
  } = useProductionStore();

  const completions = getCompletionsToday();

  // Filter completions based on search and status
  const filteredCompletions = completions.filter(completion => {
    const employee = employees.find(e => e.id === completion.employeeId);
    const task = tasks.find(t => t.id === completion.taskId);
    const product = products.find(p => p.id === completion.productId);
    const batch = batches.find(b => b.id === completion.batchId);

    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      employee?.name.toLowerCase().includes(searchLower) ||
      task?.name.toLowerCase().includes(searchLower) ||
      product?.name.toLowerCase().includes(searchLower) ||
      batch?.name.toLowerCase().includes(searchLower);

    // Status filter
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'high_eff' && completion.efficiency >= 100) ||
      (statusFilter === 'low_eff' && completion.efficiency < 80);

    return matchesSearch && matchesStatus;
  });

  const getEfficiencyClass = (efficiency: number) => {
    if (efficiency >= 100) return 'excellent';
    if (efficiency >= 80) return 'good';
    if (efficiency >= 60) return 'fair';
    return 'poor';
  };

  const getCompletionDetails = (completion: any) => {
    const employee = employees.find(e => e.id === completion.employeeId);
    const task = tasks.find(t => t.id === completion.taskId);
    const product = products.find(p => p.id === completion.productId);
    const batch = batches.find(b => b.id === completion.batchId);
    
    return { employee, task, product, batch };
  };

  const formatDuration = (durationMs: number) => {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleDeleteEntry = async (completion: any) => {
    const { employee, task, product } = getCompletionDetails(completion);
    
    const confirmMessage = `Are you sure you want to delete this production entry?

Employee: ${employee?.name || 'Unknown'}
Task: ${task?.name || 'Unknown'} 
Product: ${product?.name || 'Unknown'}
Quantity: ${completion.quantity} units
Time: ${new Date(completion.startTime).toLocaleTimeString()} - ${new Date(completion.endTime).toLocaleTimeString()}

⚠️ This action cannot be undone and will update all daily totals.`;

    if (window.confirm(confirmMessage)) {
      try {
        await deleteCompletion(completion.id);
        // Success feedback will be shown by the automatic re-render
      } catch (error) {
        console.error('Failed to delete production entry:', error);
        alert('❌ Failed to delete production entry. Please try again.');
      }
    }
  };

  return (
    <div className="todays-production">
      <div className="section-header">
        <h2>
          <Clock size={20} />
          Today's Production
        </h2>
        <div className="production-count">
          {filteredCompletions.length} of {completions.length} entries
        </div>
      </div>

      {/* Filters */}
      <div className="production-filters">
        <div className="filter-group">
          <div className="search-input">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search employee, task, product, or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Entries</option>
            <option value="high_eff">High Efficiency (≥100%)</option>
            <option value="low_eff">Low Efficiency (&lt;80%)</option>
          </select>
        </div>
      </div>

      {/* Production Table */}
      {filteredCompletions.length === 0 ? (
        <div className="empty-state">
          {completions.length === 0 ? (
            <>
              <Clock size={48} />
              <h3>No Production Today</h3>
              <p>Clock in and complete sessions to see production data here</p>
            </>
          ) : (
            <>
              <Search size={48} />
              <h3>No Matching Entries</h3>
              <p>Try adjusting your search or filter criteria</p>
            </>
          )}
        </div>
      ) : (
        <div className="production-table-container">
          <table className="production-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Employee</th>
                <th>Product</th>
                <th>Task</th>
                <th>Batch</th>
                <th>Quantity</th>
                <th>Duration</th>
                <th>UPH</th>
                <th>Efficiency</th>
                <th>Quality</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompletions.map((completion) => {
                const { employee, task, product, batch } = getCompletionDetails(completion);
                const qualityRate = completion.quantity > 0 
                  ? (completion.goodUnits / completion.quantity) * 100 
                  : 100;

                return (
                  <tr key={completion.id} className="production-row">
                    <td className="time-cell">
                      <div className="time-range">
                        <div className="start-time">
                          {new Date(completion.startTime).toLocaleTimeString('en-US', {
                            hour12: false,
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="end-time">
                          {new Date(completion.endTime).toLocaleTimeString('en-US', {
                            hour12: false,
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </td>

                    <td className="employee-cell">
                      <User size={14} />
                      <span>{employee?.name || 'Unknown'}</span>
                    </td>

                    <td className="product-cell">
                      <Package size={14} />
                      <span>{product?.name || 'Unknown'}</span>
                    </td>

                    <td className="task-cell">
                      <TrendingUp size={14} />
                      <div className="task-info">
                        <span className="task-name">{task?.name || 'Unknown'}</span>
                        {task?.quota && (
                          <span className="task-quota">({task.quota}/hr)</span>
                        )}
                      </div>
                    </td>

                    <td className="batch-cell">
                      <span>{batch?.name || 'Unknown'}</span>
                    </td>

                    <td className="quantity-cell">
                      <div className="quantity-breakdown">
                        <span className="total-quantity">{completion.quantity}</span>
                        {(completion.scrapUnits > 0 || completion.reworkUnits > 0) && (
                          <div className="quality-breakdown">
                            <span className="good">{completion.goodUnits}g</span>
                            {completion.scrapUnits > 0 && (
                              <span className="scrap">{completion.scrapUnits}s</span>
                            )}
                            {completion.reworkUnits > 0 && (
                              <span className="rework">{completion.reworkUnits}r</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="duration-cell">
                      {formatDuration(completion.duration)}
                    </td>

                    <td className="uph-cell">
                      {Math.round(completion.uph)}
                    </td>

                    <td className="efficiency-cell">
                      <span className={`efficiency-badge ${getEfficiencyClass(completion.efficiency)}`}>
                        {completion.efficiency}%
                      </span>
                    </td>

                    <td className="quality-cell">
                      <div className="quality-indicator">
                        {qualityRate >= 95 ? (
                          <CheckCircle size={16} className="text-success" />
                        ) : (
                          <AlertTriangle size={16} className="text-warning" />
                        )}
                        <span className={qualityRate >= 95 ? 'text-success' : 'text-warning'}>
                          {qualityRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    <td className="actions-cell">
                      <button 
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteEntry(completion)}
                        title="Delete this production entry"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      {filteredCompletions.length > 0 && (
        <div className="production-summary">
          <div className="summary-stat">
            <span className="label">Total Units:</span>
            <span className="value">
              {filteredCompletions.reduce((sum, c) => sum + c.quantity, 0).toLocaleString()}
            </span>
          </div>
          <div className="summary-stat">
            <span className="label">Avg Efficiency:</span>
            <span className="value">
              {Math.round(
                filteredCompletions.reduce((sum, c) => sum + c.efficiency, 0) / 
                filteredCompletions.length
              )}%
            </span>
          </div>
          <div className="summary-stat">
            <span className="label">Total Time:</span>
            <span className="value">
              {formatDuration(
                filteredCompletions.reduce((sum, c) => sum + c.duration, 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};