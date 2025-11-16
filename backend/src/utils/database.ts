import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';

/**
 * Database utility functions with retry logic and error handling
 */

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry wrapper for database operations
 * Implements exponential backoff for failed operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries, delayMs, backoffMultiplier } = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  };

  let lastError: Error | null = null;
  let currentDelay = delayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      console.warn(
        `Database operation failed (attempt ${attempt + 1}/${maxRetries + 1}):`,
        error instanceof Error ? error.message : error
      );

      // Wait before retrying with exponential backoff
      await sleep(currentDelay);
      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError || new Error('Database operation failed after retries');
}

/**
 * Handle Supabase query errors
 */
export function handleDatabaseError(error: PostgrestError | null): never {
  if (!error) {
    throw new Error('Unknown database error');
  }

  console.error('Database error:', {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  });

  // Map common Supabase error codes to user-friendly messages
  const errorMap: Record<string, string> = {
    '23505': 'A record with this information already exists',
    '23503': 'Referenced record does not exist',
    '23502': 'Required field is missing',
    '42P01': 'Database table not found',
    'PGRST116': 'No rows found',
  };

  const userMessage = errorMap[error.code] || 'Database operation failed';

  throw new Error(`${userMessage}: ${error.message}`);
}

/**
 * Execute a database query with retry logic
 */
export async function executeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  options: RetryOptions = {}
): Promise<T> {
  return withRetry(async () => {
    const { data, error } = await queryFn();
    
    if (error) {
      handleDatabaseError(error);
    }
    
    if (data === null) {
      throw new Error('Query returned no data');
    }
    
    return data;
  }, options);
}

/**
 * Execute a database mutation (insert, update, delete) with retry logic
 */
export async function executeMutation<T>(
  mutationFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  options: RetryOptions = {}
): Promise<T> {
  return withRetry(async () => {
    const { data, error } = await mutationFn();
    
    if (error) {
      handleDatabaseError(error);
    }
    
    if (data === null) {
      throw new Error('Mutation returned no data');
    }
    
    return data;
  }, options);
}

/**
 * Check if a record exists
 */
export async function recordExists(
  client: SupabaseClient,
  table: string,
  id: string
): Promise<boolean> {
  try {
    const { data, error } = await client
      .from(table)
      .select('id')
      .eq('id', id)
      .single();
    
    return !error && data !== null;
  } catch {
    return false;
  }
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Database health check
 */
export async function checkDatabaseHealth(client: SupabaseClient): Promise<{
  healthy: boolean;
  message: string;
  latency?: number;
}> {
  const startTime = Date.now();
  
  try {
    const { error } = await client.from('transactions').select('id').limit(1);
    const latency = Date.now() - startTime;
    
    if (error) {
      return {
        healthy: false,
        message: `Database health check failed: ${error.message}`,
      };
    }
    
    return {
      healthy: true,
      message: 'Database is healthy',
      latency,
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Database health check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
