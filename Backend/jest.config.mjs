export default {
  testEnvironment: 'node',

  injectGlobals: false,

  transform: {
    '^.+\\.(js|mjs)$': ['@swc/jest']
  },

  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/__tests__/**/*.js'
  ],

  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  setupFilesAfterEnv: ['./tests/setup.mjs'],

  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/*.js'
  ],

  verbose: true,
  testTimeout: 10000,
  clearMocks: true,
  resetModules: true
};
