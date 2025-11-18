import OpenAI from 'openai';
import { Currency } from '../types/database.js';
import { BaseLLMClient, LLMError } from './llm.client.js';
import { LLMConfig, getSystemMessage } from '../config/llm.config.js';

/**
 * OpenAI Client Implementation
 */
export class OpenAIClient extends BaseLLMClient {
  private client: OpenAI;
  private model: string;

  constructor(config: LLMConfig) {
    super(config.maxTokens, config.temperature, config.timeout);
    
    this.client = new OpenAI({
      apiKey: config.apiKey,
      timeout: config.timeout,
    });
    
    this.model = config.model;
  }

  /**
   * Generate insights using OpenAI API
   */
  async generateInsights(prompt: string, currency: Currency): Promise<string> {
    const startTime = Date.now();
    
    try {
      this.logRequest(prompt, currency);

      const systemMessage = getSystemMessage(currency);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemMessage,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new LLMError(
          'Empty response from OpenAI',
          'INVALID_RESPONSE',
          true
        );
      }

      const duration = Date.now() - startTime;
      this.logResponse(content, duration);

      // Validate response
      if (!this.validateResponse(content)) {
        throw new LLMError(
          'Invalid JSON response from OpenAI',
          'INVALID_RESPONSE',
          true
        );
      }

      return content;
    } catch (error) {
      this.logError(error as Error);

      // Handle OpenAI-specific errors
      if (error instanceof OpenAI.APIError) {
        if (error.status === 401) {
          throw new LLMError(
            'Invalid OpenAI API key',
            'AUTHENTICATION_ERROR',
            false
          );
        }

        if (error.status === 429) {
          throw new LLMError(
            'OpenAI rate limit exceeded',
            'RATE_LIMIT',
            true
          );
        }

        if (error.status === 408 || error.code === 'ETIMEDOUT') {
          throw new LLMError(
            'OpenAI request timeout',
            'TIMEOUT',
            true
          );
        }

        throw new LLMError(
          `OpenAI API error: ${error.message}`,
          'API_ERROR',
          true
        );
      }

      // Re-throw LLMError instances
      if (error instanceof LLMError) {
        throw error;
      }

      // Handle unknown errors
      throw new LLMError(
        `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'API_ERROR',
        false
      );
    }
  }
}
