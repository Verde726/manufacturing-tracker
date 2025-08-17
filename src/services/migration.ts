// Manufacturing Production Tracker - Data Migration Service
// Migrates data from legacy localStorage to IndexedDB schema

import { db } from '../database/schema';
import type { 
  Employee, 
  Product, 
  Task, 
  Batch, 
  Session, 
  Completion, 
  DailyArchive,
  MigrationStatus,
  LegacyData 
} from '../types';

// ========================================
// LEGACY DATA STRUCTURE INTERFACES
// ========================================

interface LegacyEmployee {
  id?: string;
  name: string;
  role?: string;
  shift?: string;
  active?: boolean;
  created?: string;
}

interface LegacyProduct {
  id?: string;
  name: string;
  type?: string;
  active?: boolean;
  created?: string;
}

interface LegacyTask {
  id?: string;
  name: string;
  quota?: number;
  productId?: string;
  created?: string;
}

// interface LegacyBatch {
//   id?: string;
//   name: string;
//   productId?: string;
//   expectedUnits?: number;
//   actualUnits?: number;
//   status?: string;
//   created?: string;
// }

interface LegacySession {
  id?: string;
  employeeId?: string;
  employeeName?: string;
  taskId?: string;
  taskName?: string;
  productId?: string;
  productName?: string;
  batchId?: string;
  batchName?: string;
  startTime?: string;
  endTime?: string;
  clockedOut?: boolean;
  notes?: string;
}

interface LegacyCompletion {
  id?: string;
  sessionId?: string;
  employeeId?: string;
  employeeName?: string;
  taskId?: string;
  taskName?: string;
  productId?: string;
  productName?: string;
  batchId?: string;
  batchName?: string;
  quantity?: number;
  goodUnits?: number;
  scrapUnits?: number;
  reworkUnits?: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  uph?: number;
  efficiency?: number;
  qualityReason?: string;
}

// ========================================
// MIGRATION SERVICE CLASS
// ========================================

export class MigrationService {
  private migrationDate: string;
  private deviceId: string;

  constructor() {
    this.migrationDate = new Date().toISOString();
    this.deviceId = this.getOrCreateDeviceId();
  }

  // ========================================
  // MAIN MIGRATION METHODS
  // ========================================

  async migrateLegacyData(): Promise<MigrationStatus> {
    console.log('🔄 Starting legacy data migration...');
    
    try {
      // Check if migration already completed
      const existingMigration = await this.checkExistingMigration();
      if (existingMigration) {
        console.log('✅ Migration already completed:', existingMigration);
        return existingMigration;
      }

      // Load legacy data from localStorage
      const legacyData = this.loadLegacyData();
      
      if (!this.hasLegacyData(legacyData)) {
        console.log('ℹ️ No legacy data found to migrate - fresh installation');
        const freshStatus = this.createMigrationStatus(true, 0, [], 'Fresh installation - no legacy data to migrate');
        
        // Save migration status to mark as complete for fresh installations
        try {
          await db.migrations.add(freshStatus);
        } catch (addError) {
          console.warn('Could not save migration status (fresh install):', addError);
        }
        
        return freshStatus;
      }

      // Create backup
      this.createBackup(legacyData);

      // Perform migration
      const result = await this.performMigration(legacyData);
      
      // Save migration status
      try {
        await db.migrations.add(result);
      } catch (addError) {
        console.warn('Could not save migration status (migrated data):', addError);
      }
      
      console.log('✅ Migration completed successfully:', result);
      return result;

    } catch (error) {
      console.error('❌ Migration failed:', error);
      const failedMigration = this.createMigrationStatus(false, 0, [String(error)], 'Migration failed - continuing with fresh initialization');
      
      try {
        await db.migrations.add(failedMigration);
      } catch (addError) {
        console.warn('Could not save failed migration status:', addError);
      }
      
      return failedMigration;
    }
  }

