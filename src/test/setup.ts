import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock IndexedDB for testing
import 'fake-indexeddb/auto'

// Mock crypto.randomUUID for testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => Math.random().toString(36).substr(2, 9)
  }
})

// Mock navigator for barcode scanning tests
Object.defineProperty(global, 'navigator', {
  value: {
    mediaDevices: {
      getUserMedia: vi.fn().mockResolvedValue({
        getVideoTracks: () => [{ stop: vi.fn() }]
      })
    },
    userAgent: 'test-agent'
  },
  writable: true
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock service worker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn().mockResolvedValue({ unregister: vi.fn() }),
    getRegistration: vi.fn().mockResolvedValue(undefined)
  },
  writable: true
})