// Manufacturing Production Tracker - Application State Store
// Main application state management with Zustand

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Employee, AppConfig } from '../types';

// ========================================
// APP STATE INTERFACE
// ========================================

interface AppStoreState {
  // Current application state
  currentUser: Employee | null;
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
    migration: boolean;
    barcode: boolean;
  };
  
  // Filters and search
  filters: {
    employee?: string;
    product?: string;
    batch?: string;
    dateRange?: [string, string];
    search?: string;
  };
  
  // Configuration
  config: AppConfig | null;
  
  // Initialization
  initialized: boolean;
  migrationCompleted: boolean;
  
  // Actions
  setCurrentUser: (user: Employee | null) => void;
  setCurrentShift: (shift: string) => void;
  setCurrentTab: (tab: string) => void;
  setFocusMode: (enabled: boolean) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncPending: (count: number) => void;
  
  setLoading: (key: keyof AppStoreState['loading'], loading: boolean) => void;
  
  setFilter: (key: keyof AppStoreState['filters'], value: any) => void;
  clearFilters: () => void;
  
  setConfig: (config: AppConfig) => void;
  updateConfig: (updates: Partial<AppConfig>) => void;
  
  setInitialized: (initialized: boolean) => void;
  setMigrationCompleted: (completed: boolean) => void;
  
  // Utilities
  getCurrentShiftInfo: () => { name: string; start: string; end: string } | null;
  isCurrentShift: (shift: string) => boolean;
  canAccessTab: (tab: string) => boolean;
}

// ========================================
// DEFAULT CONFIGURATION
// ========================================

const defaultConfig: AppConfig = {
  version: '1.0.0',
  
  shifts: {
    day: {
      start: '07:00',
      end: '15:30',
      name: 'Day Shift'
    },
    night: {
      start: '23:00',
      end: '07:00',
      name: 'Night Shift'
    },
    swing: {
      start: '15:30',
      end: '23:00',
      name: 'Swing Shift'
    }
  },
  
  thresholds: {
    lowEfficiency: 80,
    longSession: 240, // 4 hours
    highScrapRate: 5,
    oeeTarget: 85,
    fpyTarget: 95
  },
  
  sync: {
    enabled: true,
    retryAttempts: 3,
    retryDelay: 5000,
    batchSize: 50
  },
  
  barcode: {
    enabled: true,
    formats: ['QR_CODE', 'CODE_128', 'CODE_39'],
    timeout: 30000
  }
};

// ========================================
// STORE IMPLEMENTATION
// ========================================

export const useAppStore = create<AppStoreState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // Initial state
        currentUser: null,
        currentShift: 'day',
        currentTab: 'entry',
        focusMode: false,
        isOnline: navigator.onLine,
        syncPending: 0,
        
        loading: {
          sessions: false,
          completions: false,
          batches: false,
          sync: false,
          migration: false,
          barcode: false
        },
        
        filters: {},
        
        config: defaultConfig,
        
        initialized: false,
        migrationCompleted: false,
        
        // Actions
        setCurrentUser: (user) => set((state) => {
          state.currentUser = user;
        }),
        
        setCurrentShift: (shift) => set((state) => {
          state.currentShift = shift;
        }),
        
        setCurrentTab: (tab) => set((state) => {
          state.currentTab = tab;
        }),
        
        setFocusMode: (enabled) => set((state) => {
          state.focusMode = enabled;
        }),
        
        setOnlineStatus: (isOnline) => set((state) => {
          state.isOnline = isOnline;
        }),
        
        setSyncPending: (count) => set((state) => {
          state.syncPending = count;
        }),
        
        setLoading: (key, loading) => set((state) => {
          state.loading[key] = loading;
        }),
        
        setFilter: (key, value) => set((state) => {
          if (value === undefined || value === null || value === '') {
            delete state.filters[key];
          } else {
            state.filters[key] = value;
          }
        }),
        
        clearFilters: () => set((state) => {
          state.filters = {};
        }),
        
        setConfig: (config) => set((state) => {
          state.config = config;
        }),
        
        updateConfig: (updates) => set((state) => {
          if (state.config) {
            state.config = { ...state.config, ...updates };
          }
        }),
        
        setInitialized: (initialized) => set((state) => {
          state.initialized = initialized;
        }),
        
        setMigrationCompleted: (completed) => set((state) => {
          state.migrationCompleted = completed;
        }),
        
        // Utilities
        getCurrentShiftInfo: () => {
          const state = get();
          const shiftConfig = state.config?.shifts[state.currentShift];
          return shiftConfig || null;
        },
        
        isCurrentShift: (shift) => {
          const state = get();
          return state.currentShift === shift;
        },
        
        canAccessTab: (tab) => {
          const state = get();
          const user = state.currentUser;
          
          if (!user) return tab === 'entry'; // Only allow entry tab for non-authenticated users
          
          // Role-based tab access
          switch (tab) {
            case 'entry':
            case 'dashboard':
              return true;
            case 'batches':
              return user.rbacRoles.includes('lead') || user.rbacRoles.includes('supervisor');
            case 'admin':
              return user.rbacRoles.includes('admin') || user.rbacRoles.includes('supervisor');
            case 'reports':
              return user.rbacRoles.includes('lead') || user.rbacRoles.includes('supervisor') || user.rbacRoles.includes('admin');
            default:
              return false;
          }
        }
      })),
      {
        name: 'manufacturing-app-store',
        partialize: (state) => ({
          currentShift: state.currentShift,
          currentTab: state.currentTab,
          focusMode: state.focusMode,
          filters: state.filters,
          config: state.config,
          migrationCompleted: state.migrationCompleted
        })
      }
    )
  )
);