  private async performMigration(legacyData: LegacyData): Promise<MigrationStatus> {
    let recordsMigrated = 0;
    const errors: string[] = [];

    // Migrate employees first (dependencies)
    if (legacyData.effTracker_adminData?.employees) {
      const employeeResult = await this.migrateEmployees(legacyData.effTracker_adminData.employees);
      recordsMigrated += employeeResult.count;
      errors.push(...employeeResult.errors);
    }

    // Migrate products
    if (legacyData.effTracker_adminData?.products) {
      const productResult = await this.migrateProducts(legacyData.effTracker_adminData.products);
      recordsMigrated += productResult.count;
      errors.push(...productResult.errors);
    }

    // Migrate tasks
    if (legacyData.effTracker_adminData?.tasks) {
      const taskResult = await this.migrateTasks(legacyData.effTracker_adminData.tasks);
      recordsMigrated += taskResult.count;
      errors.push(...taskResult.errors);
    }

    // Create default batch if none exist
    const batchResult = await this.createDefaultBatch();
    recordsMigrated += batchResult.count;
    errors.push(...batchResult.errors);

    // Migrate active sessions
    if (legacyData.effTracker_activeSessions) {
      const sessionResult = await this.migrateSessions(legacyData.effTracker_activeSessions);
      recordsMigrated += sessionResult.count;
      errors.push(...sessionResult.errors);
    }

    // Migrate completed entries
    if (legacyData.effTracker_completedEntries) {
      const completionResult = await this.migrateCompletions(legacyData.effTracker_completedEntries);
      recordsMigrated += completionResult.count;
      errors.push(...completionResult.errors);
    }

    // Migrate daily history
    if (legacyData.dailyHistory) {
      const historyResult = await this.migrateDailyHistory(legacyData.dailyHistory);
      recordsMigrated += historyResult.count;
      errors.push(...historyResult.errors);
    }

    const success = errors.length === 0;
    return this.createMigrationStatus(success, recordsMigrated, errors);
  }

  // ========================================
  // ENTITY MIGRATION METHODS
  // ========================================

  private async migrateEmployees(employees: LegacyEmployee[]): Promise<{ count: number; errors: string[] }> {
    let count = 0;
    const errors: string[] = [];

    for (const legacyEmp of employees) {
      try {
        const employee: Employee = {
          id: legacyEmp.id || this.generateId(),
          name: legacyEmp.name || 'Unknown Employee',
          role: this.mapEmployeeRole(legacyEmp.role),
          shift: this.mapEmployeeShift(legacyEmp.shift),
          active: legacyEmp.active !== false,
          rbacRoles: ['operator'], // Default role
          created: legacyEmp.created || this.migrationDate,
          updated: this.migrationDate
        };

        await db.employees.add(employee);
        count++;
      } catch (error) {
        errors.push(`Employee migration error: ${error} (${JSON.stringify(legacyEmp)})`);
      }
    }

    return { count, errors };
  }

  private async migrateProducts(products: LegacyProduct[]): Promise<{ count: number; errors: string[] }> {
    let count = 0;
    const errors: string[] = [];

    for (const legacyProd of products) {
      try {
        const product: Product = {
          id: legacyProd.id || this.generateId(),
          name: legacyProd.name || 'Unknown Product',
          type: this.mapProductType(legacyProd.type),
          active: legacyProd.active !== false,
          created: legacyProd.created || this.migrationDate,
          updated: this.migrationDate
        };

        await db.products.add(product);
        count++;
      } catch (error) {
        errors.push(`Product migration error: ${error} (${JSON.stringify(legacyProd)})`);
      }
    }

    return { count, errors };
  }

  private async migrateTasks(tasks: LegacyTask[]): Promise<{ count: number; errors: string[] }> {
    let count = 0;
    const errors: string[] = [];

    for (const legacyTask of tasks) {
      try {
        const task: Task = {
          id: legacyTask.id || this.generateId(),
          name: legacyTask.name || 'Unknown Task',
          quota: legacyTask.quota || 100,
          productId: legacyTask.productId || await this.getDefaultProductId(),
          created: legacyTask.created || this.migrationDate,
          updated: this.migrationDate
        };

        await db.tasks.add(task);
        count++;
      } catch (error) {
        errors.push(`Task migration error: ${error} (${JSON.stringify(legacyTask)})`);
      }
    }

    return { count, errors };
  }

  private async createDefaultBatch(): Promise<{ count: number; errors: string[] }> {
    try {
      const defaultProductId = await this.getDefaultProductId();
      const batch: Batch = {
        id: this.generateId(),
        name: '20250816-DEFAULT',
        productId: defaultProductId,
        expectedUnits: 1000,
        actualUnits: 0,
        status: 'Open',
        genealogy: [],
        created: this.migrationDate
      };

      await db.batches.add(batch);
      return { count: 1, errors: [] };
    } catch (error) {
      return { count: 0, errors: [`Default batch creation error: ${error}`] };
    }
  }

