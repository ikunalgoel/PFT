import { Currency } from '../types/database.js';

/**
 * Supported LLM providers
 */
export type LLMProvider = 'openai' | 'anthropic';

/**
 * LLM configuration interface
 */
export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

/**
 * LLM provider configurations
 */
export const LLM_CONFIGS: Record<LLMProvider, Omit<LLMConfig, 'apiKey'>> = {
  openai: {
    provider: 'openai',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000', 10),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    timeout: parseInt(process.env.AI_TIMEOUT || '30000', 10),
  },
  anthropic: {
    provider: 'anthropic',
    model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000', 10),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    timeout: parseInt(process.env.AI_TIMEOUT || '30000', 10),
  },
};

/**
 * Get LLM configuration based on environment variables
 */
export function getLLMConfig(): LLMConfig {
  const provider = (process.env.AI_PROVIDER || 'openai') as LLMProvider;
  
  if (!['openai', 'anthropic'].includes(provider)) {
    throw new Error(`Invalid AI_PROVIDER: ${provider}. Must be 'openai' or 'anthropic'`);
  }

  const config = LLM_CONFIGS[provider];
  
  let apiKey: string;
  if (provider === 'openai') {
    apiKey = process.env.OPENAI_API_KEY || '';
  } else {
    apiKey = process.env.ANTHROPIC_API_KEY || '';
  }

  if (!apiKey) {
    throw new Error(`Missing API key for provider: ${provider}`);
  }

  return {
    ...config,
    apiKey,
  };
}

/**
 * Validate LLM configuration
 */
export function validateLLMConfig(config: LLMConfig): void {
  if (!config.apiKey) {
    throw new Error('API key is required');
  }

  if (config.maxTokens <= 0) {
    throw new Error('maxTokens must be greater than 0');
  }

  if (config.temperature < 0 || config.temperature > 2) {
    throw new Error('temperature must be between 0 and 2');
  }

  if (config.timeout <= 0) {
    throw new Error('timeout must be greater than 0');
  }
}

/**
 * Get system message for LLM based on currency
 */
export function getSystemMessage(currency: Currency): string {
  const currencySymbols: Record<Currency, string> = {
    GBP: '£',
    INR: '₹',
  };

  const symbol = currencySymbols[currency];

  return `You are a financial advisor analyzing spending patterns. The user's currency is ${currency}. Format all monetary amounts with the ${symbol} symbol. Provide insights in clear, conversational language.`;
}
