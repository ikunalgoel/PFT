/**
 * Case transformation utilities for converting between snake_case and camelCase
 * Used to transform data between database (snake_case) and API responses (camelCase)
 */

/**
 * Convert a snake_case string to camelCase
 * @param str - The snake_case string to convert
 * @returns The camelCase string
 * @example snakeToCamel('user_id') => 'userId'
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert a camelCase string to snake_case
 * @param str - The camelCase string to convert
 * @returns The snake_case string
 * @example camelToSnake('userId') => 'user_id'
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Check if a value is a plain object (not an array, date, or null)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

/**
 * Transform object keys from snake_case to camelCase
 * Handles nested objects and arrays recursively
 * @param obj - The object to transform
 * @returns A new object with camelCase keys
 */
export function keysToCamel<T = any>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => keysToCamel(item)) as T;
  }

  if (!isPlainObject(obj)) {
    return obj as T;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    result[camelKey] = keysToCamel(value);
  }

  return result as T;
}

/**
 * Transform object keys from camelCase to snake_case
 * Handles nested objects and arrays recursively
 * @param obj - The object to transform
 * @returns A new object with snake_case keys
 */
export function keysToSnake<T = any>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => keysToSnake(item)) as T;
  }

  if (!isPlainObject(obj)) {
    return obj as T;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);
    result[snakeKey] = keysToSnake(value);
  }

  return result as T;
}

/**
 * Type-safe transformation helper for specific types
 * Useful when you know the exact type structure
 */
export function transformToCamel<TInput, TOutput>(data: TInput): TOutput {
  return keysToCamel<TOutput>(data);
}

/**
 * Type-safe transformation helper for specific types
 * Useful when you know the exact type structure
 */
export function transformToSnake<TInput, TOutput>(data: TInput): TOutput {
  return keysToSnake<TOutput>(data);
}

/**
 * Transform an array of objects from snake_case to camelCase
 */
export function arrayToCamel<T = any>(arr: unknown[]): T[] {
  return arr.map((item) => keysToCamel<T>(item));
}

/**
 * Transform an array of objects from camelCase to snake_case
 */
export function arrayToSnake<T = any>(arr: unknown[]): T[] {
  return arr.map((item) => keysToSnake<T>(item));
}
