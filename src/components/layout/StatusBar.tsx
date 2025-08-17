// Manufacturing Production Tracker - Status Bar Component
// Real-time status indicators and key metrics

import React, { useEffect, useState } from 'react';
import { Clock, Users, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { useProductionStore } from '../../stores/productionStore';
import { useAppStore } from '../../stores/appStore';

export const StatusBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { 
    getActiveSessions, 
    getOpenBatches, 
    getCompletionsToday 
  } = useProductionStore();
  
  const { 
    getCurrentShiftInfo 
  } = useAppStore();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const activeSessions = getActiveSessions();
  const openBatches = getOpenBatches();
  const todaysCompletions = getCompletionsToday();
  const shiftInfo = getCurrentShiftInfo();
  
  // Calculate today's efficiency
  const todayEfficiency = todaysCompletions.length > 0 
    ? Math.round(todaysCompletions.reduce((sum, c) => sum + c.efficiency, 0) / todaysCompletions.length)
    : 0;
  
  // Calculate total units today
  const totalUnitsToday = todaysCompletions.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className="status-bar">
      <div className="status-section">
        <Clock size={16} />
        <span className="status-time">
          {currentTime.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })}
        </span>
      </div>

      <div className="status-section">
        <span className="status-label">Shift:</span>
        <span className="status-value shift-badge">
          {shiftInfo?.name || 'Unknown'}
        </span>
      </div>

      <div className="status-section">
        <Users size={16} />
        <span className="status-label">Active:</span>
        <span className={`status-value ${activeSessions.length > 0 ? 'positive' : 'neutral'}`}>
          {activeSessions.length}
        </span>
      </div>

      <div className="status-section">
        <Package size={16} />
        <span className="status-label">Open Batches:</span>
        <span className={`status-value ${openBatches.length > 0 ? 'positive' : 'warning'}`}>
          {openBatches.length}
        </span>
      </div>

      <div className="status-section">
        <TrendingUp size={16} />
        <span className="status-label">Today's Units:</span>
        <span className="status-value positive">
          {totalUnitsToday.toLocaleString()}
        </span>
      </div>

      <div className="status-section">
        <span className="status-label">Efficiency:</span>
        <span className={`status-value efficiency-badge ${
          todayEfficiency >= 100 ? 'excellent' : 
          todayEfficiency >= 80 ? 'good' : 
          todayEfficiency >= 60 ? 'fair' : 'poor'
        }`}>
          {todayEfficiency}%
        </span>
      </div>

      {/* Alert indicator */}
      {(activeSessions.length === 0 && shiftInfo && 
        currentTime.getHours() >= parseInt(shiftInfo.start.split(':')[0]) && 
        currentTime.getHours() < parseInt(shiftInfo.end.split(':')[0])) && (
        <div className="status-section alert">
          <AlertTriangle size={16} />
          <span className="status-value warning">No Active Sessions</span>
        </div>
      )}
    </div>
  );
};