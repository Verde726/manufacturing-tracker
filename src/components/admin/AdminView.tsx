// Manufacturing Production Tracker - Admin View Component
// Administration and configuration panel

import React, { useState } from 'react';
import { Settings, Users, Package, Database, Shield, Download, Plus, X } from 'lucide-react';
import { useProductionStore } from '../../stores/productionStore';
import type { Employee, Product } from '../../types';

export const AdminView: React.FC = () => {
  const { 
    employees, 
    products, 
    tasks, 
    batches,
    completions,
    sessions,
    addEmployee,
    addProduct 
  } = useProductionStore();

  // Modal states
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Form states
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    role: 'Operator' as Employee['role'],
    shift: 'Day' as Employee['shift'],
    rbacRoles: ['operator']
  });

  const [productForm, setProductForm] = useState({
    name: '',
    type: 'Cartridge' as Product['type'],
    active: true
  });

  // Handlers
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEmployee({
        name: employeeForm.name,
        role: employeeForm.role,
        shift: employeeForm.shift,
        active: true,
        rbacRoles: employeeForm.rbacRoles
      });
      setEmployeeForm({ name: '', role: 'Operator', shift: 'Day', rbacRoles: ['operator'] });
      setShowAddEmployee(false);
    } catch (error) {
      console.error('Failed to add employee:', error);
      alert('Failed to add employee. Please try again.');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addProduct({
        name: productForm.name,
        type: productForm.type,
        active: productForm.active
      });
      setProductForm({ name: '', type: 'Cartridge', active: true });
      setShowAddProduct(false);
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

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
              <button 
                className="btn btn-primary" 
                onClick={(e) => {
                  console.log('Add Employee button clicked!', e);
                  alert('Add Employee button clicked!');
                  setShowAddEmployee(true);
                }}
              >
                <Plus size={16} />
                Add Employee
              </button>
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
              <button 
                className="btn btn-primary"
                onClick={(e) => {
                  console.log('Add Product button clicked!', e);
                  alert('Add Product button clicked!');
                  setShowAddProduct(true);
                }}
              >
                <Plus size={16} />
                Add Product
              </button>
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

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="modal-overlay" onClick={() => setShowAddEmployee(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Employee</h3>
              <button 
                className="btn btn-ghost small"
                onClick={() => setShowAddEmployee(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddEmployee}>
              <div className="form-group">
                <label htmlFor="employee-name">Name</label>
                <input
                  id="employee-name"
                  type="text"
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Enter employee name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="employee-role">Role</label>
                <select
                  id="employee-role"
                  value={employeeForm.role}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, role: e.target.value as Employee['role'] }))}
                >
                  <option value="Operator">Operator</option>
                  <option value="Lead Operator">Lead Operator</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="QA">QA</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="employee-shift">Shift</label>
                <select
                  id="employee-shift"
                  value={employeeForm.shift}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, shift: e.target.value as Employee['shift'] }))}
                >
                  <option value="Day">Day</option>
                  <option value="Night">Night</option>
                  <option value="Swing">Swing</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddEmployee(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="modal-overlay" onClick={() => setShowAddProduct(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Product</h3>
              <button 
                className="btn btn-ghost small"
                onClick={() => setShowAddProduct(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label htmlFor="product-name">Product Name</label>
                <input
                  id="product-name"
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Enter product name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="product-type">Product Type</label>
                <select
                  id="product-type"
                  value={productForm.type}
                  onChange={(e) => setProductForm(prev => ({ ...prev, type: e.target.value as Product['type'] }))}
                >
                  <option value="Cartridge">Cartridge</option>
                  <option value="AIO Device">AIO Device</option>
                  <option value="Disposable">Disposable</option>
                  <option value="Pod">Pod</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddProduct(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};