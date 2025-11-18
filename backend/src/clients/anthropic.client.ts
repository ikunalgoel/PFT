import Anthropic from '@anthropic-ai/sdk';
import { Currency } from '../types/database.js';
import { BaseLLMClient, LLMError } from './llm.client.js';
import { LLMConfig, getSystemMessage } from '../config/llm.config.js';

/**
 * Anthropic Client Implementation
 */
export class AnthropicClient extends BaseLLMClient {
  private client: Anthropic;
  private model: string;

  constructor(config: LLMConfig) {
    super(config.maxTokens, config.temperature, config.timeout);
    
    this.client = new Anthropic({
      apiKey: config.apiKey,
      timeout: config.timeout,
    });
    
    this.model = config.model;
  }

  /**
   * Generate insights using Anthropic API
   */
  async generateInsights(prompt: string, currency: Currency): Promise<string> {
    const startTime = Date.now();
    
    try {
      this.logRequest(prompt, currency);

      const systemMessage = getSystemMessage(currency);

      // Add JSON formatting instruction to the prompt
      const enhancedPrompt = `${prompt}

IMPORTANT: You must respond with valid JSON only. Do not include any text before or after the JSON object.`;

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemMessage,
        messages: [
          {
            role: 'user',
            content: enhancedPrompt,
          },
        ],
      });

      const content = response.content[0];

      if (!content || content.type !== 'text') {
        throw new LLMError(
          'Empty or invalid response from Anthropic',
          'INVALID_RESPONSE',
          true
        );
      }

      const textContent = content.text;
      const duration = Date.now() - startTime;
      this.logResponse(textContent, duration);

      // Validate response
      if (!this.validateResponse(textContent)) {
        throw new LLMError(
          'Invalid JSON response from Anthropic',
          'INVALID_RESPONSE',
          true
        );
      }

      return textContent;
    } catch (error) {
      this.logError(error as Error);

      // Handle Anthropic-specific errors
      if (error instanceof Anthropic.APIError) {
        if (error.status === 401) {
          throw new LLMError(
            'Invalid Anthropic API key',
            'AUTHENTICATION_ERROR',
            false
          );
        }

        if (error.status === 429) {
          throw new LLMError(
            'Anthropic rate limit exceeded',
            'RATE_LIMIT',
            true
          );
        }

        if (error.status === 408 || error.message.includes('timeout')) {
          throw new LLMError(
            'Anthropic request timeout',
            'TIMEOUT',
            true
          );
        }

        throw new LLMError(
          `Anthropic API error: ${error.message}`,
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
