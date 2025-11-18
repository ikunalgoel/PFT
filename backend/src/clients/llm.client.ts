import { Currency } from '../types/database.js';

/**
 * LLM Client Interface
 * Defines the contract for LLM provider implementations
 */
export interface LLMClient {
  /**
   * Generate insights from a prompt
   * @param prompt - The prompt to send to the LLM
   * @param currency - The user's currency preference
   * @returns The LLM's response as a string
   */
  generateInsights(prompt: string, currency: Currency): Promise<string>;

  /**
   * Validate a response from the LLM
   * @param response - The response to validate
   * @returns True if the response is valid, false otherwise
   */
  validateResponse(response: string): boolean;

  /**
   * Retry a function with exponential backoff
   * @param fn - The function to retry
   * @param maxRetries - Maximum number of retry attempts
   * @returns The result of the function
   */
  retry<T>(fn: () => Promise<T>, maxRetries: number): Promise<T>;
}

/**
 * LLM Error class for handling LLM-specific errors
 */
export class LLMError extends Error {
  constructor(
    message: string,
    public code: 'TIMEOUT' | 'RATE_LIMIT' | 'INVALID_RESPONSE' | 'API_ERROR' | 'AUTHENTICATION_ERROR',
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

/**
 * Base LLM Client with common functionality
 */
export abstract class BaseLLMClient implements LLMClient {
  protected maxTokens: number;
  protected temperature: number;
  protected timeout: number;

  constructor(maxTokens: number, temperature: number, timeout: number) {
    this.maxTokens = maxTokens;
    this.temperature = temperature;
    this.timeout = timeout;
  }

  abstract generateInsights(prompt: string, currency: Currency): Promise<string>;

  /**
   * Validate response has JSON structure
   */
  validateResponse(response: string): boolean {
    if (!response || response.trim().length === 0) {
      return false;
    }

    // Check if response contains JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return false;
    }

    try {
      JSON.parse(jsonMatch[0]);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retry with exponential backoff
   */
  async retry<T>(fn: () => Promise<T>, maxRetries: number = 2): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication errors
        if (error instanceof LLMError && error.code === 'AUTHENTICATION_ERROR') {
          throw error;
        }

        // Don't retry on non-retryable errors
        if (error instanceof LLMError && !error.retryable) {
          throw error;
        }

        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error;
        }

        // Calculate exponential backoff delay
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Log request and response for debugging
   */
  protected logRequest(prompt: string, currency: Currency): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[LLM Request]', {
        currency,
        promptLength: prompt.length,
        timestamp: new Date().toISOString(),
      });
    }
  }

  protected logResponse(response: string, duration: number): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[LLM Response]', {
        responseLength: response.length,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  protected logError(error: Error): void {
    console.error('[LLM Error]', {
      message: error.message,
      name: error.name,
      timestamp: new Date().toISOString(),
    });
  }
}
