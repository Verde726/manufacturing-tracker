// Manufacturing Production Tracker - Production Data Store
// Manages all production-related data with IndexedDB persistence

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { db } from '../database/schema';
import type {
  Employee,
  Product,
  Task,
  Batch,
  Session,
  Completion,
  QualityEvent,
  OEECalculation
} from '../types';

// ========================================
// PRODUCTION STORE INTERFACE
// ========================================

interface ProductionStoreState {
  // Entity data
  employees: Employee[];
  products: Product[];
  tasks: Task[];
  batches: Batch[];
  sessions: Session[];
  completions: Completion[];
  qualityEvents: QualityEvent[];
  oeeCalculations: OEECalculation[];
  
  // Loading states
  loading: {
    employees: boolean;
    products: boolean;
    tasks: boolean;
    batches: boolean;
    sessions: boolean;
    completions: boolean;
    qualityEvents: boolean;
    oeeCalculations: boolean;
  };
  
  // Last sync timestamps
  lastSync: {
    employees: string | null;
    products: string | null;
    tasks: string | null;
    batches: string | null;
    sessions: string | null;
    completions: string | null;
    qualityEvents: string | null;
    oeeCalculations: string | null;
  };
  
  // Actions - CRUD operations
  // Employees
  loadEmployees: () => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id' | 'created' | 'updated'>) => Promise<Employee>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  
  // Products
  loadProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'created' | 'updated'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Tasks
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'created' | 'updated'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Batches
  loadBatches: () => Promise<void>;
  addBatch: (batch: Omit<Batch, 'id' | 'created' | 'actualUnits'>) => Promise<Batch>;
  updateBatch: (id: string, updates: Partial<Batch>) => Promise<void>;
  closeBatch: (id: string) => Promise<void>;
  
  // Sessions
  loadSessions: () => Promise<void>;
  startSession: (session: Omit<Session, 'id' | 'startTime' | 'deviceId' | 'lamportTimestamp' | 'lastModified' | 'syncStatus'>) => Promise<Session>;
  endSession: (id: string, notes?: string) => Promise<void>;
  updateSession: (id: string, updates: Partial<Session>) => Promise<void>;
  
  // Completions
  loadCompletions: (dateRange?: [string, string]) => Promise<void>;
  addCompletion: (completion: Omit<Completion, 'id' | 'duration' | 'uph' | 'lamportTimestamp' | 'lastModified' | 'syncStatus'>) => Promise<Completion>;
  updateCompletion: (id: string, updates: Partial<Completion>) => Promise<void>;
  
  // Quality Events
  loadQualityEvents: () => Promise<void>;
  addQualityEvent: (event: Omit<QualityEvent, 'id' | 'timestamp'>) => Promise<QualityEvent>;
  
  // OEE Calculations
  loadOEECalculations: (dateRange?: [string, string]) => Promise<void>;
  calculateOEE: (date: string, shift: string) => Promise<OEECalculation>;
  
  // Utility functions
  getActiveEmployees: () => Employee[];
  getActiveProducts: () => Product[];
  getActiveTasks: () => Task[];
  getOpenBatches: () => Batch[];
  getActiveSessions: () => Session[];
  getCompletionsToday: () => Completion[];
  getTasksByProduct: (productId: string) => Task[];
  getBatchProgress: (batchId: string) => { produced: number; expected: number; percentage: number };
  getEmployeePerformanceToday: (employeeId: string) => {
    totalUnits: number;
    totalHours: number;
    averageEfficiency: number;
    completions: Completion[];
  };
  
  // Archive data
  archiveTodaysData: () => Promise<void>;
  
  // Refresh data
  refreshAll: () => Promise<void>;
  refreshEntity: (entity: keyof ProductionStoreState['loading']) => Promise<void>;
}

// ========================================
// STORE IMPLEMENTATION
// ========================================

