import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Limits requests to 100 per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP, please try again later',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for sensitive operations
 * Limits requests to 10 per 15 minutes per IP
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests for this operation, please try again later',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI insights rate limiter
 * Limits AI insight generation to 5 per hour per IP
 * (AI operations are expensive)
 */
export const aiInsightsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'AI insights generation limit reached, please try again later',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * CSV upload rate limiter
 * Limits bulk uploads to 10 per hour per IP
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Upload limit reached, please try again later',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});
