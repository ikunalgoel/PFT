# Middleware Documentation

This directory contains all Express middleware used in the AI Finance Tracker backend.

## Available Middleware

### Authentication (`auth.ts`)

- **`authenticate`**: Required authentication middleware that verifies JWT tokens from Supabase
  - Extracts token from `Authorization: Bearer <token>` header
  - Verifies token with Supabase Auth
  - Attaches user info to `req.user`
  - Returns 401 if token is missing or invalid

- **`optionalAuthenticate`**: Optional authentication middleware
  - Attaches user info if token is present
  - Continues without user info if token is missing
  - Useful for public endpoints that can benefit from user context

### Error Handling (`errorHandler.ts`)

- **`errorHandler`**: Global error handling middleware
  - Catches all errors from route handlers
  - Formats errors consistently with error codes
  - Logs errors for debugging
  - Returns appropriate HTTP status codes

- **`notFoundHandler`**: 404 handler for undefined routes
  - Returns consistent 404 response

- **`asyncHandler`**: Wrapper for async route handlers
  - Automatically catches errors from async functions
  - Passes errors to error handling middleware

- **`AppError`**: Custom error class
  - Extends Error with statusCode and error code
  - Used to throw errors with specific HTTP status codes

### Rate Limiting (`rateLimiter.ts`)

- **`apiLimiter`**: General API rate limiter
  - 100 requests per 15 minutes per IP
  - Applied to all `/api/*` routes

- **`strictLimiter`**: Strict rate limiter for sensitive operations
  - 10 requests per 15 minutes per IP
  - Use for authentication, password reset, etc.

- **`aiInsightsLimiter`**: AI insights rate limiter
  - 5 requests per hour per IP
  - Applied to AI insight generation endpoints
  - Prevents abuse of expensive AI operations

- **`uploadLimiter`**: CSV upload rate limiter
  - 10 uploads per hour per IP
  - Applied to bulk transaction upload endpoints

## Usage Examples

### Basic Route with Authentication

```typescript
import { authenticate, asyncHandler } from '../middleware/index.js';

router.get(
  '/transactions',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    // ... route logic
  })
);
```

### Route with Rate Limiting

```typescript
import { authenticate, asyncHandler, uploadLimiter } from '../middleware/index.js';

router.post(
  '/transactions/bulk',
  uploadLimiter,
  authenticate,
  asyncHandler(async (req, res) => {
    // ... route logic
  })
);
```

### Throwing Custom Errors

```typescript
import { AppError, ErrorCode } from '../middleware/index.js';

if (!data) {
  throw new AppError(
    'Resource not found',
    404,
    ErrorCode.NOT_FOUND
  );
}
```

## Error Codes

- `VALIDATION_ERROR`: Invalid input data (400)
- `NOT_FOUND`: Resource not found (404)
- `UNAUTHORIZED`: Missing or invalid authentication (401)
- `FORBIDDEN`: Insufficient permissions (403)
- `DATABASE_ERROR`: Database operation failed (500)
- `AI_SERVICE_ERROR`: AI service unavailable (503)
- `CSV_PARSE_ERROR`: CSV parsing failed (400)
- `INTERNAL_ERROR`: Unexpected error (500)

## Security Features

1. **Helmet**: Security headers for XSS, clickjacking, etc.
2. **CORS**: Configured to allow requests from frontend URL only
3. **Rate Limiting**: Prevents abuse and DDoS attacks
4. **JWT Verification**: Ensures only authenticated users can access protected routes
5. **Body Size Limits**: 10MB limit to prevent large payload attacks

## Configuration

Environment variables used by middleware:

- `FRONTEND_URL`: Allowed origin for CORS (default: `*`)
- `NODE_ENV`: Environment mode (development/production)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key for auth verification
