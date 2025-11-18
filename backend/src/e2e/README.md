# End-to-End Tests

This directory contains end-to-end (E2E) tests for the AI Finance Tracker application.

## Overview

The E2E tests verify complete user flows through the application, including:

- **User Authentication**: Signup and login flows
- **Transaction Management**: Create, read, update, delete operations and CSV bulk upload
- **Budget Management**: Budget creation, progress tracking, and alert generation
- **Analytics**: Spending summaries, trends, and category breakdowns
- **AI Insights**: Generation and export of AI-powered financial insights
- **Error Handling**: Validation errors, 404s, unauthorized access
- **Complete User Journey**: Full flow from signup to insights export

## Requirements Tested

These tests cover the following requirements from the specification:

- **Req 1.1**: CSV file upload and parsing
- **Req 1.2**: Manual transaction entry
- **Req 1.3**: Transaction storage and retrieval
- **Req 1.4**: Transaction viewing and modification
- **Req 3.1**: Budget creation and management
- **Req 4.1**: Budget progress tracking
- **Req 8.1**: AI insights generation
- **Req 10.1**: Insights export functionality

## Prerequisites

Before running E2E tests, ensure:

1. **Backend server is running** on `http://localhost:3000` (or set `API_URL` env var)
2. **Supabase project is configured** with proper environment variables
3. **Database schema is applied** (see `backend/supabase/schema.sql`)
4. **Test user can be created** (tests will create a unique user per run)

## Environment Variables

Create a `.env.test` file in the backend directory with:

```env
API_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Or set these variables in your shell before running tests.

## Running E2E Tests

### Run all E2E tests

```bash
cd backend
npm run test -- src/e2e
```

### Run with watch mode (for development)

```bash
cd backend
npm run test:watch -- src/e2e
```

### Run specific test suite

```bash
cd backend
npm run test -- src/e2e/app.e2e.test.ts
```

### Run with verbose output

```bash
cd backend
npm run test -- src/e2e --reporter=verbose
```

## Test Structure

### Test Suites

1. **User Authentication Flow**
   - Sign up new user
   - Sign in with credentials

2. **Transaction Management Flow**
   - Create single transaction
   - Retrieve all transactions
   - Retrieve by ID
   - Update transaction
   - Filter by category and date
   - Bulk CSV upload
   - Delete transaction

3. **Budget Management and Alert Flow**
   - Create monthly budget
   - Retrieve budgets
   - Check budget progress
   - Trigger warning alert (80% threshold)
   - Trigger critical alert (100% threshold)
   - Update budget
   - Create custom period budget
   - Delete budget

4. **Analytics Flow**
   - Spending summary
   - Spending trends
   - Category breakdown

5. **AI Insights Flow**
   - Generate insights
   - Retrieve latest insights
   - Export insights

6. **Error Handling and Edge Cases**
   - Missing required fields
   - Negative amounts
   - Invalid date formats
   - Non-existent resources (404)
   - Unauthorized access (401)

7. **Complete User Flow Integration**
   - Full journey from signup to insights export

## Test Data

Tests create their own test data using:
- Unique email addresses (timestamped)
- Sample transactions across multiple categories
- Budgets with various configurations
- Date ranges for analytics

All test data is isolated per test run using unique user accounts.

## Cleanup

Tests attempt to clean up after themselves by:
- Signing out the test user
- Deleting created resources where possible

Note: Some test data may remain in the database. Consider using a separate test database or implementing a cleanup script.

## Troubleshooting

### Tests fail with "Connection refused"

- Ensure the backend server is running on the correct port
- Check `API_URL` environment variable

### Tests fail with "Invalid API key"

- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Supabase project is active

### Tests fail with "User already exists"

- Tests create unique users per run, but if interrupted, cleanup may not occur
- Manually delete test users from Supabase dashboard if needed

### Tests timeout

- Increase test timeout in `vitest.config.ts`:
  ```typescript
  test: {
    testTimeout: 30000, // 30 seconds
  }
  ```

### AI Insights tests fail

- Ensure AI Agent API is configured and accessible
- Check `AI_AGENT_API_KEY` environment variable
- AI service may have rate limits or be temporarily unavailable

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run E2E Tests
  env:
    API_URL: ${{ secrets.API_URL }}
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  run: |
    cd backend
    npm run test -- src/e2e
```

## Best Practices

1. **Run E2E tests against a test environment**, not production
2. **Use separate test database** to avoid polluting production data
3. **Run tests in isolation** - each test should be independent
4. **Clean up test data** after test runs
5. **Monitor test execution time** - E2E tests are slower than unit tests
6. **Use realistic test data** that mirrors production scenarios

## Mobile Responsiveness Testing

While these E2E tests focus on API functionality, mobile responsiveness should be tested separately using:

- Browser DevTools device emulation
- Real device testing
- Automated tools like Playwright or Cypress for frontend E2E tests

## Future Enhancements

Potential improvements for E2E testing:

- [ ] Add frontend E2E tests using Playwright/Cypress
- [ ] Test mobile-specific interactions
- [ ] Add performance benchmarks
- [ ] Test with large datasets (1000+ transactions)
- [ ] Add visual regression testing
- [ ] Test offline functionality
- [ ] Add accessibility testing
