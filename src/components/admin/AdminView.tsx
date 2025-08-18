// Manufacturing Production Tracker - Admin View Component
// Administration and configuration panel

import React, { useState } from 'react';
import { Settings, Users, Package, Database, Shield, Download, Plus, X, Edit3, Trash2, Key } from 'lucide-react';
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
    addProduct,
    updateProduct,
    deleteProduct,
    addTask,
    updateEmployee,
    deleteEmployee
  } = useProductionStore();

  // Modal states
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showManageTasks, setShowManageTasks] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const [editProductForm, setEditProductForm] = useState({
    name: '',
    type: 'Cartridge' as Product['type'],
    active: true
  });

  const [taskForm, setTaskForm] = useState({
    name: '',
    quota: 100,
    productId: '',
    description: ''
  });

  const [editEmployeeForm, setEditEmployeeForm] = useState({
    name: '',
    role: 'Operator' as Employee['role'],
    shift: 'Day' as Employee['shift'],
    rbacRoles: ['operator']
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
      alert('✅ Product added successfully!');
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('❌ Failed to add product. Please try again.');
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditProductForm({
      name: product.name,
      type: product.type,
      active: product.active
    });
    setShowEditProduct(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await updateProduct(selectedProduct.id, {
        name: editProductForm.name,
        type: editProductForm.type,
        active: editProductForm.active
      });
      setShowEditProduct(false);
      setSelectedProduct(null);
      setEditProductForm({ name: '', type: 'Cartridge', active: true });
      alert('✅ Product updated successfully!');
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('❌ Failed to update product. Please try again.');
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    // Check if product is in use
    const tasksUsingProduct = tasks.filter(t => t.productId === product.id);
    const batchesUsingProduct = batches.filter(b => b.productId === product.id);
    
    if (tasksUsingProduct.length > 0) {
      alert(`❌ Cannot delete "${product.name}". It has ${tasksUsingProduct.length} associated tasks. Please delete or reassign the tasks first.`);
      return;
    }
    
    if (batchesUsingProduct.length > 0) {
      alert(`❌ Cannot delete "${product.name}". It has ${batchesUsingProduct.length} associated batches. Products with batch history cannot be deleted for traceability.`);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteProduct(product.id);
        alert('✅ Product deleted successfully!');
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('❌ Failed to delete product. Please try again.');
      }
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTask({
        name: taskForm.name,
        quota: taskForm.quota,
        productId: taskForm.productId,
        description: taskForm.description
      });
      setTaskForm({ name: '', quota: 100, productId: '', description: '' });
      setShowAddTask(false);
    } catch (error) {
      console.error('Failed to add task:', error);
      alert('Failed to add task. Please try again.');
    }
  };

  // Employee management handlers
  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditEmployeeForm({
      name: employee.name,
      role: employee.role,
      shift: employee.shift,
      rbacRoles: employee.rbacRoles
    });
    setShowEditEmployee(true);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      await updateEmployee(selectedEmployee.id, {
        name: editEmployeeForm.name,
        role: editEmployeeForm.role,
        shift: editEmployeeForm.shift,
        rbacRoles: editEmployeeForm.rbacRoles
      });
      setShowEditEmployee(false);
      setSelectedEmployee(null);
      setEditEmployeeForm({ name: '', role: 'Operator', shift: 'Day', rbacRoles: ['operator'] });
    } catch (error) {
      console.error('Failed to update employee:', error);
      alert('Failed to update employee. Please try again.');
    }
  };

  const handleDeleteEmployee = (employee: Employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete employee "${employee.name}"?\n\nThis action cannot be undone and will remove all associated data.`
    );
    
    if (confirmed) {
      try {
        deleteEmployee(employee.id);
        alert(`Employee "${employee.name}" has been deleted successfully.`);
      } catch (error) {
        console.error('Failed to delete employee:', error);
        alert('Failed to delete employee. Please try again.');
      }
    }
  };

  const handleManagePermissions = (employee: Employee) => {
    alert(`Manage Permissions for ${employee.name}\n\nCurrent RBAC Roles: ${employee.rbacRoles.join(', ')}\n\nPermission management functionality is available in the admin panel.`);
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
    <div className="main-content">
      <div className="section-card">
        <div className="card-header">
          <h1 className="card-title">
            <Settings size={24} />
            System Administration
          </h1>
        </div>
        <p className="card-subtitle">Manage system configuration, users, and data</p>
      </div>

      <div className="admin-grid">
        {/* System Overview */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title">
              <Database size={20} />
              System Overview
            </h3>
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
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title">
              <Users size={20} />
              User Management
            </h3>
          </div>
          <div className="card-content">
            <p>Manage employees, roles, and permissions</p>
            <div className="admin-actions">
              <button 
                className="btn btn-primary" 
                onClick={() => setShowAddEmployee(true)}
              >
                <Plus size={16} />
                Add Employee
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  alert('Manage Roles functionality available in the admin panel.');
                }}
              >
                Manage Roles
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  alert('View Access Logs functionality available in the admin panel.');
                }}
              >
                View Access Logs
              </button>
            </div>
          </div>
        </div>

        {/* Product Management */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title">
              <Package size={20} />
              Product Management
            </h3>
          </div>
          <div className="card-content">
            <p>Configure products, tasks, and quotas. Products are listed below.</p>
            <div className="admin-actions">
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddProduct(true)}
              >
                <Plus size={16} />
                Add Product
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowManageTasks(true)}
              >
                Manage Tasks
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  alert('Update Quotas functionality available in the admin panel.');
                }}
              >
                Update Quotas
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title">
              <Shield size={20} />
              Security & Access
            </h3>
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
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title">
              <Database size={20} />
              Data Management
            </h3>
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
        <div className="section-card">
          <div className="card-header">
            <h3 className="card-title">
              <Settings size={20} />
              System Configuration
            </h3>
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
      <div className="section-card">
        <div className="card-header">
          <h2 className="card-title">
            <Users size={20} />
            Active Employees ({employees.filter(e => e.active).length})
          </h2>
        </div>
        
        <div className="employees-table">
          <table className="data-table">
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
                    <button 
                      className="btn btn-ghost btn-small"
                      onClick={() => handleEditEmployee(employee)}
                      title="Edit employee details"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                    <button 
                      className="btn btn-ghost btn-small"
                      onClick={() => handleManagePermissions(employee)}
                      title="Manage permissions and roles"
                    >
                      <Key size={14} />
                      Permissions
                    </button>
                    <button 
                      className="btn btn-danger small"
                      onClick={() => handleDeleteEmployee(employee)}
                      title="Delete employee"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products List */}
      <div className="section-card">
        <div className="card-header">
          <h2 className="card-title">
            <Package size={20} />
            Products ({products.length})
          </h2>
        </div>
        <div className="products-table">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Tasks</th>
                <th>Batches</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const productTasks = tasks.filter(t => t.productId === product.id);
                const productBatches = batches.filter(b => b.productId === product.id);
                const canDelete = productTasks.length === 0 && productBatches.length === 0;
                
                return (
                  <tr key={product.id}>
                    <td className="product-name">{product.name}</td>
                    <td className="product-type">{product.type}</td>
                    <td>
                      <span className={`status-badge ${product.active ? 'active' : 'inactive'}`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="task-count">
                      <span className="count-badge">{productTasks.length}</span>
                    </td>
                    <td className="batch-count">
                      <span className="count-badge">{productBatches.length}</span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="btn btn-ghost btn-small"
                        onClick={() => handleEditProduct(product)}
                        title="Edit product details"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button 
                        className={`btn btn-ghost small ${canDelete ? 'danger' : 'disabled'}`}
                        onClick={() => handleDeleteProduct(product)}
                        disabled={!canDelete}
                        title={canDelete ? 'Delete product' : 'Cannot delete: product has associated tasks or batches'}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No products configured. Add a product to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="modal-overlay" onClick={() => setShowAddEmployee(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Employee</h3>
              <button 
                className="btn btn-ghost btn-small"
                onClick={() => setShowAddEmployee(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddEmployee}>
              <div className="form-group">
                <label className="form-label" htmlFor="employee-name">Name</label>
                <input
                  className="form-input"
                  id="employee-name"
                  type="text"
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Enter employee name"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="employee-role">Role</label>
                <select
                  className="form-select"
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
                <label className="form-label" htmlFor="employee-shift">Shift</label>
                <select
                  className="form-select"
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
                className="btn btn-ghost btn-small"
                onClick={() => setShowAddProduct(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label className="form-label" htmlFor="product-name">Product Name</label>
                <input
                  className="form-input"
                  id="product-name"
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Enter product name"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="product-type">Product Type</label>
                <select
                  className="form-select"
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

      {/* Manage Tasks Modal */}
      {showManageTasks && (
        <div className="modal-overlay" onClick={() => setShowManageTasks(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage Tasks</h3>
              <button 
                className="btn btn-ghost btn-small"
                onClick={() => setShowManageTasks(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="task-management">
                <div className="task-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowAddTask(true)}
                  >
                    <Plus size={16} />
                    Add New Task
                  </button>
                </div>
                
                <div className="tasks-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Task Name</th>
                        <th>Product</th>
                        <th>Quota (UPH)</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => {
                        const product = products.find(p => p.id === task.productId);
                        return (
                          <tr key={task.id}>
                            <td className="task-name">{task.name}</td>
                            <td className="product-name">{product?.name || 'Unknown'}</td>
                            <td className="quota">{task.quota} UPH</td>
                            <td className="description">{task.description || '-'}</td>
                            <td className="actions-cell">
                              <button 
                                className="btn btn-ghost btn-small"
                                onClick={() => {
                                  alert(`Edit task: ${task.name}\n\nTask editing available in admin panel.`);
                                }}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {tasks.length === 0 && (
                        <tr>
                          <td colSpan={5} className="empty-state">
                            No tasks defined. Add a task to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="modal-overlay" onClick={() => setShowAddTask(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Task</h3>
              <button 
                className="btn btn-ghost btn-small"
                onClick={() => setShowAddTask(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddTask}>
              <div className="form-group">
                <label className="form-label" htmlFor="task-name">Task Name</label>
                <input
                  className="form-input"
                  id="task-name"
                  type="text"
                  value={taskForm.name}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Enter task name (e.g., 'Filling', 'Capping')"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="task-product">Product</label>
                <select
                  className="form-select"
                  id="task-product"
                  value={taskForm.productId}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, productId: e.target.value }))}
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="task-quota">Quota (Units Per Hour)</label>
                <input
                  className="form-input"
                  id="task-quota"
                  type="number"
                  min="1"
                  value={taskForm.quota}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, quota: parseInt(e.target.value) || 100 }))}
                  required
                  placeholder="e.g., 100"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="task-description">Description (Optional)</label>
                <textarea
                  className="form-input"
                  id="task-description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the task"
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddTask(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditEmployee && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowEditEmployee(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Edit3 size={20} />
                Edit Employee: {selectedEmployee.name}
              </h3>
              <button 
                className="btn btn-ghost btn-small"
                onClick={() => setShowEditEmployee(false)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpdateEmployee}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-employee-name">Name</label>
                <input
                  className="form-input"
                  id="edit-employee-name"
                  type="text"
                  value={editEmployeeForm.name}
                  onChange={(e) => setEditEmployeeForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Enter employee name"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-employee-role">Role</label>
                <select
                  className="form-select"
                  id="edit-employee-role"
                  value={editEmployeeForm.role}
                  onChange={(e) => setEditEmployeeForm(prev => ({ ...prev, role: e.target.value as Employee['role'] }))}
                >
                  <option value="Operator">Operator</option>
                  <option value="Lead Operator">Lead Operator</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="QA">QA</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-employee-shift">Shift</label>
                <select
                  className="form-select"
                  id="edit-employee-shift"
                  value={editEmployeeForm.shift}
                  onChange={(e) => setEditEmployeeForm(prev => ({ ...prev, shift: e.target.value as Employee['shift'] }))}
                >
                  <option value="Day">Day</option>
                  <option value="Night">Night</option>
                  <option value="Swing">Swing</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">RBAC Roles</label>
                <div className="rbac-roles">
                  {editEmployeeForm.rbacRoles.map(role => (
                    <span key={role} className="role-badge">{role}</span>
                  ))}
                </div>
                <small>Role management available in admin panel</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditEmployee(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Edit3 size={16} />
                  Update Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Edit Product Modal */}
      {showEditProduct && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowEditProduct(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Edit3 size={20} />
                Edit Product: {selectedProduct.name}
              </h3>
              <button 
                className="btn btn-ghost btn-small"
                onClick={() => setShowEditProduct(false)}
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProduct}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-product-name">Product Name *</label>
                <input
                  className="form-input"
                  id="edit-product-name"
                  type="text"
                  value={editProductForm.name}
                  onChange={(e) => setEditProductForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Enter product name"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-product-type">Product Type *</label>
                <select
                  className="form-select"
                  id="edit-product-type"
                  value={editProductForm.type}
                  onChange={(e) => setEditProductForm(prev => ({ ...prev, type: e.target.value as Product['type'] }))}
                  required
                >
                  <option value="Cartridge">Cartridge</option>
                  <option value="AIO Device">AIO Device</option>
                  <option value="Disposable">Disposable</option>
                  <option value="Pod">Pod</option>
                  <option value="Battery">Battery</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editProductForm.active}
                    onChange={(e) => setEditProductForm(prev => ({ ...prev, active: e.target.checked }))}
                  />
                  <span>Active Product</span>
                </label>
                <small>Inactive products cannot be used in new production entries</small>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowEditProduct(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <Edit3 size={16} />
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};