export const useProductionStore = create<ProductionStoreState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      employees: [],
      products: [],
      tasks: [],
      batches: [],
      sessions: [],
      completions: [],
      qualityEvents: [],
      oeeCalculations: [],
      
      loading: {
        employees: false,
        products: false,
        tasks: false,
        batches: false,
        sessions: false,
        completions: false,
        qualityEvents: false,
        oeeCalculations: false
      },
      
      lastSync: {
        employees: null,
        products: null,
        tasks: null,
        batches: null,
        sessions: null,
        completions: null,
        qualityEvents: null,
        oeeCalculations: null
      },
      
      // Employee actions
      loadEmployees: async () => {
        set((state) => { state.loading.employees = true; });
        try {
          const employees = await db.employees.orderBy('name').toArray();
          set((state) => {
            state.employees = employees;
            state.lastSync.employees = new Date().toISOString();
            state.loading.employees = false;
          });
        } catch (error) {
          console.error('Failed to load employees:', error);
          set((state) => { state.loading.employees = false; });
        }
      },
      
      addEmployee: async (employeeData) => {
        const employee: Employee = {
          ...employeeData,
          id: crypto.randomUUID(),
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        };
        
        await db.employees.add(employee);
        set((state) => {
          state.employees.push(employee);
        });
        
        return employee;
      },
      
      updateEmployee: async (id, updates) => {
        const updatedData = {
          ...updates,
          updated: new Date().toISOString()
        };
        
        await db.employees.update(id, updatedData);
        set((state) => {
          const index = state.employees.findIndex((e: Employee) => e.id === id);
          if (index !== -1) {
            state.employees[index] = { ...state.employees[index], ...updatedData };
          }
        });
      },
      
      deleteEmployee: async (id) => {
        await db.employees.delete(id);
        set((state) => {
          state.employees = state.employees.filter((e: Employee) => e.id !== id);
        });
      },
      
      // Product actions
      loadProducts: async () => {
        set((state) => { state.loading.products = true; });
        try {
          const products = await db.products.orderBy('name').toArray();
          set((state) => {
            state.products = products;
            state.lastSync.products = new Date().toISOString();
            state.loading.products = false;
          });
        } catch (error) {
          console.error('Failed to load products:', error);
          set((state) => { state.loading.products = false; });
        }
      },
      
      addProduct: async (productData) => {
        const product: Product = {
          ...productData,
          id: crypto.randomUUID(),
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        };
        
        await db.products.add(product);
        set((state) => {
          state.products.push(product);
        });
        
        return product;
      },
      
      updateProduct: async (id, updates) => {
        const updatedData = {
          ...updates,
          updated: new Date().toISOString()
        };
        
        await db.products.update(id, updatedData);
        set((state) => {
          const index = state.products.findIndex((p: Product) => p.id === id);
          if (index !== -1) {
            state.products[index] = { ...state.products[index], ...updatedData };
          }
        });
      },
      
      deleteProduct: async (id) => {
        await db.products.delete(id);
        set((state) => {
          state.products = state.products.filter((p: Product) => p.id !== id);
        });
      },
      
      // Task actions
      loadTasks: async () => {
        set((state) => { state.loading.tasks = true; });
        try {
          const tasks = await db.tasks.orderBy('name').toArray();
          set((state) => {
            state.tasks = tasks;
            state.lastSync.tasks = new Date().toISOString();
            state.loading.tasks = false;
          });
        } catch (error) {
          console.error('Failed to load tasks:', error);
          set((state) => { state.loading.tasks = false; });
        }
      },
      
      addTask: async (taskData) => {
        const task: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        };
        
        await db.tasks.add(task);
        set((state) => {
          state.tasks.push(task);
        });
        
        return task;
      },
      
      updateTask: async (id, updates) => {
        const updatedData = {
          ...updates,
          updated: new Date().toISOString()
        };
        
        await db.tasks.update(id, updatedData);
        set((state) => {
          const index = state.tasks.findIndex((t: Task) => t.id === id);
          if (index !== -1) {
            state.tasks[index] = { ...state.tasks[index], ...updatedData };
          }
        });
      },
      
      deleteTask: async (id) => {
        await db.tasks.delete(id);
        set((state) => {
          state.tasks = state.tasks.filter((t: Task) => t.id !== id);
        });
      },
      
      // Batch actions
      loadBatches: async () => {
        set((state) => { state.loading.batches = true; });
        try {
          const batches = await db.batches.orderBy('created').reverse().toArray();
          set((state) => {
            state.batches = batches;
            state.lastSync.batches = new Date().toISOString();
            state.loading.batches = false;
          });
        } catch (error) {
          console.error('Failed to load batches:', error);
          set((state) => { state.loading.batches = false; });
        }
      },
      
      addBatch: async (batchData) => {
        const batch: Batch = {
          ...batchData,
          id: crypto.randomUUID(),
          actualUnits: 0,
          created: new Date().toISOString()
        };
        
        await db.batches.add(batch);
        set((state) => {
          state.batches.unshift(batch);
        });
        
        return batch;
      },
      
      updateBatch: async (id, updates) => {
        await db.batches.update(id, updates);
        set((state) => {
          const index = state.batches.findIndex((b: Batch) => b.id === id);
          if (index !== -1) {
            state.batches[index] = { ...state.batches[index], ...updates };
          }
        });
      },
      
      closeBatch: async (id) => {
        const updates = {
          status: 'Closed' as const,
          closed: new Date().toISOString()
        };
        
        await db.batches.update(id, updates);
        set((state) => {
          const index = state.batches.findIndex((b: Batch) => b.id === id);
          if (index !== -1) {
            state.batches[index] = { ...state.batches[index], ...updates };
          }
        });
      },
      
      // Session actions
      loadSessions: async () => {
        set((state) => { state.loading.sessions = true; });
        try {
          const sessions = await db.sessions.orderBy('startTime').reverse().toArray();
          set((state) => {
            state.sessions = sessions;
            state.lastSync.sessions = new Date().toISOString();
            state.loading.sessions = false;
          });
        } catch (error) {
          console.error('Failed to load sessions:', error);
          set((state) => { state.loading.sessions = false; });
        }
      },
      
      startSession: async (sessionData) => {
        const session: Session = {
          ...sessionData,
          id: crypto.randomUUID(),
          startTime: new Date().toISOString(),
          deviceId: localStorage.getItem('manufacturing_device_id') || crypto.randomUUID(),
          clockedOut: false,
          lamportTimestamp: Date.now(),
          lastModified: new Date().toISOString(),
          syncStatus: 'pending'
        };
        
        await db.sessions.add(session);
        set((state) => {
          state.sessions.unshift(session);
        });
        
        return session;
      },
      
      endSession: async (id, notes) => {
        const updates = {
          endTime: new Date().toISOString(),
          clockedOut: true,
          notes,
          lastModified: new Date().toISOString(),
          syncStatus: 'pending' as const
        };
        
        await db.sessions.update(id, updates);
        set((state) => {
          const index = state.sessions.findIndex((s: Session) => s.id === id);
          if (index !== -1) {
            state.sessions[index] = { ...state.sessions[index], ...updates };
          }
        });
      },
      
      updateSession: async (id, updates) => {
        const updatedData = {
          ...updates,
          lastModified: new Date().toISOString(),
          syncStatus: 'pending' as const
        };
        
        await db.sessions.update(id, updatedData);
        set((state) => {
          const index = state.sessions.findIndex((s: Session) => s.id === id);
          if (index !== -1) {
            state.sessions[index] = { ...state.sessions[index], ...updatedData };
          }
        });
      },
      
      // Completion actions
      loadCompletions: async (dateRange) => {
        set((state) => { state.loading.completions = true; });
        try {
          let query = db.completions.orderBy('startTime');
          
          if (dateRange) {
            query = query.filter(c => c.startTime >= dateRange[0] && c.startTime <= dateRange[1]);
          }
          
          const completions = await query.reverse().toArray();
          set((state) => {
            state.completions = completions;
            state.lastSync.completions = new Date().toISOString();
            state.loading.completions = false;
          });
        } catch (error) {
          console.error('Failed to load completions:', error);
          set((state) => { state.loading.completions = false; });
        }
      },
      
      addCompletion: async (completionData) => {
        const startTime = new Date(completionData.startTime);
        const endTime = new Date(completionData.endTime);
        const duration = endTime.getTime() - startTime.getTime();
        const hours = duration / (1000 * 60 * 60);
        const uph = hours > 0 ? completionData.quantity / hours : 0;
        
        const completion: Completion = {
          ...completionData,
          id: crypto.randomUUID(),
          duration,
          uph,
          lamportTimestamp: Date.now(),
          lastModified: new Date().toISOString(),
          syncStatus: 'pending'
        };
        
        await db.completions.add(completion);
        set((state) => {
          state.completions.unshift(completion);
          
          // Update batch actual units
          const batchIndex = state.batches.findIndex((b: Batch) => b.id === completion.batchId);
          if (batchIndex !== -1) {
            state.batches[batchIndex].actualUnits += completion.goodUnits;
          }
        });
        
        return completion;
      },
      
      updateCompletion: async (id, updates) => {
        const updatedData = {
          ...updates,
          lastModified: new Date().toISOString(),
          syncStatus: 'pending' as const
        };
        
        await db.completions.update(id, updatedData);
        set((state) => {
          const index = state.completions.findIndex((c: Completion) => c.id === id);
          if (index !== -1) {
            state.completions[index] = { ...state.completions[index], ...updatedData };
          }
        });
      },
      
      // Quality Event actions
      loadQualityEvents: async () => {
        set((state) => { state.loading.qualityEvents = true; });
        try {
          const events = await db.qualityEvents.orderBy('timestamp').reverse().toArray();
          set((state) => {
            state.qualityEvents = events;
            state.lastSync.qualityEvents = new Date().toISOString();
            state.loading.qualityEvents = false;
          });
        } catch (error) {
          console.error('Failed to load quality events:', error);
          set((state) => { state.loading.qualityEvents = false; });
        }
      },
      
      addQualityEvent: async (eventData) => {
        const event: QualityEvent = {
          ...eventData,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        };
        
        await db.qualityEvents.add(event);
        set((state) => {
          state.qualityEvents.unshift(event);
        });
        
        return event;
      },
      
      // OEE Calculation actions
      loadOEECalculations: async (dateRange) => {
        set((state) => { state.loading.oeeCalculations = true; });
        try {
          let query = db.oeeCalculations.orderBy('date');
          
          if (dateRange) {
            query = query.filter(calc => calc.date >= dateRange[0] && calc.date <= dateRange[1]);
          }
          
          const calculations = await query.reverse().toArray();
          set((state) => {
            state.oeeCalculations = calculations;
            state.lastSync.oeeCalculations = new Date().toISOString();
            state.loading.oeeCalculations = false;
          });
        } catch (error) {
          console.error('Failed to load OEE calculations:', error);
          set((state) => { state.loading.oeeCalculations = false; });
        }
      },
      
      calculateOEE: async (date, shift) => {
        // This is a placeholder - actual OEE calculation will be implemented in the OEE service
        const calculation: OEECalculation = {
          id: crypto.randomUUID(),
          date,
          shift,
          plannedProductionTime: 480, // 8 hours in minutes
          actualProductionTime: 0,
          downtime: 0,
          availability: 0,
          idealCycleTime: 0,
          totalUnitsProduced: 0,
          runTime: 0,
          performance: 0,
          goodUnits: 0,
          totalUnits: 0,
          quality: 0,
          oee: 0,
          calculated: new Date().toISOString(),
          batchIds: []
        };
        
        await db.oeeCalculations.add(calculation);
        set((state) => {
          state.oeeCalculations.unshift(calculation);
        });
        
        return calculation;
      },
      
      // Utility functions
      getActiveEmployees: () => {
        return get().employees.filter(e => e.active);
      },
      
      getActiveProducts: () => {
        return get().products.filter(p => p.active);
      },
      
      getActiveTasks: () => {
        return get().tasks;
      },
      
      getOpenBatches: () => {
        return get().batches.filter(b => b.status === 'Open' || b.status === 'InProgress');
      },
      
      getActiveSessions: () => {
        return get().sessions.filter(s => !s.clockedOut);
      },
      
      getCompletionsToday: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().completions.filter(c => c.startTime.startsWith(today));
      },
      
      getTasksByProduct: (productId) => {
        return get().tasks.filter(t => t.productId === productId);
      },
      
      getBatchProgress: (batchId) => {
        const state = get();
        const batch = state.batches.find(b => b.id === batchId);
        
        if (!batch) {
          return { produced: 0, expected: 0, percentage: 0 };
        }
        
        const produced = batch.actualUnits;
        const expected = batch.expectedUnits;
        const percentage = expected > 0 ? Math.min((produced / expected) * 100, 100) : 0;
        
        return { produced, expected, percentage };
      },
      
      getEmployeePerformanceToday: (employeeId) => {
        const completions = get().getCompletionsToday().filter(c => c.employeeId === employeeId);
        
        const totalUnits = completions.reduce((sum, c) => sum + c.quantity, 0);
        const totalHours = completions.reduce((sum, c) => sum + (c.duration / (1000 * 60 * 60)), 0);
        const averageEfficiency = completions.length > 0 
          ? completions.reduce((sum, c) => sum + c.efficiency, 0) / completions.length 
          : 0;
        
        return {
          totalUnits,
          totalHours,
          averageEfficiency,
          completions
        };
      },
      
      // Refresh functions
      refreshAll: async () => {
        const state = get();
        await Promise.all([
          state.loadEmployees(),
          state.loadProducts(),
          state.loadTasks(),
          state.loadBatches(),
          state.loadSessions(),
          state.loadCompletions(),
          state.loadQualityEvents(),
          state.loadOEECalculations()
        ]);
      },
      
      refreshEntity: async (entity) => {
        const state = get();
        switch (entity) {
          case 'employees':
            await state.loadEmployees();
            break;
          case 'products':
            await state.loadProducts();
            break;
          case 'tasks':
            await state.loadTasks();
            break;
          case 'batches':
            await state.loadBatches();
            break;
          case 'sessions':
            await state.loadSessions();
            break;
          case 'completions':
            await state.loadCompletions();
            break;
          case 'qualityEvents':
            await state.loadQualityEvents();
            break;
          case 'oeeCalculations':
            await state.loadOEECalculations();
            break;
        }
      },
      
      archiveTodaysData: async () => {
        const today = new Date().toISOString().split('T')[0];
        
        try {
          // Get today's data
          const todaysSessions = get().sessions.filter(s => s.startTime.startsWith(today));
          const todaysCompletions = get().completions.filter(c => c.startTime.startsWith(today));
          
          // Create archive entries (for now, we'll just clear the data)
          // In a full implementation, you might move this to an archive table
          
          // Remove today's data from the database
          for (const session of todaysSessions) {
            await db.sessions.delete(session.id);
          }
          
          for (const completion of todaysCompletions) {
            await db.completions.delete(completion.id);
          }
          
          // Update state to remove today's data
          set((state) => {
            state.sessions = state.sessions.filter(s => !s.startTime.startsWith(today));
            state.completions = state.completions.filter(c => !c.startTime.startsWith(today));
          });
          
          console.log(`Archived ${todaysSessions.length} sessions and ${todaysCompletions.length} completions`);
          
        } catch (error) {
          console.error('Failed to archive today\'s data:', error);
          throw error;
        }
      }
    }))
  )
);