  private async migrateSessions(sessions: LegacySession[]): Promise<{ count: number; errors: string[] }> {
    let count = 0;
    const errors: string[] = [];

    for (const legacySession of sessions) {
      try {
        const session: Session = {
          id: legacySession.id || this.generateId(),
          employeeId: legacySession.employeeId || await this.getDefaultEmployeeId(),
          taskId: legacySession.taskId || await this.getDefaultTaskId(),
          productId: legacySession.productId || await this.getDefaultProductId(),
          batchId: legacySession.batchId || await this.getDefaultBatchId(),
          startTime: legacySession.startTime || this.migrationDate,
          endTime: legacySession.endTime,
          deviceId: this.deviceId,
          notes: legacySession.notes,
          clockedOut: legacySession.clockedOut || false,
          lamportTimestamp: this.getLamportTimestamp(),
          lastModified: this.migrationDate,
          syncStatus: 'synced'
        };

        await db.sessions.add(session);
        count++;
      } catch (error) {
        errors.push(`Session migration error: ${error} (${JSON.stringify(legacySession)})`);
      }
    }

    return { count, errors };
  }

  private async migrateCompletions(completions: LegacyCompletion[]): Promise<{ count: number; errors: string[] }> {
    let count = 0;
    const errors: string[] = [];

    for (const legacyCompletion of completions) {
      try {
        const completion: Completion = {
          id: legacyCompletion.id || this.generateId(),
          sessionId: legacyCompletion.sessionId || this.generateId(),
          employeeId: legacyCompletion.employeeId || await this.getDefaultEmployeeId(),
          taskId: legacyCompletion.taskId || await this.getDefaultTaskId(),
          productId: legacyCompletion.productId || await this.getDefaultProductId(),
          batchId: legacyCompletion.batchId || await this.getDefaultBatchId(),
          quantity: legacyCompletion.quantity || 0,
          goodUnits: legacyCompletion.goodUnits || legacyCompletion.quantity || 0,
          scrapUnits: legacyCompletion.scrapUnits || 0,
          reworkUnits: legacyCompletion.reworkUnits || 0,
          startTime: legacyCompletion.startTime || this.migrationDate,
          endTime: legacyCompletion.endTime || this.migrationDate,
          duration: legacyCompletion.duration || 0,
          uph: legacyCompletion.uph || 0,
          efficiency: legacyCompletion.efficiency || 0,
          qualityReason: legacyCompletion.qualityReason,
          defectCodes: [],
          lamportTimestamp: this.getLamportTimestamp(),
          lastModified: this.migrationDate,
          syncStatus: 'synced'
        };

        await db.completions.add(completion);
        count++;
      } catch (error) {
        errors.push(`Completion migration error: ${error} (${JSON.stringify(legacyCompletion)})`);
      }
    }

    return { count, errors };
  }

