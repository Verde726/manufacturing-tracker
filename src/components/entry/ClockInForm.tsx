// Manufacturing Production Tracker - Clock In Form Component
// Form for starting new work sessions

import React, { useState, useEffect } from 'react';
import { Clock, Play, User, Package, Briefcase, Calendar } from 'lucide-react';
import { useProductionStore } from '../../stores/productionStore';
import { useAppStore } from '../../stores/appStore';

export const ClockInForm: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    getActiveEmployees,
    getActiveProducts,
    getActiveTasks,
    getOpenBatches,
    getTasksByProduct,
    startSession,
    getActiveSessions
  } = useProductionStore();

  const { setLoading } = useAppStore();

  const employees = getActiveEmployees();
  const products = getActiveProducts();
  const allTasks = getActiveTasks();
  const openBatches = getOpenBatches();
  const activeSessions = getActiveSessions();

  // Filter tasks by selected product
  const availableTasks = selectedProduct 
    ? getTasksByProduct(selectedProduct)
    : allTasks;

  // Filter batches by selected product
  const availableBatches = selectedProduct
    ? openBatches.filter(batch => batch.productId === selectedProduct)
    : openBatches;

  // Get selected task details for quota display
  const selectedTaskDetails = availableTasks.find(task => task.id === selectedTask);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Check if employee already has active session
  const employeeHasActiveSession = (employeeId: string) => {
    return activeSessions.some(session => session.employeeId === employeeId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee || !selectedProduct || !selectedTask || !selectedBatch) {
      alert('Please fill in all required fields');
      return;
    }

    if (employeeHasActiveSession(selectedEmployee)) {
      alert('This employee already has an active session. Please clock out first.');
      return;
    }

    setIsSubmitting(true);
    setLoading('sessions', true);

    try {
      await startSession({
        employeeId: selectedEmployee,
        taskId: selectedTask,
        productId: selectedProduct,
        batchId: selectedBatch,
        clockedOut: false
      });

      // Clear form
      setSelectedEmployee('');
      setSelectedProduct('');
      setSelectedTask('');
      setSelectedBatch('');

      alert('Successfully clocked in!');
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Failed to start session. Please try again.');
    } finally {
      setIsSubmitting(false);
      setLoading('sessions', false);
    }
  };

  const resetForm = () => {
    setSelectedEmployee('');
    setSelectedProduct('');
    setSelectedTask('');
    setSelectedBatch('');
  };

  return (
    <div className="clock-in-form">
      <div className="form-header">
        <div className="form-title">
          <Clock size={20} />
          <h2>Clock In</h2>
        </div>
        <div className="current-time">
          {currentTime.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="clock-in-form-grid">
        {/* Employee Selection */}
        <div className="form-group">
          <label htmlFor="employee">
            <User size={16} />
            Employee *
          </label>
          <select
            id="employee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            required
            className={employeeHasActiveSession(selectedEmployee) ? 'warning' : ''}
          >
            <option value="">— Select Employee —</option>
            {employees.map((employee) => (
              <option 
                key={employee.id} 
                value={employee.id}
                disabled={employeeHasActiveSession(employee.id)}
              >
                {employee.name} ({employee.shift})
                {employeeHasActiveSession(employee.id) ? ' - Already Active' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Product Selection */}
        <div className="form-group">
          <label htmlFor="product">
            <Package size={16} />
            Product *
          </label>
          <select
            id="product"
            value={selectedProduct}
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setSelectedTask(''); // Reset task when product changes
              setSelectedBatch(''); // Reset batch when product changes
            }}
            required
          >
            <option value="">— Select Product —</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.type})
              </option>
            ))}
          </select>
        </div>

        {/* Task Selection */}
        <div className="form-group">
          <label htmlFor="task">
            <Briefcase size={16} />
            Task *
          </label>
          <select
            id="task"
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            required
            disabled={!selectedProduct}
          >
            <option value="">— Select Task —</option>
            {availableTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name} (quota: {task.quota}/hr)
              </option>
            ))}
          </select>
        </div>

        {/* Batch Selection */}
        <div className="form-group">
          <label htmlFor="batch">
            <Calendar size={16} />
            Batch *
          </label>
          <select
            id="batch"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            required
            disabled={!selectedProduct}
          >
            <option value="">— Select Batch —</option>
            {availableBatches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name} ({batch.actualUnits}/{batch.expectedUnits} units)
              </option>
            ))}
          </select>
          {selectedProduct && availableBatches.length === 0 && (
            <div className="form-warning">
              ⚠️ No open batches for selected product
            </div>
          )}
        </div>

        {/* Task Info Panel */}
        {selectedTaskDetails && (
          <div className="task-info">
            <h3>Task Information</h3>
            <div className="task-details">
              <div className="task-detail">
                <span className="label">Quota:</span>
                <span className="value">{selectedTaskDetails.quota} units/hour</span>
              </div>
              {selectedTaskDetails.standardCycleTime && (
                <div className="task-detail">
                  <span className="label">Cycle Time:</span>
                  <span className="value">{selectedTaskDetails.standardCycleTime}s per unit</span>
                </div>
              )}
              {selectedTaskDetails.description && (
                <div className="task-detail">
                  <span className="label">Description:</span>
                  <span className="value">{selectedTaskDetails.description}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={resetForm}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Reset
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !selectedEmployee || !selectedProduct || !selectedTask || !selectedBatch}
          >
            <Play size={16} />
            {isSubmitting ? 'Starting...' : 'Start Session'}
          </button>
        </div>
      </form>
    </div>
  );
};