// ========================================
// SELECTOR HOOKS
// ========================================

export const useEmployees = () => useProductionStore((state) => state.employees);
export const useProducts = () => useProductionStore((state) => state.products);
export const useTasks = () => useProductionStore((state) => state.tasks);
export const useBatches = () => useProductionStore((state) => state.batches);
export const useSessions = () => useProductionStore((state) => state.sessions);
export const useCompletions = () => useProductionStore((state) => state.completions);
export const useQualityEvents = () => useProductionStore((state) => state.qualityEvents);
export const useOEECalculations = () => useProductionStore((state) => state.oeeCalculations);

export const useActiveEmployees = () => useProductionStore((state) => state.getActiveEmployees());
export const useActiveProducts = () => useProductionStore((state) => state.getActiveProducts());
export const useActiveTasks = () => useProductionStore((state) => state.getActiveTasks());
export const useOpenBatches = () => useProductionStore((state) => state.getOpenBatches());
export const useActiveSessions = () => useProductionStore((state) => state.getActiveSessions());
export const useCompletionsToday = () => useProductionStore((state) => state.getCompletionsToday());

export const useProductionLoading = () => useProductionStore((state) => state.loading);
export const useProductionActions = () => useProductionStore((state) => ({
  // Employee actions
  loadEmployees: state.loadEmployees,
  addEmployee: state.addEmployee,
  updateEmployee: state.updateEmployee,
  deleteEmployee: state.deleteEmployee,
  
  // Product actions
  loadProducts: state.loadProducts,
  addProduct: state.addProduct,
  updateProduct: state.updateProduct,
  deleteProduct: state.deleteProduct,
  
  // Task actions
  loadTasks: state.loadTasks,
  addTask: state.addTask,
  updateTask: state.updateTask,
  deleteTask: state.deleteTask,
  
  // Batch actions
  loadBatches: state.loadBatches,
  addBatch: state.addBatch,
  updateBatch: state.updateBatch,
  closeBatch: state.closeBatch,
  
  // Session actions
  loadSessions: state.loadSessions,
  startSession: state.startSession,
  endSession: state.endSession,
  updateSession: state.updateSession,
  
  // Completion actions
  loadCompletions: state.loadCompletions,
  addCompletion: state.addCompletion,
  updateCompletion: state.updateCompletion,
  
  // Quality actions
  loadQualityEvents: state.loadQualityEvents,
  addQualityEvent: state.addQualityEvent,
  
  // OEE actions
  loadOEECalculations: state.loadOEECalculations,
  calculateOEE: state.calculateOEE,
  
  // Utility functions
  getTasksByProduct: state.getTasksByProduct,
  getBatchProgress: state.getBatchProgress,
  getEmployeePerformanceToday: state.getEmployeePerformanceToday,
  
  // Archive functions
  archiveTodaysData: state.archiveTodaysData,
  
  // Refresh functions
  refreshAll: state.refreshAll,
  refreshEntity: state.refreshEntity
}));