  private async migrateDailyHistory(history: Record<string, any>): Promise<{ count: number; errors: string[] }> {
    let count = 0;
    const errors: string[] = [];

    for (const [date, dayData] of Object.entries(history)) {
      try {
        const archive: DailyArchive = {
          id: this.generateId(),
          date: date,
          timestamp: dayData.timestamp || this.migrationDate,
          completionIds: dayData.completionIds || [],
          sessionIds: dayData.sessionIds || [],
          batchIds: dayData.batchIds || [],
          totalUnits: dayData.totalUnits || 0,
          totalHours: dayData.totalHours || 0,
          averageEfficiency: dayData.averageEfficiency || 0,
          oee: dayData.oee || 0,
          fpy: dayData.fpy || 100,
          shiftNotes: dayData.shiftNotes,
          shiftHandoffs: dayData.shiftHandoffs || [],
          migratedFromLocalStorage: true
        };

        await db.dailyArchives.add(archive);
        count++;
      } catch (error) {
        errors.push(`Daily history migration error: ${error} (${date})`);
      }
    }

    return { count, errors };
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  private loadLegacyData(): LegacyData {
    return {
      effTracker_adminData: this.parseLocalStorageJSON('effTracker_adminData'),
      effTracker_activeSessions: this.parseLocalStorageJSON('effTracker_activeSessions'),
      effTracker_completedEntries: this.parseLocalStorageJSON('effTracker_completedEntries'),
      dailyHistory: this.parseLocalStorageJSON('dailyHistory')
    };
  }

  private parseLocalStorageJSON(key: string): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn(`Failed to parse localStorage key ${key}:`, error);
      return null;
    }
  }

  private hasLegacyData(data: LegacyData): boolean {
    return !!(
      data.effTracker_adminData ||
      data.effTracker_activeSessions ||
      data.effTracker_completedEntries ||
      data.dailyHistory
    );
  }

  private createBackup(legacyData: LegacyData): void {
    const backup = {
      version: '1.0',
      timestamp: this.migrationDate,
      deviceId: this.deviceId,
      data: legacyData
    };

    localStorage.setItem('manufacturing_backup_legacy', JSON.stringify(backup));
    console.log('💾 Legacy data backup created');
  }

  private async checkExistingMigration(): Promise<MigrationStatus | null> {
    try {
      const migrations = await db.migrations.orderBy('migrationDate').reverse().limit(1).toArray();
      return migrations.length > 0 ? migrations[0] : null;
    } catch {
      return null;
    }
  }

  private createMigrationStatus(
    success: boolean, 
    recordsMigrated: number, 
    errors: string[], 
    _notes?: string
  ): MigrationStatus {
    return {
      id: this.generateId(),
      version: '1.0',
      migrationDate: this.migrationDate,
      success,
      recordsMigrated,
      errors,
      backupCreated: true,
      backupPath: 'localStorage.manufacturing_backup_legacy'
    };
  }

  // ========================================
  // MAPPING METHODS
  // ========================================

  private mapEmployeeRole(role?: string): Employee['role'] {
    switch (role?.toLowerCase()) {
      case 'lead operator':
      case 'lead':
        return 'Lead Operator';
      case 'supervisor':
      case 'super':
        return 'Supervisor';
      case 'qa':
      case 'quality':
        return 'QA';
      case 'manager':
        return 'Manager';
      default:
        return 'Operator';
    }
  }

  private mapEmployeeShift(shift?: string): Employee['shift'] {
    switch (shift?.toLowerCase()) {
      case 'night':
      case 'nights':
        return 'Night';
      case 'swing':
      case 'evening':
        return 'Swing';
      default:
        return 'Day';
    }
  }

  private mapProductType(type?: string): Product['type'] {
    switch (type?.toLowerCase()) {
      case 'aio device':
      case 'aio':
        return 'AIO Device';
      case 'disposable':
      case 'disposables':
        return 'Disposable';
      case 'pod':
      case 'pods':
        return 'Pod';
      default:
        return 'Cartridge';
    }
  }

  // ========================================
  // ID GENERATION & RETRIEVAL
  // ========================================

  private generateId(): string {
    return crypto.randomUUID();
  }

  private getOrCreateDeviceId(): string {
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

  private async getDefaultEmployeeId(): Promise<string> {
    const employees = await db.employees.limit(1).toArray();
    if (employees.length > 0) {
      return employees[0].id;
    }
    
    // Create default employee
    const defaultEmployee: Employee = {
      id: this.generateId(),
      name: 'Default Operator',
      role: 'Operator',
      shift: 'Day',
      active: true,
      rbacRoles: ['operator'],
      created: this.migrationDate,
      updated: this.migrationDate
    };
    
    await db.employees.add(defaultEmployee);
    return defaultEmployee.id;
  }

  private async getDefaultProductId(): Promise<string> {
    const products = await db.products.limit(1).toArray();
    if (products.length > 0) {
      return products[0].id;
    }
    
    // Create default product
    const defaultProduct: Product = {
      id: this.generateId(),
      name: 'Default Product',
      type: 'Cartridge',
      active: true,
      created: this.migrationDate,
      updated: this.migrationDate
    };
    
    await db.products.add(defaultProduct);
    return defaultProduct.id;
  }

  private async getDefaultTaskId(): Promise<string> {
    const tasks = await db.tasks.limit(1).toArray();
    if (tasks.length > 0) {
      return tasks[0].id;
    }
    
    // Create default task
    const defaultTask: Task = {
      id: this.generateId(),
      name: 'Default Task',
      quota: 100,
      productId: await this.getDefaultProductId(),
      created: this.migrationDate,
      updated: this.migrationDate
    };
    
    await db.tasks.add(defaultTask);
    return defaultTask.id;
  }

  private async getDefaultBatchId(): Promise<string> {
    const batches = await db.batches.limit(1).toArray();
    if (batches.length > 0) {
      return batches[0].id;
    }
    
    // This will be created by createDefaultBatch
    return this.generateId();
  }
}

// ========================================
// EXPORT SINGLETON
// ========================================

export const migrationService = new MigrationService();