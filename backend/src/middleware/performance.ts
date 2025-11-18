import { Request, Response, NextFunction } from 'express';

/**
 * Performance monitoring middleware
 * Tracks API response times and logs slow requests
 */

interface PerformanceMetrics {
  path: string;
  method: string;
  duration: number;
  timestamp: Date;
  statusCode?: number;
}

// Store recent metrics in memory (last 100 requests)
const metricsHistory: PerformanceMetrics[] = [];
const MAX_HISTORY = 100;
const SLOW_REQUEST_THRESHOLD = 1000; // 1 second

/**
 * Middleware to track request performance
 */
export const performanceMonitor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const path = req.path;
  const method = req.method;

  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Store metrics
    const metric: PerformanceMetrics = {
      path,
      method,
      duration,
      timestamp: new Date(),
      statusCode,
    };

    // Add to history (keep only last MAX_HISTORY items)
    metricsHistory.push(metric);
    if (metricsHistory.length > MAX_HISTORY) {
      metricsHistory.shift();
    }

    // Log slow requests
    if (duration > SLOW_REQUEST_THRESHOLD) {
      console.warn(
        `⚠️  Slow request detected: ${method} ${path} - ${duration}ms (${statusCode})`
      );
    }

    // Add performance header only if headers haven't been sent
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
  });

  next();
};

/**
 * Get performance statistics
 */
export const getPerformanceStats = () => {
  if (metricsHistory.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      slowestRequest: null,
      fastestRequest: null,
      requestsByPath: {},
    };
  }

  const durations = metricsHistory.map((m) => m.duration);
  const totalRequests = metricsHistory.length;
  const averageResponseTime =
    durations.reduce((a, b) => a + b, 0) / totalRequests;
  const slowestRequest = metricsHistory.reduce((prev, current) =>
    prev.duration > current.duration ? prev : current
  );
  const fastestRequest = metricsHistory.reduce((prev, current) =>
    prev.duration < current.duration ? prev : current
  );

  // Group by path
  const requestsByPath: Record<
    string,
    { count: number; avgDuration: number }
  > = {};
  metricsHistory.forEach((metric) => {
    if (!requestsByPath[metric.path]) {
      requestsByPath[metric.path] = { count: 0, avgDuration: 0 };
    }
    requestsByPath[metric.path].count++;
  });

  // Calculate average duration per path
  Object.keys(requestsByPath).forEach((path) => {
    const pathMetrics = metricsHistory.filter((m) => m.path === path);
    const avgDuration =
      pathMetrics.reduce((sum, m) => sum + m.duration, 0) / pathMetrics.length;
    requestsByPath[path].avgDuration = Math.round(avgDuration);
  });

  return {
    totalRequests,
    averageResponseTime: Math.round(averageResponseTime),
    slowestRequest: {
      path: slowestRequest.path,
      method: slowestRequest.method,
      duration: slowestRequest.duration,
      timestamp: slowestRequest.timestamp,
    },
    fastestRequest: {
      path: fastestRequest.path,
      method: fastestRequest.method,
      duration: fastestRequest.duration,
      timestamp: fastestRequest.timestamp,
    },
    requestsByPath,
  };
};

/**
 * Clear metrics history
 */
export const clearMetrics = () => {
  metricsHistory.length = 0;
};