// ========================================
// BROWSER EVENT LISTENERS
// ========================================

// Online/offline status tracking
window.addEventListener('online', () => {
  useAppStore.getState().setOnlineStatus(true);
});

window.addEventListener('offline', () => {
  useAppStore.getState().setOnlineStatus(false);
});

// Initialize online status
useAppStore.getState().setOnlineStatus(navigator.onLine);

// ========================================
// STORE SUBSCRIPTIONS
// ========================================

// Auto-detect current shift based on time
const updateCurrentShift = () => {
  const state = useAppStore.getState();
  const config = state.config;
  
  if (!config) return;
  
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  let detectedShift = 'day'; // default
  
  for (const [shiftKey, shiftInfo] of Object.entries(config.shifts)) {
    const start = shiftInfo.start;
    const end = shiftInfo.end;
    
    // Handle overnight shifts (night shift)
    if (start > end) {
      if (currentTime >= start || currentTime < end) {
        detectedShift = shiftKey;
        break;
      }
    } else {
      if (currentTime >= start && currentTime < end) {
        detectedShift = shiftKey;
        break;
      }
    }
  }
  
  if (detectedShift !== state.currentShift) {
    state.setCurrentShift(detectedShift);
  }
};

// Update shift every minute
setInterval(updateCurrentShift, 60000);
updateCurrentShift(); // Initial check

// ========================================
// COMPUTED VALUES HOOKS
// ========================================

export const useCurrentUser = () => useAppStore((state) => state.currentUser);
export const useCurrentShift = () => useAppStore((state) => state.currentShift);
export const useCurrentTab = () => useAppStore((state) => state.currentTab);
export const useFocusMode = () => useAppStore((state) => state.focusMode);
export const useOnlineStatus = () => useAppStore((state) => state.isOnline);
export const useSyncPending = () => useAppStore((state) => state.syncPending);
export const useLoading = () => useAppStore((state) => state.loading);
export const useFilters = () => useAppStore((state) => state.filters);
export const useConfig = () => useAppStore((state) => state.config);
export const useInitialized = () => useAppStore((state) => state.initialized);
export const useMigrationCompleted = () => useAppStore((state) => state.migrationCompleted);

// Computed values
export const useCurrentShiftInfo = () => useAppStore((state) => state.getCurrentShiftInfo());
export const useCanAccessTab = (tab: string) => useAppStore((state) => state.canAccessTab(tab));

// ========================================
// ACTION HOOKS
// ========================================

export const useAppActions = () => useAppStore((state) => ({
  setCurrentUser: state.setCurrentUser,
  setCurrentShift: state.setCurrentShift,
  setCurrentTab: state.setCurrentTab,
  setFocusMode: state.setFocusMode,
  setOnlineStatus: state.setOnlineStatus,
  setSyncPending: state.setSyncPending,
  setLoading: state.setLoading,
  setFilter: state.setFilter,
  clearFilters: state.clearFilters,
  setConfig: state.setConfig,
  updateConfig: state.updateConfig,
  setInitialized: state.setInitialized,
  setMigrationCompleted: state.setMigrationCompleted
}));