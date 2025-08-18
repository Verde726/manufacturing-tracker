// Manufacturing Production Tracker - Production Entry Form
// Simple form for manual production entry with efficiency calculation

import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, User, Clock, Package, Target } from 'lucide-react';
import { useProductionStore } from '../../stores/productionStore';

export const ProductionEntryForm: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [quantityProduced, setQuantityProduced] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastEntry, setLastEntry] = useState<any>(null);
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [efficiencyWarning, setEfficiencyWarning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedEfficiency, setCalculatedEfficiency] = useState<number | null>(null);

  const {
    getActiveEmployees,
    getActiveTasks,
    addCompletion,
    getCompletionsToday,
    tasks
  } = useProductionStore();

  const employees = getActiveEmployees();
  const allTasks = getActiveTasks();

  // Calculate efficiency and check for warnings when relevant fields change
  useEffect(() => {
    setDuplicateWarning('');
    setEfficiencyWarning('');
    
    if (selectedTask && startTime && endTime && quantityProduced) {
      const task = tasks.find(t => t.id === selectedTask);
      if (task && task.quota) {
        const start = new Date(`2024-01-01T${startTime}`);
        const end = new Date(`2024-01-01T${endTime}`);
        const hoursWorked = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        if (hoursWorked > 0) {
          const actualRate = parseInt(quantityProduced) / hoursWorked;
          const efficiency = (actualRate / task.quota) * 100;
          setCalculatedEfficiency(efficiency);
          
          // Check for efficiency warnings
          if (efficiency > 200) {
            setEfficiencyWarning('⚠️ Efficiency over 200% - Please verify quantity and time');
          } else if (efficiency < 30) {
            setEfficiencyWarning('⚠️ Efficiency under 30% - Please verify quantity and time');
          }
          
          // Check for duplicate entries
          if (selectedEmployee && startTime && endTime) {
            const todaysCompletions = getCompletionsToday();
            const overlapping = todaysCompletions.find(c => {
              if (c.employeeId !== selectedEmployee) return false;
              
              const existingStart = new Date(c.startTime);
              const existingEnd = new Date(c.endTime);
              
              const newStart = new Date(`${new Date().toDateString()} ${startTime}`);
              const newEnd = new Date(`${new Date().toDateString()} ${endTime}`);
              
              // Check for time overlap
              return (newStart < existingEnd && newEnd > existingStart);
            });
            
            if (overlapping) {
              setDuplicateWarning('⚠️ Time overlap detected with existing entry for this employee');
            }
          }
        }
      }
    } else {
      setCalculatedEfficiency(null);
    }
  }, [selectedTask, startTime, endTime, quantityProduced, selectedEmployee, tasks, getCompletionsToday]);

  // Set default start time to now
  useEffect(() => {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5); // HH:MM format
    if (!startTime) {
      setStartTime(timeString);
    }
  }, [startTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!selectedEmployee || !selectedTask || !startTime || !endTime || !quantityProduced) {
      alert('Please fill in all required fields');
      return;
    }

    const quantity = parseInt(quantityProduced);
    if (quantity <= 0) {
      alert('Quantity produced must be greater than 0');
      return;
    }

    // Validate times
    const start = new Date(`2024-01-01T${startTime}`);
    const end = new Date(`2024-01-01T${endTime}`);
    
    if (end <= start) {
      alert('End time must be after start time');
      return;
    }

    const hoursWorked = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (hoursWorked > 12) {
      alert('Work session cannot exceed 12 hours');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the selected product - we need this from the task
      const selectedTaskObj = allTasks.find(t => t.id === selectedTask);
      if (!selectedTaskObj) {
        alert('❌ Invalid task selected. Please select a valid task.');
        return;
      }

      // Create a completion entry
      const today = new Date().toDateString();
      const newEntry = {
        sessionId: 'manual-entry-' + Date.now(), // Generate a session ID for manual entries
        employeeId: selectedEmployee,
        taskId: selectedTask,
        productId: selectedTaskObj.productId,
        batchId: 'manual-batch', // Use a default batch for manual entries
        quantity: quantity,
        goodUnits: quantity, // Assume all units are good for manual entry
        scrapUnits: 0,
        reworkUnits: 0,
        startTime: `${today} ${startTime}`,
        endTime: `${today} ${endTime}`,
        efficiency: calculatedEfficiency || 0,
        defectCodes: [],
        notes: `Manual entry: ${startTime} - ${endTime}`
      };
      
      await addCompletion(newEntry);
      
      // Store for confirmation display
      const employee = employees.find(e => e.id === selectedEmployee);
      const task = allTasks.find(t => t.id === selectedTask);
      setLastEntry({
        employee: employee?.name || 'Unknown',
        task: task?.name || 'Unknown',
        quantity,
        efficiency: calculatedEfficiency?.toFixed(1),
        hours: hoursWorked.toFixed(1)
      });

      // Clear form
      setSelectedEmployee('');
      setSelectedTask('');
      setStartTime('');
      setEndTime('');
      setQuantityProduced('');
      setCalculatedEfficiency(null);
      setDuplicateWarning('');
      setEfficiencyWarning('');
      
      // Show confirmation
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 5000); // Auto-hide after 5 seconds
      
    } catch (error) {
      console.error('Failed to save production entry:', error);
      alert('❌ Failed to save production entry. Please check your data and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedEmployee('');
    setSelectedTask('');
    setStartTime('');
    setEndTime('');
    setQuantityProduced('');
    setCalculatedEfficiency(null);
    setDuplicateWarning('');
    setEfficiencyWarning('');
    setShowConfirmation(false);
  };

  const selectedTaskDetails = allTasks.find(task => task.id === selectedTask);

  return (
    <div className="section-card production-entry">
      {/* Success Confirmation */}
      {showConfirmation && lastEntry && (
        <div className="confirmation-banner success">
          <CheckCircle size={20} />
          <div className="confirmation-content">
            <h3>✅ Entry Saved Successfully!</h3>
            <p>
              <strong>{lastEntry.employee}</strong> - {lastEntry.task}: {lastEntry.quantity} units 
              in {lastEntry.hours}h ({lastEntry.efficiency}% efficiency)
            </p>
          </div>
          <button 
            className="btn btn-ghost small"
            onClick={() => setShowConfirmation(false)}
          >
            ×
          </button>
        </div>
      )}

      <div className="card-header">
        <h2 className="card-title">
          <Plus size={20} />
          Production Entry
        </h2>
        {calculatedEfficiency !== null && (
          <div className={`efficiency-preview ${calculatedEfficiency >= 100 ? 'excellent' : calculatedEfficiency >= 80 ? 'good' : 'poor'}`}>
            <Target size={16} />
            <span>{calculatedEfficiency.toFixed(1)}% Efficiency</span>
          </div>
        )}
      </div>

      {/* Warning Messages */}
      {duplicateWarning && (
        <div className="alert alert-warning">
          <span>⚠️</span>
          {duplicateWarning}
        </div>
      )}
      
      {efficiencyWarning && (
        <div className="alert alert-warning">
          <span>⚡</span>
          {efficiencyWarning}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-grid">
        {/* Employee Selection */}
        <div className="form-group">
          <label className="form-label" htmlFor="prod-employee">
            <User size={16} />
            Employee *
          </label>
          <select
            className="form-select"
            id="prod-employee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            required
          >
            <option value="">— Select Employee —</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} ({employee.shift})
              </option>
            ))}
          </select>
        </div>

        {/* Task Selection */}
        <div className="form-group">
          <label className="form-label" htmlFor="prod-task">
            <Package size={16} />
            Task *
          </label>
          <select
            className="form-select"
            id="prod-task"
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            required
          >
            <option value="">— Select Task —</option>
            {allTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name} (quota: {task.quota}/hr)
              </option>
            ))}
          </select>
        </div>

        {/* Start Time */}
        <div className="form-group">
          <label className="form-label" htmlFor="prod-start-time">
            <Clock size={16} />
            Start Time *
          </label>
          <input
            className="form-input"
            id="prod-start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        {/* End Time */}
        <div className="form-group">
          <label className="form-label" htmlFor="prod-end-time">
            <Clock size={16} />
            End Time *
          </label>
          <input
            className="form-input"
            id="prod-end-time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        {/* Quantity Produced */}
        <div className="form-group">
          <label className="form-label" htmlFor="prod-quantity">
            <Target size={16} />
            Quantity Produced *
          </label>
          <input
            className="form-input"
            id="prod-quantity"
            type="number"
            min="0"
            max="9999"
            step="1"
            value={quantityProduced}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 9999)) {
                setQuantityProduced(value);
              }
            }}
            placeholder="Enter units produced (0-9999)"
            required
          />
          <small className="form-help">📦 Enter the number of units completed</small>
        </div>

        {/* Task Info Panel */}
        {selectedTaskDetails && (
          <div className="form-section">
            <h3 className="form-section-title">
              🎯 Task Information
            </h3>
            <div className="task-details">
              <div className="task-detail">
                <span className="label">📊 Quota:</span>
                <span className="value">{selectedTaskDetails.quota} units/hour</span>
              </div>
              {selectedTaskDetails.description && (
                <div className="task-detail">
                  <span className="label">📝 Description:</span>
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
            className={`btn ${duplicateWarning || efficiencyWarning ? 'btn-warning' : 'btn-success'} ${isSubmitting ? 'btn-loading' : ''}`}
            disabled={isSubmitting || !selectedEmployee || !selectedTask || !startTime || !endTime || !quantityProduced}
          >
            {!isSubmitting && <CheckCircle size={16} />}
            {isSubmitting ? 'Saving Entry...' : 
             duplicateWarning ? '⚠️ Save Anyway (Overlap Detected)' :
             efficiencyWarning ? '⚡ Save Anyway (Check Efficiency)' :
             '💾 Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};