// Manufacturing Production Tracker - Active Sessions Component
// Displays and manages currently active work sessions

import React, { useState } from 'react';
import { Clock, Pause, Edit, User, Package, Calendar, TrendingUp } from 'lucide-react';
import { useProductionStore } from '../../stores/productionStore';
import { ClockOutModal } from './ClockOutModal';

export const ActiveSessions: React.FC = () => {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showClockOutModal, setShowClockOutModal] = useState(false);

  const {
    getActiveSessions,
    employees,
    tasks,
    products,
    batches,
    endSession
  } = useProductionStore();

  const activeSessions = getActiveSessions();

  const getSessionDetails = (session: any) => {
    const employee = employees.find(e => e.id === session.employeeId);
    const task = tasks.find(t => t.id === session.taskId);
    const product = products.find(p => p.id === session.productId);
    const batch = batches.find(b => b.id === session.batchId);
    
    return { employee, task, product, batch };
  };

  const getSessionDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const durationMs = now.getTime() - start.getTime();
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const handleClockOut = (sessionId: string) => {
    setSelectedSession(sessionId);
    setShowClockOutModal(true);
  };

  const handleClockOutComplete = async (_quantity: number, notes?: string) => {
    if (!selectedSession) return;
    
    try {
      await endSession(selectedSession, notes);
      setShowClockOutModal(false);
      setSelectedSession(null);
    } catch (error) {
      console.error('Failed to clock out:', error);
      alert('Failed to clock out. Please try again.');
    }
  };

  if (activeSessions.length === 0) {
    return (
      <div className="active-sessions">
        <div className="section-header">
          <h2>
            <Clock size={20} />
            Active Sessions
          </h2>
          <span className="session-count">0 active</span>
        </div>
        
        <div className="empty-state">
          <Clock size={48} />
          <h3>No Active Sessions</h3>
          <p>Clock in above to start tracking production time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="active-sessions">
      <div className="section-header">
        <h2>
          <Clock size={20} />
          Active Sessions
        </h2>
        <span className="session-count">{activeSessions.length} active</span>
      </div>

      <div className="sessions-list">
        {activeSessions.map((session) => {
          const { employee, task, product, batch } = getSessionDetails(session);
          const duration = getSessionDuration(session.startTime);
          
          return (
            <div key={session.id} className="session-card">
              <div className="session-header">
                <div className="session-employee">
                  <User size={16} />
                  <span className="employee-name">{employee?.name || 'Unknown'}</span>
                  <span className="employee-role">({employee?.role || 'Unknown'})</span>
                </div>
                <div className="session-status">
                  <div className="status-indicator active">
                    <div className="pulse-dot" />
                    Active
                  </div>
                  <span className="session-duration">{duration}</span>
                </div>
              </div>

              <div className="session-details">
                <div className="detail-row">
                  <Package size={14} />
                  <span className="detail-label">Product:</span>
                  <span className="detail-value">{product?.name || 'Unknown'}</span>
                </div>
                
                <div className="detail-row">
                  <TrendingUp size={14} />
                  <span className="detail-label">Task:</span>
                  <span className="detail-value">
                    {task?.name || 'Unknown'}
                    {task?.quota && (
                      <span className="quota-info"> (quota: {task.quota}/hr)</span>
                    )}
                  </span>
                </div>
                
                <div className="detail-row">
                  <Calendar size={14} />
                  <span className="detail-label">Batch:</span>
                  <span className="detail-value">{batch?.name || 'Unknown'}</span>
                </div>
                
                <div className="detail-row">
                  <Clock size={14} />
                  <span className="detail-label">Started:</span>
                  <span className="detail-value">
                    {new Date(session.startTime).toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              <div className="session-actions">
                <button
                  className="btn btn-secondary small"
                  onClick={() => {
                    // TODO: Open edit session modal
                    console.log('Edit session:', session.id);
                  }}
                >
                  <Edit size={14} />
                  Edit
                </button>
                
                <button
                  className="btn btn-primary small"
                  onClick={() => handleClockOut(session.id)}
                >
                  <Pause size={14} />
                  Clock Out
                </button>
              </div>

              {session.notes && (
                <div className="session-notes">
                  <strong>Notes:</strong> {session.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Clock Out Modal */}
      {showClockOutModal && selectedSession && (
        <ClockOutModal
          session={activeSessions.find(s => s.id === selectedSession)!}
          onClose={() => {
            setShowClockOutModal(false);
            setSelectedSession(null);
          }}
          onClockOut={handleClockOutComplete}
        />
      )}
    </div>
  );
};