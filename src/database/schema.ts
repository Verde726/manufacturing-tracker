// Manufacturing Production Tracker - IndexedDB Schema
// Dexie database schema with versioning for production data

import Dexie, { type Table } from 'dexie';
import type {
  Employee,
  Product,
  Task,
  Batch,
  Session,
  Completion,
  QualityEvent,
  OEECalculation,
  Alert,
  AndonEvent,
  DailyArchive,
  ShiftHandoff,
  SyncQueueItem,
  ConflictLog,
  AuditEvent,
  MigrationStatus,
  AppConfig
} from '../types';

// ========================================
// DATABASE CLASS DEFINITION
// ========================================

export class ManufacturingDB extends Dexie {
  // Core entities
  employees!: Table<Employee>;
  products!: Table<Product>;
  tasks!: Table<Task>;
  batches!: Table<Batch>;
  
  // Production tracking
  sessions!: Table<Session>;
  completions!: Table<Completion>;
  qualityEvents!: Table<QualityEvent>;
  
  // Analytics and reporting
  oeeCalculations!: Table<OEECalculation>;
  dailyArchives!: Table<DailyArchive>;
  shiftHandoffs!: Table<ShiftHandoff>;
  
  // Alerts and notifications
  alerts!: Table<Alert>;
  andonEvents!: Table<AndonEvent>;
  
  // Sync and conflict resolution
  syncQueue!: Table<SyncQueueItem>;
  conflictLog!: Table<ConflictLog>;
  
  // Audit and compliance
  auditEvents!: Table<AuditEvent>;
  
  // System configuration
  migrations!: Table<MigrationStatus>;
  config!: Table<AppConfig>;

  constructor() {
    super('ManufacturingTracker');
    
    // ========================================
    // VERSION 1 - Initial Schema
    // ========================================
    this.version(1).stores({
      employees: '++id, name, role, shift, active, created',
      products: '++id, name, type, active, created',
      tasks: '++id, name, productId, quota, created',
      batches: '++id, name, productId, status, created, closed',
      sessions: '++id, employeeId, taskId, productId, batchId, startTime, endTime, clockedOut, syncStatus',
      completions: '++id, sessionId, employeeId, taskId, productId, batchId, startTime, endTime, syncStatus',
      qualityEvents: '++id, sessionId, batchId, employeeId, type, timestamp',
      oeeCalculations: '++id, date, shift, calculated',
      dailyArchives: '++id, date, timestamp, migratedFromLocalStorage',
      shiftHandoffs: '++id, fromShift, toShift, timestamp, status',
      alerts: '++id, type, severity, timestamp, acknowledged',
      andonEvents: '++id, workstation, employeeId, type, status, timestamp',
      syncQueue: '++id, entityType, entityId, operation, status, lamportTimestamp',
      conflictLog: '++id, entityType, entityId, timestamp, resolution',
      auditEvents: '++id, entityType, entityId, operation, employeeId, timestamp',
      migrations: '++id, version, migrationDate, success',
      config: '++version'
    });

    // ========================================
    // VERSION 2 - Enhanced Indexing
    // ========================================
    this.version(2).stores({
      employees: '++id, name, role, shift, active, created, updated',
      products: '++id, name, type, active, created, updated',
      tasks: '++id, name, productId, quota, created, updated',
      batches: '++id, name, lotCode, productId, status, created, closed',
      sessions: '++id, employeeId, taskId, productId, batchId, startTime, endTime, clockedOut, syncStatus, lamportTimestamp',
      completions: '++id, sessionId, employeeId, taskId, productId, batchId, startTime, endTime, syncStatus, lamportTimestamp',
      qualityEvents: '++id, sessionId, completionId, batchId, employeeId, type, timestamp, reason',
      oeeCalculations: '++id, date, shift, calculated, oee, availability, performance, quality',
      dailyArchives: '++id, date, timestamp, migratedFromLocalStorage, totalUnits, oee, fpy',
      shiftHandoffs: '++id, fromShift, toShift, timestamp, status, handedOffBy',
      alerts: '++id, type, severity, timestamp, acknowledged, employeeId, batchId',
      andonEvents: '++id, workstation, employeeId, type, status, timestamp, resolvedTimestamp',
      syncQueue: '++id, entityType, entityId, operation, status, lamportTimestamp, attempts',
      conflictLog: '++id, entityType, entityId, timestamp, resolution, resolvedBy',
      auditEvents: '++id, entityType, entityId, operation, employeeId, timestamp, [entityType+entityId]',
      migrations: '++id, version, migrationDate, success, recordsMigrated',
      config: '++version'
    });

    // ========================================
    // DATABASE HOOKS & MIDDLEWARE
    // ========================================
    
    // Auto-generate IDs and timestamps
    this.employees.hook('creating', this.addCreationMetadata);
    this.products.hook('creating', this.addCreationMetadata);
    this.tasks.hook('creating', this.addCreationMetadata);
    this.batches.hook('creating', this.addCreationMetadata);
    this.sessions.hook('creating', this.addSessionMetadata);
    this.completions.hook('creating', this.addCompletionMetadata);
    this.qualityEvents.hook('creating', this.addCreationMetadata);
    
    // Auto-update modified timestamps
    this.employees.hook('updating', this.addUpdateMetadata);
    this.products.hook('updating', this.addUpdateMetadata);
    this.tasks.hook('updating', this.addUpdateMetadata);
    this.batches.hook('updating', this.addUpdateMetadata);
    this.sessions.hook('updating', this.addSyncMetadata);
    this.completions.hook('updating', this.addSyncMetadata);
    
    // Audit logging for sensitive operations
    this.batches.hook('creating', this.logAuditEvent('create'));
    this.batches.hook('updating', this.logAuditEvent('update'));
    this.batches.hook('deleting', this.logAuditEvent('delete'));
    
    // Auto-queue for sync
    this.sessions.hook('creating', this.queueForSync('session', 'create'));
    this.sessions.hook('updating', this.queueForSync('session', 'update'));
    this.completions.hook('creating', this.queueForSync('completion', 'create'));
    this.completions.hook('updating', this.queueForSync('completion', 'update'));
  }

