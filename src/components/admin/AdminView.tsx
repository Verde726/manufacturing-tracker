// Manufacturing Production Tracker - Admin View Component
// Administration and configuration panel

import React from 'react';
import { Settings, Users, Package, Database, Shield, Download } from 'lucide-react';
import { useProductionStore } from '../../stores/productionStore';

export const AdminView: React.FC = () => {
  const { 
    employees, 
    products, 
    tasks, 
    batches,
    completions,
    sessions 
  } = useProductionStore();

  const systemStats = {
    employees: employees.length,
    products: products.length,
    tasks: tasks.length,
    batches: batches.length,
    completions: completions.length,
    sessions: sessions.length
  };

  return (
    <div className="admin-view">
      <div className="admin-header">
        <h1>
          <Settings size={24} />
          System Administration
        </h1>
        <p>Manage system configuration, users, and data</p>
      </div>

      <div className="admin-grid">
        {/* System Overview */}
        <div className="admin-card">
          <div className="card-header">
            <Database size={20} />
            <h3>System Overview</h3>
          </div>
          <div className="card-content">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Employees:</span>
                <span className="stat-value">{systemStats.employees}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Products:</span>
                <span className="stat-value">{systemStats.products}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tasks:</span>
                <span className="stat-value">{systemStats.tasks}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Batches:</span>
                <span className="stat-value">{systemStats.batches}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completions:</span>
                <span className="stat-value">{systemStats.completions}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Sessions:</span>
                <span className="stat-value">{systemStats.sessions}</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="admin-card">
          <div className="card-header">
            <Users size={20} />
            <h3>User Management</h3>
          </div>
          <div className="card-content">
            <p>Manage employees, roles, and permissions</p>
            <div className="admin-actions">
              <button className="btn btn-primary">Add Employee</button>
              <button className="btn btn-secondary">Manage Roles</button>
              <button className="btn btn-secondary">View Access Logs</button>
            </div>
          </div>
        </div>

        {/* Product Management */}
        <div className="admin-card">
          <div className="card-header">
            <Package size={20} />
            <h3>Product Management</h3>
          </div>
          <div className="card-content">
            <p>Configure products, tasks, and quotas</p>
            <div className="admin-actions">
              <button className="btn btn-primary">Add Product</button>
              <button className="btn btn-secondary">Manage Tasks</button>
              <button className="btn btn-secondary">Update Quotas</button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="admin-card">
          <div className="card-header">
            <Shield size={20} />
            <h3>Security & Access</h3>
          </div>
          <div className="card-content">
            <p>Role-based access control and security settings</p>
            <div className="admin-actions">
              <button className="btn btn-primary">RBAC Settings</button>
              <button className="btn btn-secondary">Audit Logs</button>
              <button className="btn btn-secondary">Security Reports</button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="admin-card">
          <div className="card-header">
            <Database size={20} />
            <h3>Data Management</h3>
          </div>
          <div className="card-content">
            <p>Import, export, and backup system data</p>
            <div className="admin-actions">
              <button className="btn btn-primary">
                <Download size={16} />
                Export Data
              </button>
              <button className="btn btn-secondary">Import Data</button>
              <button className="btn btn-secondary">Create Backup</button>
            </div>
          </div>
        </div>

        {/* System Configuration */}
        <div className="admin-card">
          <div className="card-header">
            <Settings size={20} />
            <h3>System Configuration</h3>
          </div>
          <div className="card-content">
            <p>Configure shifts, thresholds, and system settings</p>
            <div className="admin-actions">
              <button className="btn btn-primary">Shift Settings</button>
              <button className="btn btn-secondary">Alert Thresholds</button>
              <button className="btn btn-secondary">Sync Settings</button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Employees List */}
      <div className="employees-section">
        <h2>
          <Users size={20} />
          Active Employees ({employees.filter(e => e.active).length})
        </h2>
        
        <div className="employees-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Shift</th>
                <th>RBAC Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.filter(e => e.active).map((employee) => (
                <tr key={employee.id}>
                  <td className="employee-name">{employee.name}</td>
                  <td className="employee-role">{employee.role}</td>
                  <td className="employee-shift">{employee.shift}</td>
                  <td className="rbac-roles">
                    {employee.rbacRoles.map(role => (
                      <span key={role} className="role-badge">{role}</span>
                    ))}
                  </td>
                  <td>
                    <span className="status-badge active">Active</span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn btn-ghost small">Edit</button>
                    <button className="btn btn-ghost small">Permissions</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="coming-soon">
        <h2>🚧 Advanced Admin Features Coming Soon</h2>
        <ul>
          <li>Complete RBAC implementation with granular permissions</li>
          <li>Advanced user management with authentication</li>
          <li>System configuration UI for all settings</li>
          <li>Comprehensive audit logging and reports</li>
          <li>Data import/export wizards</li>
          <li>Automated backup and recovery</li>
        </ul>
      </div>
    </div>
  );
};