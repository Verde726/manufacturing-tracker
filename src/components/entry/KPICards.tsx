// Manufacturing Production Tracker - KPI Cards Component
// Live metrics dashboard cards

import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Users, 
  Package, 
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';
import { useProductionStore } from '../../stores/productionStore';

export const KPICards: React.FC = () => {
  const {
    getActiveSessions,
    getCompletionsToday,
    getActiveEmployees
  } = useProductionStore();

  const activeSessions = getActiveSessions();
  const todaysCompletions = getCompletionsToday();
  // const _openBatches = getOpenBatches(); // TODO: Use for future KPI
  const activeEmployees = getActiveEmployees();

  // Calculate metrics
  const totalUnitsToday = todaysCompletions.reduce((sum, c) => sum + c.quantity, 0);
  const totalHoursToday = todaysCompletions.reduce((sum, c) => sum + (c.duration / (1000 * 60 * 60)), 0);
  const avgEfficiencyToday = todaysCompletions.length > 0 
    ? todaysCompletions.reduce((sum, c) => sum + c.efficiency, 0) / todaysCompletions.length 
    : 0;
  const avgUPHToday = totalHoursToday > 0 ? totalUnitsToday / totalHoursToday : 0;
  
  // Quality metrics
  const totalGoodUnits = todaysCompletions.reduce((sum, c) => sum + c.goodUnits, 0);
  const qualityRate = totalUnitsToday > 0 ? (totalGoodUnits / totalUnitsToday) * 100 : 100;

  // Get efficiency color class
  const getEfficiencyClass = (efficiency: number) => {
    if (efficiency >= 100) return 'excellent';
    if (efficiency >= 80) return 'good';
    if (efficiency >= 60) return 'fair';
    return 'poor';
  };

  const kpiCards = [
    {
      id: 'units',
      title: 'Total Units',
      value: totalUnitsToday.toLocaleString(),
      subtitle: 'Today',
      icon: Package,
      trend: todaysCompletions.length > 0 ? 'up' : 'neutral',
      className: 'positive'
    },
    {
      id: 'hours',
      title: 'Hours Worked',
      value: totalHoursToday.toFixed(1),
      subtitle: 'Productive time',
      icon: Clock,
      trend: totalHoursToday > 0 ? 'up' : 'neutral',
      className: 'info'
    },
    {
      id: 'efficiency',
      title: 'Avg Efficiency',
      value: `${Math.round(avgEfficiencyToday)}%`,
      subtitle: 'vs Target',
      icon: TrendingUp,
      trend: avgEfficiencyToday >= 80 ? 'up' : avgEfficiencyToday >= 60 ? 'neutral' : 'down',
      className: getEfficiencyClass(avgEfficiencyToday)
    },
    {
      id: 'uph',
      title: 'Avg UPH',
      value: Math.round(avgUPHToday).toLocaleString(),
      subtitle: 'Units per hour',
      icon: Target,
      trend: avgUPHToday > 0 ? 'up' : 'neutral',
      className: 'info'
    },
    {
      id: 'quality',
      title: 'Quality Rate',
      value: `${qualityRate.toFixed(1)}%`,
      subtitle: 'First pass yield',
      icon: CheckCircle,
      trend: qualityRate >= 95 ? 'up' : qualityRate >= 90 ? 'neutral' : 'down',
      className: qualityRate >= 95 ? 'excellent' : qualityRate >= 90 ? 'good' : 'warning'
    },
    {
      id: 'active',
      title: 'Active Workers',
      value: activeSessions.length.toString(),
      subtitle: `of ${activeEmployees.length} total`,
      icon: Users,
      trend: activeSessions.length > 0 ? 'up' : 'neutral',
      className: activeSessions.length > 0 ? 'positive' : 'neutral'
    }
  ];

  return (
    <div className="kpi-cards">
      <div className="kpi-header">
        <h2>Live Metrics</h2>
        <div className="last-updated">
          Updated: {new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      <div className="kpi-grid">
        {kpiCards.map((kpi) => {
          const IconComponent = kpi.icon;
          return (
            <div key={kpi.id} className={`kpi-card ${kpi.className}`}>
              <div className="kpi-header">
                <div className="kpi-icon">
                  <IconComponent size={20} />
                </div>
                <div className={`kpi-trend ${kpi.trend}`}>
                  {kpi.trend === 'up' && '↗'}
                  {kpi.trend === 'down' && '↘'}
                  {kpi.trend === 'neutral' && '→'}
                </div>
              </div>

              <div className="kpi-content">
                <div className="kpi-value">{kpi.value}</div>
                <div className="kpi-title">{kpi.title}</div>
                <div className="kpi-subtitle">{kpi.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Alert */}
      {(activeSessions.length === 0 && todaysCompletions.length === 0) && (
        <div className="kpi-alert">
          <AlertTriangle size={16} />
          <span>No production activity detected today. Clock in to start tracking.</span>
        </div>
      )}
    </div>
  );
};