# Quick Test Guide - AI Finance Tracker

## Run E2E Tests in 3 Steps

### Step 1: Start Backend Server
```bash
cd backend
npm run dev
```
Wait for "Server running on port 3000"

### Step 2: Open New Terminal and Run Tests
```bash
cd backend
npm run test:e2e
```

### Step 3: Review Results
You should see:
```
✓ E2E: AI Finance Tracker (35+ tests)
  ✓ User Authentication Flow
  ✓ Transaction Management Flow
  ✓ Budget Management and Alert Flow
  ✓ Analytics Flow
  ✓ AI Insights Flow
  ✓ Error Handling and Edge Cases
  ✓ Complete User Flow Integration
```

## What Gets Tested

✅ **User signup and login**
✅ **CSV upload** (bulk transactions)
✅ **Transaction CRUD** (create, read, update, delete)
✅ **Budget creation and tracking**
✅ **Alert generation** (80% warning, 100% critical)
✅ **AI insights** generation and export
✅ **Error handling** (validation, 404s, 401s)
✅ **Complete user journey** (signup → CSV → dashboard → budget → alerts → insights)

## Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run all unit tests (excluding E2E)
npm run test:unit

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/e2e/app.e2e.test.ts
```

## Requirements Tested

- ✅ Req 1.1 - CSV file upload
- ✅ Req 1.2 - Manual transaction entry
- ✅ Req 1.3 - Transaction storage
- ✅ Req 1.4 - Transaction viewing/modification
- ✅ Req 3.1 - Budget creation
- ✅ Req 4.1 - Budget progress tracking
- ✅ Req 8.1 - AI insights generation
- ✅ Req 10.1 - Insights export

## Mobile Testing

For mobile responsiveness testing, see:
📱 `MOBILE_TESTING_CHECKLIST.md`

Use browser DevTools (F12 → Device Toolbar) or test on real devices.

## Troubleshooting

**"Connection refused"**
→ Make sure backend is running on port 3000

**"Invalid API key"**
→ Check SUPABASE_URL and SUPABASE_ANON_KEY in .env

**Tests timeout**
→ Backend may be slow, increase timeout in vitest.config.ts

**AI tests fail**
→ AI service may be unavailable, check AI_AGENT_API_KEY

## More Information

- 📖 Full E2E docs: `backend/src/e2e/README.md`
- 📊 Coverage report: `backend/src/e2e/TEST_COVERAGE.md`
- 📝 Summary: `E2E_TESTING_SUMMARY.md`
- 📱 Mobile checklist: `MOBILE_TESTING_CHECKLIST.md`

## Need Help?

1. Check the README files in `backend/src/e2e/`
2. Review environment variables in `.env`
3. Ensure database schema is applied
4. Verify Supabase project is active

---

**Quick tip**: Tests create unique users per run, so you can run them multiple times without conflicts!
