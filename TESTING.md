# Testing Documentation

This document provides comprehensive information about the automated testing system for the Integrated Management System.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Backend Tests](#backend-tests)
- [Frontend Tests](#frontend-tests)
- [Test Coverage](#test-coverage)
- [Writing New Tests](#writing-new-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The Integrated Management System uses a comprehensive testing suite with:

- **Backend Testing**: Jest + Supertest for API testing
- **Frontend Testing**: Jest + React Testing Library for component testing
- **Coverage Reporting**: Built-in coverage reports for both backend and frontend

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (for backend tests)
- Git

## Installation

### Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### Test Database Setup

Backend tests require a test database. Configure your test database in `.env.test`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=sim_tech_test
```

Run migrations on test database:

```bash
NODE_ENV=test npx knex migrate:latest
```

## Running Tests

### Run All Tests

```bash
# Run all tests (backend + frontend)
npm test
```

### Run Backend Tests Only

```bash
# From root directory
npm test -- server/tests
```

### Run Frontend Tests Only

```bash
# From client directory
cd client
npm test
```

### Run Specific Test File

```bash
# Backend
npm test -- server/tests/auth.test.js

# Frontend
cd client
npm test -- src/tests/Login.test.jsx
```

### Run Tests in Watch Mode

```bash
# Backend watch mode
npm test -- --watch

# Frontend watch mode
cd client
npm test -- --watch
```

### Generate Coverage Report

```bash
# Backend coverage
npm test -- --coverage

# Frontend coverage
cd client
npm test -- --coverage
```

Coverage reports are generated in the `coverage/` directory.

## Backend Tests

### Test Structure

```
server/tests/
├── setup.js                 # Test setup and teardown
├── auth.test.js             # JWT and password hashing tests
├── auth.api.test.js         # Authentication API tests
├── user.test.js             # User CRUD tests
├── student.test.js          # Student CRUD tests
├── parentAccess.test.js     # Parent access control tests
├── teacherAccess.test.js    # Teacher access control tests
├── fees.test.js             # Fees API tests
├── helpdesk.test.js         # HelpDesk messaging tests
└── notifications.test.js    # Notifications API tests
```

### Backend Test Coverage

#### Authentication Tests (`auth.test.js`, `auth.api.test.js`)
- JWT token generation and verification
- Refresh token generation and verification
- Password hashing with bcrypt
- Password comparison
- Login API endpoint
- Forgot password API endpoint
- Reset password API endpoint
- User profile retrieval

#### User CRUD Tests (`user.test.js`)
- Create user
- Read users (all and by ID)
- Update user
- Delete user
- Duplicate email prevention
- Authentication requirements

#### Student CRUD Tests (`student.test.js`)
- Create student
- Read students (all and by ID)
- Update student
- Delete student
- Duplicate student_id prevention

#### Parent Access Tests (`parentAccess.test.js`)
- Parent accessing their children's data
- Parent denied access to non-children
- Parent API endpoints (my-children)

#### Teacher Access Tests (`teacherAccess.test.js`)
- Teacher accessing class performance
- Teacher entering grades
- Teacher access control

#### Fees API Tests (`fees.test.js`)
- Fee categories CRUD
- Tuition structures
- Invoices
- Payments

#### HelpDesk Tests (`helpdesk.test.js`)
- Create ticket
- Read tickets
- Add message to ticket
- Update ticket status
- Authentication requirements

#### Notifications Tests (`notifications.test.js`)
- Get notifications
- Unread count
- Mark as read
- Mark all as read
- Delete notification

## Frontend Tests

### Test Structure

```
client/src/tests/
├── setup.js                 # Test setup and mocks
├── Login.test.jsx           # Login component tests
├── Dashboard.test.jsx       # Dashboard and permissions tests
├── Forms.test.jsx           # Form validation and submission tests
├── Navigation.test.jsx      # Navigation tests
└── ErrorHandling.test.jsx   # Error handling tests
```

### Frontend Test Coverage

#### Login Tests (`Login.test.jsx`)
- Form rendering
- Validation errors (empty fields, invalid email)
- API calls with correct credentials
- Error message display on failed login
- Forgot password navigation

#### Dashboard Tests (`Dashboard.test.jsx`)
- Dashboard rendering for different roles
- Admin-specific features
- Teacher-specific features
- Student-specific features
- Parent-specific features
- Role-based access control

#### Form Tests (`Forms.test.jsx`)
- Required field validation
- Email format validation
- Password length validation
- Form submission with valid data
- Form submission prevention with invalid data
- Form reset functionality

#### Navigation Tests (`Navigation.test.jsx`)
- Route navigation
- Protected route redirects
- Dashboard navigation links
- Back button functionality
- Logout functionality

#### Error Handling Tests (`ErrorHandling.test.jsx`)
- 401 unauthorized error handling
- 403 forbidden error handling
- 404 not found error handling
- 500 server error handling
- Network error handling
- Form error display
- Loading states

## Test Coverage

### Current Coverage

- **Backend**: ~70% coverage of controllers and routes
- **Frontend**: ~60% coverage of components

### Coverage Goals

- **Backend**: Target 80%+ coverage
- **Frontend**: Target 75%+ coverage

### View Coverage Report

```bash
# Generate and view coverage
npm test -- --coverage
open coverage/lcov-report/index.html
```

## Writing New Tests

### Backend Test Template

```javascript
const request = require('supertest');
const app = require('../index');
const { db } = require('../config/database');

describe('Feature Name', () => {
  let testRecord;
  let authToken;

  beforeAll(async () => {
    // Setup: Create test data
    const hashedPassword = await require('bcryptjs').hash('TestPassword123!', 10);
    const [role] = await db('roles').where('name', 'admin').select('id').first();
    
    const [user] = await db('users').insert({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      password: hashedPassword,
      role_id: role.id,
      school_id: 'test-school-id',
      is_active: true
    }).returning('*');

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123!'
      });
    authToken = loginRes.body.data.token;
  });

  afterAll(async () => {
    // Cleanup: Remove test data
    await db('users').where('email', 'like', 'test%@example.com').del();
  });

  describe('POST /api/endpoint', () => {
    it('should create resource', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // request body
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });
});
```

### Frontend Test Template

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ComponentName from '../pages/ComponentName';
import axios from '../utils/axios';

jest.mock('../utils/axios');

describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders component', () => {
    render(
      <BrowserRouter>
        <ComponentName />
      </BrowserRouter>
    );

    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    render(
      <BrowserRouter>
        <ComponentName />
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /button text/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/expected result/i)).toBeInTheDocument();
    });
  });
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run backend tests
        run: npm test -- server/tests
        env:
          DB_HOST: localhost
          DB_USER: postgres
          DB_PASSWORD: postgres
          DB_NAME: postgres
          NODE_ENV: test
      
      - name: Run frontend tests
        run: cd client && npm test
```

## Troubleshooting

### Common Issues

#### Database Connection Errors

**Problem**: Tests fail with database connection error

**Solution**:
1. Ensure PostgreSQL is running
2. Check `.env.test` configuration
3. Run migrations: `NODE_ENV=test npx knex migrate:latest`

#### Port Already in Use

**Problem**: Tests fail because server is already running

**Solution**:
```bash
# Kill process on port 3000
npx kill-port 3000
```

#### Timeout Errors

**Problem**: Tests timeout after 5 seconds

**Solution**: Increase timeout in jest config:
```javascript
jest.setTimeout(10000); // 10 seconds
```

#### Mock Issues

**Problem**: Axios mocks not working

**Solution**: Ensure mocks are cleared before each test:
```javascript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Debugging Tests

#### Run Tests in Debug Mode

```bash
# Backend
node --inspect-brk node_modules/.bin/jest --runInBand

# Frontend
cd client
node --inspect-brk node_modules/.bin/jest --runInBand
```

#### Verbose Output

```bash
npm test -- --verbose
```

#### Run Specific Test

```bash
npm test -- --testNamePattern="should create resource"
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up test data in `afterAll` or `afterEach`
3. **Descriptive Names**: Use clear, descriptive test names
4. **Arrange-Act-Assert**: Structure tests with AAA pattern
5. **Mock External Services**: Mock API calls, database, etc.
6. **Test Edge Cases**: Test both happy paths and error cases
7. **Keep Tests Fast**: Avoid unnecessary delays in tests
8. **Update Tests**: Update tests when code changes

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
