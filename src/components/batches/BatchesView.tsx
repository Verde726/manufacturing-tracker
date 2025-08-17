// Manufacturing Production Tracker - Batches View Component
// Batch and lot tracking with genealogy

import React from 'react';
import { Package, Plus, Calendar, TrendingUp } from 'lucide-react';
import { useProductionStore } from '../../stores/productionStore';

export const BatchesView: React.FC = () => {
  const { 
    getOpenBatches, 
    batches, 
    products,
    getBatchProgress 
  } = useProductionStore();

  const openBatches = getOpenBatches();
  const allBatches = batches.slice(0, 10); // Show recent 10 batches

  return (
    <div className="batches-view">
      <div className="batches-header">
        <h1>
          <Package size={24} />
          Batch & Lot Management
        </h1>
        <button className="btn btn-primary">
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
                      <button className="btn btn-secondary small">View Details</button>
                      <button className="btn btn-primary small">Update Status</button>
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
            Recent Batches
          </h2>
          
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
                {allBatches.map((batch) => {
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
                        <button className="btn btn-ghost small">View</button>
                        <button className="btn btn-ghost small">Edit</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
    </div>
  );
};