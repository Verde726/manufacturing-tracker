// Manufacturing Production Tracker - Batches View Component
// Batch and lot tracking with genealogy

import React, { useState, useEffect } from 'react';
import { Package, Plus, Calendar, TrendingUp, X, Eye, Settings, User, Clock, CheckSquare } from 'lucide-react';
import { useProductionStore } from '../../stores/productionStore';
import type { Batch } from '../../types';

export const BatchesView: React.FC = () => {
  const { 
    getOpenBatches, 
    batches, 
    products,
    employees,
    sessions,
    completions,
    getBatchProgress,
    addBatch,
    updateBatch,
    loadBatches,
    loadProducts,
    loadEmployees,
    loadSessions,
    loadCompletions
  } = useProductionStore();

  // Modal state
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [showEditBatch, setShowEditBatch] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  // Form state
  const [batchForm, setBatchForm] = useState({
    name: '',
    productId: '',
    expectedUnits: 1000,
    notes: ''
  });
  
  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadBatches(),
          loadProducts(),
          loadEmployees(),
          loadSessions(),
          loadCompletions()
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    loadData();
  }, [loadBatches, loadProducts, loadEmployees, loadSessions, loadCompletions]);
  
  // Status update form
  const [statusForm, setStatusForm] = useState({
    status: '' as Batch['status'],
    notes: ''
  });
  
  // Edit batch form
  const [editForm, setEditForm] = useState({
    name: '',
    lotCode: '',
    expectedUnits: 1000,
    notes: ''
  });

  // Generate auto batch name
  const generateBatchName = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const batchCount = batches.filter(b => b.name.startsWith(dateStr)).length + 1;
    return `${dateStr}-${String(batchCount).padStart(3, '0')}`;
  };

  // Handle create batch
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBatch({
        name: batchForm.name || generateBatchName(),
        productId: batchForm.productId,
        expectedUnits: batchForm.expectedUnits,
        status: 'Open',
        genealogy: [],
        notes: batchForm.notes
      });
      setBatchForm({ name: '', productId: '', expectedUnits: 1000, notes: '' });
      setShowCreateBatch(false);
    } catch (error) {
      console.error('Failed to create batch:', error);
      alert('Failed to create batch. Please try again.');
    }
  };

  // Handle view batch details
  const handleViewDetails = (batch: Batch) => {
    setSelectedBatch(batch);
    setShowBatchDetails(true);
  };

  // Handle update status
  const handleUpdateStatus = (batch: Batch) => {
    setSelectedBatch(batch);
    setStatusForm({ status: batch.status, notes: '' });
    setShowUpdateStatus(true);
  };

  // Handle edit batch
  const handleEditBatch = (batch: Batch) => {
    console.log('Edit Batch clicked for:', batch.name);
    setSelectedBatch(batch);
    setEditForm({
      name: batch.name,
      lotCode: batch.lotCode || '',
      expectedUnits: batch.expectedUnits,
      notes: batch.notes || ''
    });
    setShowEditBatch(true);
    console.log('Edit modal should now be open:', true);
  };

  // Handle batch edit submission
  const handleBatchEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    
    try {
      const updates: Partial<Batch> = {
        name: editForm.name,
        lotCode: editForm.lotCode || undefined,
        expectedUnits: editForm.expectedUnits,
        notes: editForm.notes
      };
      
      await updateBatch(selectedBatch.id, updates);
      setShowEditBatch(false);
      setSelectedBatch(null);
      setEditForm({ name: '', lotCode: '', expectedUnits: 1000, notes: '' });
    } catch (error) {
      console.error('Failed to update batch:', error);
      alert('Failed to update batch. Please try again.');
    }
  };

  // Handle status update submission
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    
    try {
      const updates: Partial<Batch> = {
        status: statusForm.status,
        notes: selectedBatch.notes ? 
          `${selectedBatch.notes}\n\n[${new Date().toLocaleString()}] Status changed to ${statusForm.status}: ${statusForm.notes}` : 
          `[${new Date().toLocaleString()}] Status changed to ${statusForm.status}: ${statusForm.notes}`
      };
      
      if (statusForm.status === 'Closed' || statusForm.status === 'Completed') {
        updates.closed = new Date().toISOString();
      }
      
      await updateBatch(selectedBatch.id, updates);
      setShowUpdateStatus(false);
      setSelectedBatch(null);
      setStatusForm({ status: '' as Batch['status'], notes: '' });
    } catch (error) {
      console.error('Failed to update batch status:', error);
      alert('Failed to update batch status. Please try again.');
    }
  };

  // Get batch statistics
  const getBatchStats = (batch: Batch) => {
    const batchSessions = sessions.filter(s => s.batchId === batch.id);
    const batchCompletions = completions.filter(c => c.batchId === batch.id);
    const totalWorkers = new Set(batchSessions.map(s => s.employeeId)).size;
    const totalHours = batchCompletions.reduce((sum, c) => sum + (c.duration / (1000 * 60 * 60)), 0);
    const totalProduced = batchCompletions.reduce((sum, c) => sum + c.quantity, 0);
    const totalScrap = batchCompletions.reduce((sum, c) => sum + c.scrapUnits, 0);
    const totalRework = batchCompletions.reduce((sum, c) => sum + c.reworkUnits, 0);
    
    return {
      totalWorkers,
      totalHours,
      totalProduced,
      totalScrap,
      totalRework,
      firstPassYield: totalProduced > 0 ? ((totalProduced - totalRework) / totalProduced * 100) : 0,
      scrapRate: totalProduced > 0 ? (totalScrap / totalProduced * 100) : 0
    };
  };

  const openBatches = getOpenBatches();
  const recentBatches = batches
    .filter(b => b.status !== 'Open')
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 10); // Show recent 10 non-open batches

  return (
    <div className="batches-view">
      <div className="batches-header">
        <h1>
          <Package size={24} />
          Batch & Lot Management
        </h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateBatch(true)}
        >
          <Plus size={16} />
          Create New Batch
        </button>
      </div>

      <div className="batches-grid">
        {/* Open Batches */}
        <div className="batch-section">
          <h2>
            <Calendar size={20} />
            Open Batches ({openBatches.length})
          </h2>
          
          {openBatches.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <h3>No Open Batches</h3>
              <p>Create a new batch to start production tracking</p>
            </div>
          ) : (
            <div className="batch-cards">
              {openBatches.map((batch) => {
                const product = products.find(p => p.id === batch.productId);
                const progress = getBatchProgress(batch.id);
                
                return (
                  <div key={batch.id} className="batch-card">
                    <div className="batch-header">
                      <h3>{batch.name}</h3>
                      <span className={`batch-status ${batch.status.toLowerCase()}`}>
                        {batch.status}
                      </span>
                    </div>
                    
                    <div className="batch-details">
                      <div className="batch-product">
                        <Package size={14} />
                        <span>{product?.name || 'Unknown Product'}</span>
                      </div>
                      
                      <div className="batch-progress">
                        <div className="progress-info">
                          <span>{progress.produced} / {progress.expected} units</span>
                          <span className="progress-percent">{progress.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${Math.min(100, progress.percentage)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="batch-meta">
                        <span className="batch-created">
                          Created: {new Date(batch.created).toLocaleDateString()}
                        </span>
                        {batch.lotCode && (
                          <span className="batch-lot">Lot: {batch.lotCode}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="batch-actions">
                      <button 
                        className="btn btn-secondary small"
                        onClick={() => handleViewDetails(batch)}
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                      <button 
                        className="btn btn-outline small"
                        onClick={() => handleEditBatch(batch)}
                      >
                        <Settings size={14} />
                        Edit Batch
                      </button>
                      <button 
                        className="btn btn-primary small"
                        onClick={() => handleUpdateStatus(batch)}
                      >
                        <Settings size={14} />
                        Update Status
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Batches */}
        <div className="batch-section">
          <h2>
            <TrendingUp size={20} />
            Recent Batches ({recentBatches.length})
          </h2>
          
          {recentBatches.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <h3>No Recent Batches</h3>
              <p>Closed batches will appear here</p>
            </div>
          ) : (
            <div className="batch-table">
              <table>
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBatches.map((batch) => {
                  const product = products.find(p => p.id === batch.productId);
                  const progress = getBatchProgress(batch.id);
                  
                  return (
                    <tr key={batch.id}>
                      <td className="batch-name">{batch.name}</td>
                      <td className="product-name">{product?.name || 'Unknown'}</td>
                      <td>
                        <span className={`status-badge ${batch.status.toLowerCase()}`}>
                          {batch.status}
                        </span>
                      </td>
                      <td className="progress-cell">
                        <span>{progress.produced}/{progress.expected}</span>
                        <span className="progress-percent">({progress.percentage.toFixed(1)}%)</span>
                      </td>
                      <td className="created-date">
                        {new Date(batch.created).toLocaleDateString()}
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="btn btn-ghost small"
                          onClick={() => handleViewDetails(batch)}
                        >
                          <Eye size={12} />
                          View
                        </button>
                        <button 
                          className="btn btn-ghost small"
                          onClick={() => handleEditBatch(batch)}
                        >
                          <Settings size={12} />
                          Edit
                        </button>
                        <button 
                          className="btn btn-ghost small"
                          onClick={() => handleUpdateStatus(batch)}
                        >
                          <Settings size={12} />
                          Status
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      <div className="coming-soon">
        <h2>🚧 Advanced Batch Features Coming Soon</h2>
        <ul>
          <li>Batch genealogy tracking</li>
          <li>Material consumption tracking</li>
          <li>Quality hold and release workflows</li>
          <li>Batch splitting and merging</li>
          <li>Expiration date management</li>
          <li>Barcode integration for batch scanning</li>
        </ul>
      </div>

      {/* Create Batch Modal */}
      {showCreateBatch && (
        <div className="modal-overlay" onClick={() => setShowCreateBatch(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Batch</h3>
              <button 
                className="btn btn-ghost small"
                onClick={() => setShowCreateBatch(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateBatch}>
              <div className="form-group">
                <label htmlFor="batch-name">Batch Name (Optional)</label>
                <input
                  id="batch-name"
                  type="text"
                  value={batchForm.name}
                  onChange={(e) => setBatchForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={`Auto-generated: ${generateBatchName()}`}
                />
                <small>Leave blank to auto-generate: YYYYMMDD-001</small>
              </div>
              <div className="form-group">
                <label htmlFor="batch-product">Product *</label>
                <select
                  id="batch-product"
                  value={batchForm.productId}
                  onChange={(e) => setBatchForm(prev => ({ ...prev, productId: e.target.value }))}
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.type})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="batch-expected">Expected Units *</label>
                <input
                  id="batch-expected"
                  type="number"
                  min="1"
                  value={batchForm.expectedUnits}
                  onChange={(e) => setBatchForm(prev => ({ ...prev, expectedUnits: parseInt(e.target.value) || 1000 }))}
                  required
                  placeholder="1000"
                />
                <small>Target number of units to produce in this batch</small>
              </div>
              <div className="form-group">
                <label htmlFor="batch-notes">Notes (Optional)</label>
                <textarea
                  id="batch-notes"
                  value={batchForm.notes}
                  onChange={(e) => setBatchForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Special instructions, quality requirements, etc."
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateBatch(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Details Modal */}
      {showBatchDetails && selectedBatch && (() => {
        const product = products.find(p => p.id === selectedBatch.productId);
        const progress = getBatchProgress(selectedBatch.id);
        const stats = getBatchStats(selectedBatch);
        const batchSessions = sessions.filter(s => s.batchId === selectedBatch.id);
        const activeSessions = batchSessions.filter(s => !s.clockedOut);
        
        return (
          <div className="modal-overlay" onClick={() => setShowBatchDetails(false)}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <Package size={20} />
                  Batch Details: {selectedBatch.name}
                </h3>
                <button 
                  className="btn btn-ghost small"
                  onClick={() => setShowBatchDetails(false)}
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="batch-details-content">
                {/* Basic Information */}
                <div className="details-section">
                  <h4>Basic Information</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <label>Batch Name:</label>
                      <span>{selectedBatch.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Product:</label>
                      <span>{product?.name || 'Unknown Product'} ({product?.type || 'N/A'})</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span className={`status-badge ${selectedBatch.status.toLowerCase()}`}>
                        {selectedBatch.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Lot Code:</label>
                      <span>{selectedBatch.lotCode || 'Not assigned'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Created:</label>
                      <span>{new Date(selectedBatch.created).toLocaleString()}</span>
                    </div>
                    {selectedBatch.closed && (
                      <div className="detail-item">
                        <label>Closed:</label>
                        <span>{new Date(selectedBatch.closed).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Production Progress */}
                <div className="details-section">
                  <h4>Production Progress</h4>
                  <div className="progress-details">
                    <div className="progress-bar-container">
                      <div className="progress-info">
                        <span className="progress-text">
                          {progress.produced} / {progress.expected} units ({progress.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="progress-bar large">
                        <div 
                          className="progress-fill"
                          style={{ width: `${Math.min(100, progress.percentage)}%` }}
                        />
                      </div>
                    </div>
                    <div className="progress-stats">
                      <div className="stat-item">
                        <label>Expected:</label>
                        <span>{selectedBatch.expectedUnits.toLocaleString()} units</span>
                      </div>
                      <div className="stat-item">
                        <label>Actual:</label>
                        <span>{selectedBatch.actualUnits.toLocaleString()} units</span>
                      </div>
                      <div className="stat-item">
                        <label>Remaining:</label>
                        <span>{Math.max(0, selectedBatch.expectedUnits - selectedBatch.actualUnits).toLocaleString()} units</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quality & Performance Metrics */}
                <div className="details-section">
                  <h4>Quality & Performance</h4>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-value">{stats.firstPassYield.toFixed(1)}%</div>
                      <div className="metric-label">First Pass Yield</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{stats.scrapRate.toFixed(1)}%</div>
                      <div className="metric-label">Scrap Rate</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{stats.totalHours.toFixed(1)}</div>
                      <div className="metric-label">Total Hours</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-value">{stats.totalWorkers}</div>
                      <div className="metric-label">Workers Involved</div>
                    </div>
                  </div>
                  <div className="quality-breakdown">
                    <div className="quality-item">
                      <span className="quality-label">Good Units:</span>
                      <span className="quality-value good">{(stats.totalProduced - stats.totalScrap - stats.totalRework).toLocaleString()}</span>
                    </div>
                    <div className="quality-item">
                      <span className="quality-label">Rework Units:</span>
                      <span className="quality-value rework">{stats.totalRework.toLocaleString()}</span>
                    </div>
                    <div className="quality-item">
                      <span className="quality-label">Scrap Units:</span>
                      <span className="quality-value scrap">{stats.totalScrap.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Active Sessions */}
                {activeSessions.length > 0 && (
                  <div className="details-section">
                    <h4>
                      <User size={16} />
                      Active Sessions ({activeSessions.length})
                    </h4>
                    <div className="active-sessions">
                      {activeSessions.map(session => {
                        const employee = employees.find(e => e.id === session.employeeId);
                        const task = products.find(p => p.id === session.taskId); // Assuming task lookup
                        const duration = (new Date().getTime() - new Date(session.startTime).getTime()) / (1000 * 60);
                        
                        return (
                          <div key={session.id} className="session-item">
                            <div className="session-info">
                              <span className="employee-name">{employee?.name || 'Unknown Employee'}</span>
                              <span className="session-task">{task?.name || 'Unknown Task'}</span>
                            </div>
                            <div className="session-duration">
                              <Clock size={14} />
                              <span>{duration.toFixed(0)} min</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Genealogy */}
                {selectedBatch.genealogy && selectedBatch.genealogy.length > 0 && (
                  <div className="details-section">
                    <h4>Batch Genealogy</h4>
                    <div className="genealogy-list">
                      {selectedBatch.genealogy.map(parentId => {
                        const parentBatch = batches.find(b => b.id === parentId);
                        return (
                          <div key={parentId} className="genealogy-item">
                            <Package size={14} />
                            <span>{parentBatch?.name || parentId}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedBatch.notes && (
                  <div className="details-section">
                    <h4>Notes</h4>
                    <div className="notes-content">
                      {selectedBatch.notes.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowBatchDetails(false)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => {
                    setShowBatchDetails(false);
                    handleEditBatch(selectedBatch);
                  }}
                >
                  <Settings size={16} />
                  Edit Batch
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowBatchDetails(false);
                    handleUpdateStatus(selectedBatch);
                  }}
                >
                  <Settings size={16} />
                  Update Status
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Update Status Modal */}
      {showUpdateStatus && selectedBatch && (
        <div className="modal-overlay" onClick={() => setShowUpdateStatus(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Settings size={20} />
                Update Status: {selectedBatch.name}
              </h3>
              <button 
                className="btn btn-ghost small"
                onClick={() => setShowUpdateStatus(false)}
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleStatusUpdate}>
              <div className="form-group">
                <label htmlFor="status-current">Current Status</label>
                <div className="current-status">
                  <span className={`status-badge ${selectedBatch.status.toLowerCase()}`}>
                    {selectedBatch.status}
                  </span>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="status-new">New Status *</label>
                <select
                  id="status-new"
                  value={statusForm.status}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value as Batch['status'] }))}
                  required
                >
                  <option value="">Select new status</option>
                  <option value="Open">Open</option>
                  <option value="InProgress">In Progress</option>
                  <option value="OnHold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="status-notes">Status Change Notes</label>
                <textarea
                  id="status-notes"
                  value={statusForm.notes}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Reason for status change, additional notes..."
                  rows={3}
                />
              </div>
              
              {(statusForm.status === 'Closed' || statusForm.status === 'Completed') && (
                <div className="form-warning">
                  <CheckSquare size={16} />
                  <span>This status change will mark the batch as finished and set the close date.</span>
                </div>
              )}
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowUpdateStatus(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!statusForm.status}
                >
                  <Settings size={16} />
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {showEditBatch && selectedBatch && (() => {
        console.log('Rendering Edit Batch Modal for:', selectedBatch.name);
        return (
        <div className="modal-overlay" onClick={() => setShowEditBatch(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Settings size={20} />
                Edit Batch: {selectedBatch.name}
              </h3>
              <button 
                className="btn btn-ghost small"
                onClick={() => setShowEditBatch(false)}
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleBatchEdit}>
              <div className="form-group">
                <label htmlFor="edit-batch-name">Batch Name *</label>
                <input
                  id="edit-batch-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Enter batch name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-lot-code">Lot Code</label>
                <input
                  id="edit-lot-code"
                  type="text"
                  value={editForm.lotCode}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lotCode: e.target.value }))}
                  placeholder="Optional lot code"
                />
                <small>Leave blank if not applicable</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-expected-units">Expected Units *</label>
                <input
                  id="edit-expected-units"
                  type="number"
                  min="1"
                  value={editForm.expectedUnits}
                  onChange={(e) => setEditForm(prev => ({ ...prev, expectedUnits: parseInt(e.target.value) || 1000 }))}
                  required
                  placeholder="1000"
                />
                <small>Target number of units to produce in this batch</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-batch-notes">Notes</label>
                <textarea
                  id="edit-batch-notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Special instructions, quality requirements, etc."
                  rows={4}
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowEditBatch(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <Settings size={16} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
        );
      })()}
    </div>
  );
};