
import { jest, afterAll } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '5001'; // Different port to avoid conflicts
process.env.FRONTEND_URL = 'http://localhost:3000';

// Mock environment variables that would come from .env
// These are fake values - tests shouldn't hit real services!
process.env.SUPABASE_URL = 'https://fake-project.supabase.co';
process.env.SUPABASE_KEY = 'fake-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake-service-role-key';
process.env.TICKETMASTER_KEY = 'fake-ticketmaster-key';


// Global test utilities
global.testUtils = {
  // Helper to create a valid signup payload
  createSignupPayload: (overrides = {}) => ({
    email: 'test@example.com',
    password: 'Test123!@#',
    firstName: 'John',
    lastName: 'Doe',
    zip: '12345',
    gender: 'male',
    bio: 'Test bio',
    interests: ['music', 'sports'],
    ...overrides
  }),

  // Helper to create questionnaire answers
  createQuestionnairePayload: (overrides = {}) => ({
    answers: {
      Extraversion: [3, 4, 3],
      'Emotional Stability': [4, 3, 4],
      Agreeableness: [4, 4, 3],
      Conscientiousness: [3, 4, 4],
      Openness: [5, 4, 5]
    },
    openEnded: 'Test response',
    ...overrides
  }),

  // Helper to create a mock user
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id-123',
    email: 'test@example.com',
    ...overrides
  })
};

// Increase timeout for async tests
jest.setTimeout(10000);

// Clean up after all tests
afterAll(() => {
  // Any global cleanup goes here
});