import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

/**
 * LESSON: Test Setup File
 *
 * This file runs before all tests and sets up the testing environment.
 * - Cleanup after each test to prevent memory leaks
 * - Import jest-dom matchers for better assertions
 * - Configure global test utilities
 * - Polyfill browser APIs not available in jsdom
 */

// Polyfill ResizeObserver for Radix UI components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Polyfill matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})