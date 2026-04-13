# Unit Testing Guide

## Quick Start

### 1. Run Tests
```bash
npm test
```

### 2. Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### 3. Coverage Report
```bash
npm run test:coverage
```

## Test Structure

Tests are located in:
- `src/services/__tests__/` - Service layer tests
- `src/controllers/__tests__/` - Controller tests (optional)
- `src/utils/__tests__/` - Utility function tests (optional)

## Writing Tests

### Example: Service Test
```javascript
// src/services/__tests__/myService.test.js
import { myFunction } from '../myService.js';

describe('MyService', () => {
  test('should do something', () => {
    const result = myFunction();
    expect(result).toBe(expectedValue);
  });
});
```

### Example: API Endpoint Test (with supertest)
```javascript
// src/routes/__tests__/myRoute.test.js
import request from 'supertest';
import app from '../../app.js'; // You'll need to export app from server.js

describe('GET /api/endpoint', () => {
  test('should return 200', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });
});
```

## Testing Best Practices

1. **Test One Thing**: Each test should verify one specific behavior
2. **Descriptive Names**: Test names should clearly describe what's being tested
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mock External Dependencies**: Use mocks for database, APIs, etc.
5. **Edge Cases**: Test error cases, empty inputs, null values

## Running Specific Tests

```bash
# Run tests matching a pattern
npm test -- jobApplication

# Run tests in a specific file
npm test -- jobApplication.service.test.js
```

## Coverage Goals

- **Services**: 70%+ coverage
- **Controllers**: 50%+ coverage (focus on critical paths)
- **Utils**: 80%+ coverage

## Common Test Patterns

### Testing Async Functions
```javascript
test('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Error Cases
```javascript
test('should throw error on invalid input', () => {
  expect(() => {
    functionWithValidation(null);
  }).toThrow('Invalid input');
});
```

### Mocking Dependencies
```javascript
import { jest } from '@jest/globals';

jest.mock('../models/user.model.js', () => ({
  findById: jest.fn(),
}));
```

## Example Test Files to Create

1. **Priority 1 (Critical Business Logic)**:
   - `jobApplication.service.test.js` ✅ (created)
   - `auth.service.test.js`
   - `profile.service.test.js`

2. **Priority 2 (Important Features)**:
   - `job.service.test.js`
   - `post.service.test.js`
   - `notification.service.test.js`

3. **Priority 3 (Additional Coverage)**:
   - `bookmark.service.test.js`
   - `community.service.test.js`
   - `connection.service.test.js`

---

## For Demo: Quick Test Run

Since you're preparing for a demo, you can:

1. **Run the existing test**:
   ```bash
   npm test
   ```
   This will run the `calculateMatchScore` test we created.

2. **Show test coverage** (optional):
   ```bash
   npm run test:coverage
   ```

3. **Mention in demo**: 
   - "We have unit testing set up with Jest"
   - "Critical business logic like match score calculation is tested"
   - "We follow TDD principles for new features"

---

**Note**: For a demo, having at least one working test shows the testing infrastructure is in place. You can expand test coverage after the demo.

