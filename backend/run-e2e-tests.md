# Running End-to-End Tests

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Environment Variables

Create a `.env` file in the backend directory (or use existing one):

```env
# API Configuration
PORT=3000

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret

# AI Agent Configuration (optional for some tests)
AI_AGENT_API_KEY=your_ai_agent_key
```

### 3. Start the Backend Server

In one terminal:

```bash
cd backend
npm run dev
```

Wait for the server to start (you should see "Server running on port 3000").

### 4. Run E2E Tests

In another terminal:

```bash
cd backend
npm run test:e2e
```

## Test Commands

### Run all E2E tests
```bash
npm run test:e2e
```

### Run all unit tests (excluding E2E)
```bash
npm run test:unit
```

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run specific test file
```bash
npm test -- src/e2e/app.e2e.test.ts
```

## What Gets Tested

The E2E tests verify:

✅ **User Authentication**
- Sign up new users
- Sign in with credentials

✅ **Transaction Management** (Req 1.1, 1.2, 1.3, 1.4)
- Create transactions manually
- Upload CSV bulk transactions
- View and filter transactions
- Update and delete transactions

✅ **Budget Management** (Req 3.1, 4.1)
- Create monthly and custom budgets
- Track budget progress
- Generate alerts at 80% and 100% thresholds

✅ **Analytics**
- Spending summaries
- Spending trends
- Category breakdowns

✅ **AI Insights** (Req 8.1, 10.1)
- Generate AI-powered insights
- Export insights to text/PDF

✅ **Error Handling**
- Validation errors
- 404 errors
- Unauthorized access

✅ **Complete User Journey**
- Full flow: signup → CSV upload → view dashboard → create budget → alerts → AI insights → export

## Expected Output

Successful test run should show:

```
✓ E2E: AI Finance Tracker (XX tests)
  ✓ User Authentication Flow (2)
  ✓ Transaction Management Flow (9)
  ✓ Budget Management and Alert Flow (8)
  ✓ Analytics Flow (3)
  ✓ AI Insights Flow (3)
  ✓ Error Handling and Edge Cases (9)
  ✓ Complete User Flow Integration (1)

Test Files  1 passed (1)
     Tests  35 passed (35)
```

## Troubleshooting

### "Connection refused" error
- Make sure backend server is running on port 3000
- Check if another process is using port 3000

### "Invalid API key" error
- Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env
- Check Supabase project is active

### Tests timeout
- Backend server may be slow to respond
- Increase timeout in vitest.config.ts if needed

### AI Insights tests fail
- AI Agent API may not be configured
- Check AI_AGENT_API_KEY environment variable
- These tests may be skipped if AI service is unavailable

## CI/CD Integration

To run E2E tests in CI/CD:

1. Start backend server in background
2. Wait for server to be ready
3. Run tests
4. Stop server

Example GitHub Actions:

```yaml
- name: Start Backend
  run: |
    cd backend
    npm run dev &
    sleep 5

- name: Run E2E Tests
  run: |
    cd backend
    npm run test:e2e
```

## Notes

- E2E tests create real test users in Supabase
- Test data is isolated per test run using unique emails
- Tests attempt cleanup but some data may remain
- Consider using a separate test database for E2E tests
- E2E tests are slower than unit tests (expect 30-60 seconds)

## Mobile Responsiveness

API E2E tests verify backend functionality. For mobile UI testing:

1. Use browser DevTools device emulation
2. Test on real mobile devices
3. Consider Playwright/Cypress for frontend E2E tests

See `frontend/` directory for frontend-specific testing.
