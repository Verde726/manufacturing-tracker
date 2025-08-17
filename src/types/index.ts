// Manufacturing Production Tracker - Type Definitions
// ISA-95 compliant data model for manufacturing operations

// ========================================
// CORE ENTITY TYPES
// ========================================

export interface Employee {
  id: string;
  name: string;
  role: 'Operator' | 'Lead Operator' | 'Supervisor' | 'QA' | 'Manager';
  shift: 'Day' | 'Night' | 'Swing';
  active: boolean;
  rbacRoles: string[];
  created: string;
  updated: string;
}

export interface Product {
  id: string;
  name: string;
  type: 'Cartridge' | 'AIO Device' | 'Disposable' | 'Pod';
  active: boolean;
  created: string;
  updated: string;
}

export interface Task {
  id: string;
  name: string;
  quota: number; // units per hour
  productId: string;
  description?: string;
  standardCycleTime?: number; // seconds
  created: string;
  updated: string;
}

export interface Batch {
  id: string;
  name: string;
  lotCode?: string;
  productId: string;
  expectedUnits: number;
  actualUnits: number;
  status: 'Open' | 'InProgress' | 'Completed' | 'Closed' | 'OnHold';
  genealogy: string[]; // parent batch IDs
  created: string;
  closed?: string;
  notes?: string;
}

// ========================================
// PRODUCTION TRACKING TYPES
// ========================================

export interface Session {
  id: string;
  employeeId: string;
  taskId: string;
  productId: string;
  batchId: string;
  startTime: string;
  endTime?: string;
  deviceId: string;
  notes?: string;
  clockedOut: boolean;
  
  // Lamport timestamp for conflict resolution
  lamportTimestamp: number;
  lastModified: string;
  syncStatus: 'pending' | 'synced' | 'conflict';
}

export interface Completion {
  id: string;
  sessionId: string;
  employeeId: string;
  taskId: string;
  productId: string;
  batchId: string;
  
  // Production metrics
  quantity: number;
  goodUnits: number;
  scrapUnits: number;
  reworkUnits: number;
  
  // Time tracking
  startTime: string;
  endTime: string;
  duration: number; // milliseconds
  
  // Calculated metrics
  uph: number; // units per hour
  efficiency: number; // percentage vs quota
  
  // Quality tracking
  qualityReason?: string;
  defectCodes: string[];
  barcodeScan?: string;
  
  // Sync metadata
  lamportTimestamp: number;
  lastModified: string;
  syncStatus: 'pending' | 'synced' | 'conflict';
}

// ========================================
// QUALITY & OEE TYPES  
// ========================================

export interface QualityEvent {
  id: string;
  sessionId: string;
  completionId?: string;
  batchId: string;
  employeeId: string;
  
  type: 'scrap' | 'rework' | 'hold' | 'pass';
  reason: string;
  defectCode: string;
  quantity: number;
  
  timestamp: string;
  notes?: string;
  correctiveAction?: string;
}

export interface OEECalculation {
  id: string;
  date: string;
  shift: string;
  
  // Availability metrics
  plannedProductionTime: number; // minutes
  actualProductionTime: number; // minutes
  downtime: number; // minutes
  availability: number; // percentage
  
  // Performance metrics
  idealCycleTime: number; // seconds per unit
  totalUnitsProduced: number;
  runTime: number; // minutes
  performance: number; // percentage
  
  // Quality metrics
  goodUnits: number;
  totalUnits: number;
  quality: number; // percentage (FPY)
  
  // Overall OEE
  oee: number; // percentage
  
  calculated: string;
  batchIds: string[];
}

// ========================================
// ALERTS & NOTIFICATIONS
// ========================================

export interface Alert {
  id: string;
  type: 'efficiency' | 'downtime' | 'quality' | 'batch' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  employeeId?: string;
  batchId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface AndonEvent {
  id: string;
  workstation: string;
  employeeId: string;
  type: 'help' | 'maintenance' | 'quality' | 'material' | 'tooling';
  status: 'active' | 'acknowledged' | 'resolved';
  timestamp: string;
  resolvedTimestamp?: string;
  resolvedBy?: string;
  notes?: string;
}

// ========================================
// REPORTING & ANALYTICS
// ========================================

export interface DailyArchive {
  id: string;
  date: string;
  timestamp: string;
  
