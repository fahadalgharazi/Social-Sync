# Testing Documentation

This document provides comprehensive information about the automated testing setup for the Social-Sync project.

## Table of Contents

- [Overview](#overview)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Writing New Tests](#writing-new-tests)

## Overview

Social-Sync uses industry-standard testing frameworks to ensure code quality and reliability:

- **Backend**: Jest + Supertest for API integration tests
- **Frontend**: Vitest + React Testing Library for component and unit tests

## Backend Testing

### Framework

- **Jest**: Test runner and assertion library
- **Supertest**: HTTP integration testing
- **@swc/jest**: Fast JavaScript/TypeScript transformation

### Test Structure

```
Backend/src/__tests__/
├── setup.js                        # Global test configuration
├── api/                            # API integration tests
│   ├── friends.api.test.js
│   ├── userEvents.api.test.js
│   └── groups.api.test.js
├── services/                       # Service layer tests
│   └── friends.service.test.js
├── validators/                     # Validator tests
│   └── validators.test.js
└── utils/                          # Utility function tests
    └── sanitize.test.js
```

### What We Test

1. **API Endpoints**
   - Request/response validation
   - Authentication and authorization
   - Error handling
   - Status codes

2. **Service Layer**
   - Business logic
   - Data transformations
   - Error scenarios

3. **Validators**
   - Input validation schemas
   - Edge cases
   - Invalid data rejection

4. **Utilities**
   - String sanitization
   - XSS prevention
   - Data normalization

### Example Test

```javascript
describe('Friends API Integration Tests', () => {
  it('should send a friend request successfully', async () => {
    const response = await request(app)
      .post('/friends/request')
      .send({ friendId: 'friend-id' })
      .expect(201);

    expect(response.body.success).toBe(true);
  });
});
```

## Frontend Testing

### Framework

- **Vitest**: Fast unit test framework (Vite-native)
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom matchers

### Test Structure

```
Frontend/src/__tests__/
├── setup.js                        # Global test configuration
├── components/                     # Component tests
│   └── EventCard.test.jsx
└── api/                            # API integration tests
    ├── userEventsApi.test.js
    └── friendsApi.test.js
```

### What We Test

1. **Components**
   - Rendering with props
   - User interactions (clicks, form submissions)
   - State changes
   - Conditional rendering
   - Event handlers

2. **API Functions**
   - HTTP requests with correct parameters
   - Response handling
   - Error handling
   - Data transformations

### Example Test

```javascript
it('should render event details correctly', () => {
  render(<EventCard event={mockEvent} />);

  expect(screen.getByText('Summer Music Festival')).toBeInTheDocument();
  expect(screen.getByText(/Central Park/)).toBeInTheDocument();
});
```

## Running Tests

### Backend Tests

```bash
cd Backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd Frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Test Coverage

### Coverage Goals

We aim for the following minimum coverage thresholds:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Viewing Coverage Reports

After running tests with coverage:

**Backend**: Open `Backend/coverage/index.html` in your browser

**Frontend**: Open `Frontend/coverage/index.html` in your browser

## Writing New Tests

### Best Practices

1. **Follow AAA Pattern**
   - **Arrange**: Set up test data and conditions
   - **Act**: Execute the code being tested
   - **Assert**: Verify the results

2. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Test from the user's perspective

3. **Use Descriptive Test Names**
   ```javascript
   // Good
   it('should display error message when email is invalid')

   // Bad
   it('test email validation')
   ```

4. **Keep Tests Independent**
   - Each test should run in isolation
   - Use `beforeEach` for setup
   - Clean up after tests

5. **Mock External Dependencies**
   - Mock API calls
   - Mock third-party libraries
   - Use test doubles for databases

### Backend Test Template

```javascript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup code
    jest.clearAllMocks();
  });

  it('should do something specific', async () => {
    // Arrange
    const testData = { key: 'value' };

    // Act
    const response = await request(app)
      .post('/endpoint')
      .send(testData)
      .expect(200);

    // Assert
    expect(response.body.success).toBe(true);
  });
});
```

### Frontend Test Template

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

describe('ComponentName', () => {
  it('should render correctly', () => {
    // Arrange
    const props = { title: 'Test' };

    // Act
    render(<ComponentName {...props} />);

    // Assert
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    // Arrange
    const handleClick = vi.fn();
    render(<ComponentName onClick={handleClick} />);

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Continuous Integration

Tests are automatically run on:
- Pull requests
- Commits to main branch
- Before deployments

Ensure all tests pass before merging code.

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module"
**Solution**: Ensure all dependencies are installed with `npm install`

**Issue**: Mock not working correctly
**Solution**: Check that mocks are defined before importing the modules they mock

**Issue**: Tests timeout
**Solution**: Increase timeout or check for missing async/await

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/ladjs/supertest)

## Contributing

When adding new features:
1. Write tests for new code
2. Ensure all existing tests pass
3. Maintain or improve code coverage
4. Follow the testing patterns in this guide
