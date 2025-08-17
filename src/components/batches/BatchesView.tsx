// Manufacturing Production Tracker - Batches View Component
// Batch and lot tracking with genealogy

import React, { useState } from 'react';
import { Package, Plus, Calendar, TrendingUp, X } from 'lucide-react';
import { useProductionStore } from '../../stores/productionStore';

export const BatchesView: React.FC = () => {
  const { 
    getOpenBatches, 
    batches, 
    products,
    getBatchProgress,
    addBatch 
  } = useProductionStore();

  // Modal state
  const [showCreateBatch, setShowCreateBatch] = useState(false);

  // Form state
  const [batchForm, setBatchForm] = useState({
    name: '',
    productId: '',
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
                        onClick={() => {
                          alert(`View Details for batch: ${batch.name}\n\nDetailed batch view coming soon!`);
                        }}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn btn-primary small"
                        onClick={() => {
                          alert(`Update Status for batch: ${batch.name}\n\nBatch status management coming soon!`);
                        }}
                      >
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
                          onClick={() => {
                            alert(`View batch: ${batch.name}\n\nDetailed batch view coming soon!`);
                          }}
                        >
                          View
                        </button>
                        <button 
                          className="btn btn-ghost small"
                          onClick={() => {
                            alert(`Edit batch: ${batch.name}\n\nBatch editing coming soon!`);
                          }}
                        >
                          Edit
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
    </div>
  );
};