import { LLMClient } from './llm.client.js';
import { OpenAIClient } from './openai.client.js';
import { AnthropicClient } from './anthropic.client.js';
import { getLLMConfig, validateLLMConfig } from '../config/llm.config.js';

/**
 * Create an LLM client based on configuration
 */
export function createLLMClient(): LLMClient {
  const config = getLLMConfig();
  validateLLMConfig(config);

  switch (config.provider) {
    case 'openai':
      return new OpenAIClient(config);
    
    case 'anthropic':
      return new AnthropicClient(config);
    
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}
