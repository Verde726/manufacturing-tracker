// Manufacturing Production Tracker - Clock Out Modal Component
// Modal for completing work sessions with quantity entry

import React, { useState, useEffect } from 'react';
import { X, Clock, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProductionStore } from '../../stores/productionStore';
import type { Session } from '../../types';

interface ClockOutModalProps {
  session: Session;
  onClose: () => void;
  onClockOut: (quantity: number, notes?: string) => Promise<void>;
}

export const ClockOutModal: React.FC<ClockOutModalProps> = ({
  session,
  onClose,
  onClockOut
}) => {
  const [quantity, setQuantity] = useState<number>(0);
  const [goodUnits, setGoodUnits] = useState<number>(0);
  const [scrapUnits, setScrapUnits] = useState<number>(0);
  const [reworkUnits, setReworkUnits] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [qualityReason, setQualityReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { tasks, addCompletion } = useProductionStore();

  const task = tasks.find(t => t.id === session.taskId);
  const startTime = new Date(session.startTime);
  const currentTime = new Date();
  const durationMs = currentTime.getTime() - startTime.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);

  // Calculate derived metrics
  const uph = durationHours > 0 ? quantity / durationHours : 0;
  const efficiency = task?.quota && task.quota > 0 ? (uph / task.quota) * 100 : 0;

  // Update total quantity when individual quantities change
  useEffect(() => {
    setQuantity(goodUnits + scrapUnits + reworkUnits);
  }, [goodUnits, scrapUnits, reworkUnits]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create completion record
      await addCompletion({
        sessionId: session.id,
        employeeId: session.employeeId,
        taskId: session.taskId,
        productId: session.productId,
        batchId: session.batchId,
        quantity,
        goodUnits,
        scrapUnits,
        reworkUnits,
        startTime: session.startTime,
        endTime: currentTime.toISOString(),
        efficiency: Math.round(efficiency),
        qualityReason: qualityReason || undefined,
        defectCodes: []
      });

      // Complete the session
      await onClockOut(quantity, notes);
    } catch (error) {
      console.error('Failed to complete clock out:', error);
      alert('Failed to clock out. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEfficiencyClass = () => {
    if (efficiency >= 100) return 'excellent';
    if (efficiency >= 80) return 'good';
    if (efficiency >= 60) return 'fair';
    return 'poor';
  };

  const formatDuration = () => {
    const hours = Math.floor(durationHours);
    const minutes = Math.floor((durationHours % 1) * 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content clock-out-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Clock size={20} />
            Clock Out Session
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Session Summary */}
          <div className="session-summary">
            <h3>Session Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Duration:</span>
                <span className="value">{formatDuration()}</span>
              </div>
              <div className="summary-item">
                <span className="label">Started:</span>
                <span className="value">
                  {startTime.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Ending:</span>
                <span className="value">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Production Quantities */}
            <div className="form-section">
              <h3>Production Quantities</h3>
              <div className="quantity-grid">
                <div className="form-group">
                  <label htmlFor="goodUnits">
                    <CheckCircle size={16} className="text-success" />
                    Good Units
                  </label>
                  <input
                    type="number"
                    id="goodUnits"
                    value={goodUnits || ''}
                    onChange={(e) => setGoodUnits(parseInt(e.target.value) || 0)}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="scrapUnits">
                    <X size={16} className="text-error" />
                    Scrap Units
                  </label>
                  <input
                    type="number"
                    id="scrapUnits"
                    value={scrapUnits || ''}
                    onChange={(e) => setScrapUnits(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reworkUnits">
                    <AlertTriangle size={16} className="text-warning" />
                    Rework Units
                  </label>
                  <input
                    type="number"
                    id="reworkUnits"
                    value={reworkUnits || ''}
                    onChange={(e) => setReworkUnits(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>

                <div className="form-group total">
                  <label>
                    <Package size={16} />
                    Total Units
                  </label>
                  <div className="total-display">{quantity}</div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="performance-metrics">
              <h3>Performance Metrics</h3>
              <div className="metrics-grid">
                <div className="metric">
                  <span className="metric-label">Units Per Hour:</span>
                  <span className="metric-value">{uph.toFixed(1)}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Target Quota:</span>
                  <span className="metric-value">{task?.quota || 0}/hr</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Efficiency:</span>
                  <span className={`metric-value efficiency ${getEfficiencyClass()}`}>
                    {efficiency.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quality Issues */}
            {(scrapUnits > 0 || reworkUnits > 0) && (
              <div className="form-section">
                <h3>Quality Information</h3>
                <div className="form-group">
                  <label htmlFor="qualityReason">Reason for Scrap/Rework</label>
                  <select
                    id="qualityReason"
                    value={qualityReason}
                    onChange={(e) => setQualityReason(e.target.value)}
                  >
                    <option value="">— Select Reason —</option>
                    <option value="material_defect">Material Defect</option>
                    <option value="equipment_issue">Equipment Issue</option>
                    <option value="process_variation">Process Variation</option>
                    <option value="operator_error">Operator Error</option>
                    <option value="measurement_error">Measurement Error</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="form-section">
              <h3>Notes (Optional)</h3>
              <div className="form-group">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this session..."
                  rows={3}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting || quantity <= 0}
          >
            {isSubmitting ? 'Completing...' : 'Complete Session'}
          </button>
        </div>
      </div>
    </div>
  );
};