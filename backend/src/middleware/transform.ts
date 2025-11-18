/**
 * Response transformation middleware
 * Transforms snake_case keys to camelCase for API responses
 */

import { Request, Response, NextFunction } from 'express';
import { keysToCamel } from '../utils/case-transform.js';

/**
 * Middleware to transform response data from snake_case to camelCase
 * Wraps res.json to automatically transform data before sending
 */
export function transformResponse(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  // Store the original json method
  const originalJson = res.json.bind(res);

  // Override res.json to transform data
  res.json = function (data: any): Response {
    // Transform the data to camelCase
    const transformedData = keysToCamel(data);
    
    // Call the original json method with transformed data
    return originalJson(transformedData);
  };

  next();
}

/**
 * Selective transformation middleware
 * Only transforms responses for specific routes or conditions
 */
export function transformResponseIf(
  condition: (req: Request) => boolean
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!condition(req)) {
      return next();
    }

    // Store the original json method
    const originalJson = res.json.bind(res);

    // Override res.json to transform data
    res.json = function (data: any): Response {
      // Transform the data to camelCase
      const transformedData = keysToCamel(data);
      
      // Call the original json method with transformed data
      return originalJson(transformedData);
    };

    next();
  };
}