  // References to archived data
  completionIds: string[];
  sessionIds: string[];
  batchIds: string[];
  
  // Summary metrics
  totalUnits: number;
  totalHours: number;
  averageEfficiency: number;
  oee: number;
  fpy: number;
  
  // Shift data
  shiftNotes?: string;
  shiftHandoffs: ShiftHandoff[];
  
  // Migration flags
  migratedFromLocalStorage: boolean;
}

export interface ShiftHandoff {
  id: string;
  fromShift: string;
  toShift: string;
  timestamp: string;
  handedOffBy: string;
  receivedBy?: string;
  
  // Handoff details
  activeBatches: string[];
  openSessions: string[];
  pendingIssues: string[];
  notes: string;
  
  status: 'pending' | 'acknowledged' | 'completed';
}

// ========================================
// SYNC & CONFLICT RESOLUTION
// ========================================

export interface SyncQueueItem {
  id: string;
  entityType: 'session' | 'completion' | 'batch' | 'quality' | 'employee' | 'task' | 'product';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  lamportTimestamp: number;
  attempts: number;
  lastAttempt?: string;
  status: 'pending' | 'syncing' | 'success' | 'failed';
  error?: string;
}

export interface ConflictLog {
  id: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  
  localVersion: any;
  remoteVersion: any;
  resolution: 'local_wins' | 'remote_wins' | 'merged' | 'manual_required';
  resolvedBy?: string;
  notes?: string;
}

// ========================================
// RBAC & AUDIT
// ========================================

export interface AuditEvent {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete' | 'view' | 'export';
  employeeId: string;
  timestamp: string;
  changes?: Record<string, { from: any; to: any }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  description?: string;
}

// ========================================
// MIGRATION & LEGACY SUPPORT
// ========================================

export interface LegacyData {
  effTracker_adminData?: {
    employees: any[];
    tasks: any[];
    products: any[];
  };
  effTracker_activeSessions?: any[];
  effTracker_completedEntries?: any[];
  dailyHistory?: Record<string, any>;
}

export interface MigrationStatus {
  id: string;
  version: string;
  migrationDate: string;
  success: boolean;
  recordsMigrated: number;
  errors: string[];
  backupCreated: boolean;
  backupPath?: string;
}

// ========================================
// API & INTEGRATION TYPES
// ========================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

export interface ERPBatch {
  id: string;
  erpId: string;
  workOrder: string;
  materialRequirements: Array<{
    materialId: string;
    quantity: number;
    unit: string;
  }>;
  routingSteps: Array<{
    stepId: string;
    sequence: number;
    workCenter: string;
    standardTime: number;
  }>;
}

// ========================================
// UI STATE TYPES
// ========================================

export interface AppState {
  currentUser?: Employee;
  currentShift: string;
  currentTab: string;
  focusMode: boolean;
  isOnline: boolean;
  syncPending: number;
  
  // Loading states
  loading: {
    sessions: boolean;
    completions: boolean;
    batches: boolean;
    sync: boolean;
  };
  
  // Filters and search
  filters: {
    employee?: string;
    product?: string;
    batch?: string;
    dateRange?: [string, string];
  };
}

export interface NotificationState {
  alerts: Alert[];
  andonEvents: AndonEvent[];
  unreadCount: number;
}

// ========================================
// CONFIGURATION TYPES
// ========================================

export interface AppConfig {
  version: string;
  
  // Shift configuration
  shifts: {
    [key: string]: {
      start: string; // HH:MM format
      end: string;
      name: string;
    };
  };
  
  // Thresholds
  thresholds: {
    lowEfficiency: number; // percentage
    longSession: number; // minutes
    highScrapRate: number; // percentage
    oeeTarget: number; // percentage
    fpyTarget: number; // percentage
  };
  
  // Sync settings
  sync: {
    enabled: boolean;
    endpoint?: string;
    retryAttempts: number;
    retryDelay: number; // milliseconds
    batchSize: number;
  };
  
  // Barcode settings
  barcode: {
    enabled: boolean;
    formats: string[];
    timeout: number; // milliseconds
  };
}