  // ========================================
  // HOOK IMPLEMENTATIONS
  // ========================================

  private addCreationMetadata = (_primKey: any, obj: any, _trans: any) => {
    if (!obj.id) {
      obj.id = this.generateId();
    }
    if (!obj.created) {
      obj.created = new Date().toISOString();
    }
    if (!obj.updated) {
      obj.updated = obj.created;
    }
  };

  private addUpdateMetadata = (modifications: any, _primKey: any, _obj: any, _trans: any) => {
    modifications.updated = new Date().toISOString();
  };

  private addSessionMetadata = (primKey: any, obj: any, trans: any) => {
    this.addCreationMetadata(primKey, obj, trans);
    if (!obj.deviceId) {
      obj.deviceId = this.getDeviceId();
    }
    if (!obj.lamportTimestamp) {
      obj.lamportTimestamp = this.getLamportTimestamp();
    }
    if (!obj.syncStatus) {
      obj.syncStatus = 'pending';
    }
  };

  private addCompletionMetadata = (primKey: any, obj: any, trans: any) => {
    this.addCreationMetadata(primKey, obj, trans);
    if (!obj.lamportTimestamp) {
      obj.lamportTimestamp = this.getLamportTimestamp();
    }
    if (!obj.syncStatus) {
      obj.syncStatus = 'pending';
    }
    
    // Calculate derived metrics
    if (obj.startTime && obj.endTime) {
      const start = new Date(obj.startTime);
      const end = new Date(obj.endTime);
      obj.duration = end.getTime() - start.getTime();
      
      const hours = obj.duration / (1000 * 60 * 60);
      obj.uph = hours > 0 ? obj.quantity / hours : 0;
    }
  };

  private addSyncMetadata = (modifications: any, _primKey: any, _obj: any, _trans: any) => {
    modifications.lastModified = new Date().toISOString();
    modifications.lamportTimestamp = this.getLamportTimestamp();
    modifications.syncStatus = 'pending';
  };

