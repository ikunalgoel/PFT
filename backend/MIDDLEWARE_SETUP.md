# Express Server Middleware Setup - Task 8

## Overview

This document describes the Express server middleware and routing setup implemented for the AI Finance Tracker backend.

## Implemented Features

### 1. Security Middleware

- **Helmet**: Adds security headers to protect against common vulnerabilities
  - XSS protection
  - Clickjacking prevention
  - Content Security Policy
  - And more...

### 2. CORS Configuration

- Configured to allow requests from frontend URL (configurable via `FRONTEND_URL` env var)
- Supports credentials for authentication
- Allows standard HTTP methods: GET, POST, PUT, DELETE, OPTIONS
- Allows Content-Type and Authorization headers

### 3. Body Parsing

- JSON body parser with 10MB limit (for CSV uploads)
- URL-encoded body parser with 10MB limit
- Prevents large payload attacks

### 4. Rate Limiting

Four different rate limiters implemented:

- **API Limiter**: 100 requests per 15 minutes (applied to all `/api/*` routes)
- **Strict Limiter**: 10 requests per 15 minutes (for sensitive operations)
- **AI Insights Limiter**: 5 requests per hour (for expensive AI operations)
- **Upload Limiter**: 10 uploads per hour (for bulk CSV uploads)

### 5. Authentication Middleware

- **authenticate**: Verifies JWT tokens from Supabase Auth
  - Extracts token from Authorization header
  - Validates with Supabase
  - Attaches user info to request object
  - Returns 401 for invalid/missing tokens

- **optionalAuthenticate**: Optional authentication for public endpoints

### 6. Error Handling

- **Global Error Handler**: Catches all errors and formats them consistently
  - Logs errors for debugging
  - Returns appropriate HTTP status codes
  - Includes error codes for client-side handling

- **404 Handler**: Catches requests to undefined routes

- **Async Handler**: Wrapper for async route handlers to catch errors automatically

- **AppError Class**: Custom error class with status codes and error codes

### 7. Health Check Endpoint

- **GET /health**: Returns server and database health status
  - Database connection status
  - Database latency
  - Supabase configuration info
  - Timestamp

### 8. API Routes

All routes are properly configured with:
- Authentication middleware
- Async error handling
- Rate limiting (where appropriate)
- Consistent error responses

Routes:
- `/api/transactions` - Transaction management
- `/api/budgets` - Budget management
- `/api/analytics` - Analytics and reporting
- `/api/insights` - AI insights generation

## Error Codes

Standardized error codes for consistent client-side handling:

- `VALIDATION_ERROR` (400): Invalid input data
- `NOT_FOUND` (404): Resource not found
- `UNAUTHORIZED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions
- `DATABASE_ERROR` (500): Database operation failed
- `AI_SERVICE_ERROR` (503): AI service unavailable
- `CSV_PARSE_ERROR` (400): CSV parsing failed
- `INTERNAL_ERROR` (500): Unexpected error

## Environment Variables

Required environment variables:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
AI_AGENT_API_KEY=your_ai_agent_api_key
```

## Middleware Order

The middleware is applied in the following order (important for proper functionality):

1. Helmet (security headers)
2. CORS
3. Body parsers (JSON, URL-encoded)
4. Rate limiting (for /api routes)
5. Health check endpoint
6. API routes
7. 404 handler
8. Global error handler (must be last)

## Files Created/Modified

### New Files:
- `src/middleware/errorHandler.ts` - Error handling middleware and custom error class
- `src/middleware/rateLimiter.ts` - Rate limiting configurations
- `src/middleware/index.ts` - Middleware exports
- `src/middleware/README.md` - Middleware documentation

### Modified Files:
- `src/index.ts` - Updated with all middleware and proper configuration
- `src/routes/transaction.routes.ts` - Updated to use asyncHandler and rate limiting
- `src/routes/budget.routes.ts` - Updated to use asyncHandler
- `src/routes/analytics.routes.ts` - Updated to use asyncHandler
- `src/routes/insights.routes.ts` - Updated to use asyncHandler and AI rate limiting
- `backend/.env` - Added FRONTEND_URL configuration
- `backend/.env.example` - Added FRONTEND_URL configuration

### Dependencies Added:
- `helmet` - Security middleware
- `express-rate-limit` - Rate limiting
- `@types/express-rate-limit` - TypeScript types
- `vitest` - Testing framework (dev dependency)

## Testing

To test the server setup:

1. Start the server:
   ```bash
   npm run dev
   ```

2. Check health endpoint:
   ```bash
   curl http://localhost:5000/health
   ```

3. Test rate limiting by making multiple requests to any API endpoint

4. Test authentication by making requests with and without Authorization header

## Security Best Practices Implemented

✅ Security headers via Helmet
✅ CORS configuration
✅ Rate limiting to prevent abuse
✅ JWT authentication
✅ Body size limits
✅ Global error handling
✅ Consistent error responses
✅ Environment variable configuration
✅ Database connection health checks

## Requirements Satisfied

This implementation satisfies the following requirements from the task:

- ✅ Configure Express app with CORS, body-parser, and security middleware
- ✅ Implement authentication middleware using Supabase JWT
- ✅ Set up API routes for transactions, budgets, analytics, and insights
- ✅ Add global error handling middleware
- ✅ Implement rate limiting for API endpoints
- ✅ Create /health endpoint for deployment health checks
- ✅ Requirements: 11.4 (secure HTTPS), 13.2 (database operations with error handling)
