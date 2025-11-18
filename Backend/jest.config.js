/**
 * Jest Configuration for ES Modules
 * Jest was originally built for CommonJS (require/module.exports).
 * Since we use ES Modules (import/export), we need to tell Jest how to handle them.
 *
 * Key settings:
 * - transform: {} - Don't transform code (we're using native ES modules)
 * - testEnvironment: 'node' - We're testing server code, not browser code
 * - extensionsToTreatAsEsm: ['.js'] - Treat .js files as ES modules
 */

export default {
  // Use Node.js environment (not browser)
  testEnvironment: 'node',

  // Don't transform code - we're using native ES modules
  transform: {},

  // Where to find test files
  // Looks for: *.test.js, *.spec.js, or files in __tests__ folders
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/__tests__/**/*.js'
  ],

  // Files to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  // Setup files to run before tests
  setupFilesAfterEnv: ['./tests/setup.js'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js', // Entry point, not much to test
    '!src/config/*.js' // Configuration files
  ],

  // Verbose output shows each test name
  verbose: true,

  // Timeout for each test (ms)
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,

  // Reset modules between tests (important for mocking)
  resetModules: true
};