  private logAuditEvent = (operation: string) => {
    return async (primKey: any, obj: any, trans: any) => {
      // Only log if we have a current user context
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        const auditEvent = {
          id: this.generateId(),
          entityType: trans.table.name,
          entityId: obj.id || primKey,
          operation: operation as any,
          employeeId: currentUser.id,
          timestamp: new Date().toISOString(),
          metadata: {
            userAgent: navigator.userAgent,
            objectSnapshot: { ...obj }
          }
        };
        
        // Use a separate transaction to avoid conflicts
        setTimeout(() => {
          this.auditEvents.add(auditEvent).catch(console.error);
        }, 0);
      }
    };
  };

  private queueForSync = (entityType: string, operation: string) => {
    return async (primKey: any, obj: any, _trans: any) => {
      const syncItem: SyncQueueItem = {
        id: this.generateId(),
        entityType: entityType as any,
        entityId: obj.id || primKey,
        operation: operation as any,
        data: { ...obj },
        lamportTimestamp: this.getLamportTimestamp(),
        attempts: 0,
        status: 'pending'
      };

      // Use a separate transaction to avoid conflicts
      setTimeout(() => {
        this.syncQueue.add(syncItem).catch(console.error);
      }, 0);
    };
  };

  // ========================================
  // UTILITY METHODS
  // ========================================

  private generateId(): string {
    return crypto.randomUUID();
  }

  private getDeviceId(): string {
    let deviceId = localStorage.getItem('manufacturing_device_id');
    if (!deviceId) {
      deviceId = this.generateId();
      localStorage.setItem('manufacturing_device_id', deviceId);
    }
    return deviceId;
  }

  private getLamportTimestamp(): number {
    const current = parseInt(localStorage.getItem('lamport_timestamp') || '0');
    const next = Math.max(current + 1, Date.now());
    localStorage.setItem('lamport_timestamp', next.toString());
    return next;
  }

  private async getCurrentUser(): Promise<Employee | null> {
    const userId = localStorage.getItem('current_user_id');
    if (!userId) return null;
    
    try {
      return await this.employees.get(userId) || null;
    } catch {
      return null;
    }
  }

  // ========================================
  // QUERY HELPERS
  // ========================================

  async getActiveSessions(): Promise<Session[]> {
    return this.sessions
      .where('clockedOut')
      .equals(0)
      .toArray();
  }

  async getCompletionsByDateRange(startDate: string, endDate: string): Promise<Completion[]> {
    return this.completions
      .where('startTime')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  async getBatchProgress(batchId: string): Promise<{ produced: number; expected: number; percentage: number }> {
    const batch = await this.batches.get(batchId);
    if (!batch) {
      return { produced: 0, expected: 0, percentage: 0 };
    }

    const completions = await this.completions
      .where('batchId')
      .equals(batchId)
      .toArray();

    const produced = completions.reduce((sum, c) => sum + c.goodUnits, 0);
    const percentage = batch.expectedUnits > 0 ? (produced / batch.expectedUnits) * 100 : 0;

    return {
      produced,
      expected: batch.expectedUnits,
      percentage: Math.min(percentage, 100)
    };
  }

  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    return this.syncQueue
      .where('status')
      .equals('pending')
      .or('status')
      .equals('failed')
      .sortBy('lamportTimestamp');
  }

  async getEmployeePerformanceToday(employeeId: string): Promise<{
    totalUnits: number;
    totalHours: number;
    averageEfficiency: number;
    completions: Completion[];
  }> {
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = `${today}T00:00:00.000Z`;
    const endOfDay = `${today}T23:59:59.999Z`;

    const completions = await this.completions
      .where(['employeeId', 'startTime'])
      .between([employeeId, startOfDay], [employeeId, endOfDay], true, true)
      .toArray();

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
  }

  // ========================================
  // MIGRATION HELPERS
  // ========================================

  async migrateLegacyData(legacyData: any): Promise<MigrationStatus> {
    const migrationId = this.generateId();
    const migrationStart = new Date().toISOString();
    
    try {
      let recordsMigrated = 0;
      const errors: string[] = [];

      // Create backup
      const backupData = {
        version: '1.0',
        timestamp: migrationStart,
        data: legacyData
      };
      localStorage.setItem('manufacturing_backup_legacy', JSON.stringify(backupData));

      // Migrate employees
      if (legacyData.effTracker_adminData?.employees) {
        for (const emp of legacyData.effTracker_adminData.employees) {
          try {
            await this.employees.add({
              id: emp.id || this.generateId(),
              name: emp.name,
              role: emp.role || 'Operator',
              shift: emp.shift || 'Day',
              active: emp.active !== false,
              rbacRoles: ['operator'],
              created: emp.created || migrationStart,
              updated: migrationStart
            });
            recordsMigrated++;
          } catch (error) {
            errors.push(`Employee migration error: ${error}`);
          }
        }
      }

      // Migrate products
      if (legacyData.effTracker_adminData?.products) {
        for (const prod of legacyData.effTracker_adminData.products) {
          try {
            await this.products.add({
              id: prod.id || this.generateId(),
              name: prod.name,
              type: prod.type || 'Cartridge',
              active: prod.active !== false,
              created: prod.created || migrationStart,
              updated: migrationStart
            });
            recordsMigrated++;
          } catch (error) {
            errors.push(`Product migration error: ${error}`);
          }
        }
      }

      // Migrate tasks
      if (legacyData.effTracker_adminData?.tasks) {
        for (const task of legacyData.effTracker_adminData.tasks) {
          try {
            await this.tasks.add({
              id: task.id || this.generateId(),
              name: task.name,
              quota: task.quota || 100,
              productId: task.productId || '',
              created: task.created || migrationStart,
              updated: migrationStart
            });
            recordsMigrated++;
          } catch (error) {
            errors.push(`Task migration error: ${error}`);
          }
        }
      }

      // Migrate completed entries
      if (legacyData.effTracker_completedEntries) {
        for (const entry of legacyData.effTracker_completedEntries) {
          try {
            await this.completions.add({
              id: entry.id || this.generateId(),
              sessionId: entry.sessionId || this.generateId(),
              employeeId: entry.employeeId || '',
              taskId: entry.taskId || '',
              productId: entry.productId || '',
              batchId: entry.batchId || '',
              quantity: entry.quantity || 0,
              goodUnits: entry.goodUnits || entry.quantity || 0,
              scrapUnits: entry.scrapUnits || 0,
              reworkUnits: entry.reworkUnits || 0,
              startTime: entry.startTime || migrationStart,
              endTime: entry.endTime || migrationStart,
              duration: entry.duration || 0,
              uph: entry.uph || 0,
              efficiency: entry.efficiency || 0,
              defectCodes: [],
              lamportTimestamp: this.getLamportTimestamp(),
              lastModified: migrationStart,
              syncStatus: 'synced'
            });
            recordsMigrated++;
          } catch (error) {
            errors.push(`Completion migration error: ${error}`);
          }
        }
      }

      const migration: MigrationStatus = {
        id: migrationId,
        version: '1.0',
        migrationDate: migrationStart,
        success: errors.length === 0,
        recordsMigrated,
        errors,
        backupCreated: true,
        backupPath: 'localStorage.manufacturing_backup_legacy'
      };

      await this.migrations.add(migration);
      return migration;

    } catch (error) {
      const migration: MigrationStatus = {
        id: migrationId,
        version: '1.0',
        migrationDate: migrationStart,
        success: false,
        recordsMigrated: 0,
        errors: [`Migration failed: ${error}`],
        backupCreated: false
      };

      await this.migrations.add(migration);
      return migration;
    }
  }
}

// ========================================
// DATABASE INSTANCE
// ========================================

export const db = new ManufacturingDB();

// Handle database errors
db.open().catch(error => {
  console.error('Database initialization failed:', error);
  
  // Try to recover by deleting and recreating
  if (error.name === 'VersionError' || error.name === 'DatabaseError') {
    console.warn('Attempting database recovery...');
    db.delete().then(() => {
      window.location.reload();
    });
  }
});