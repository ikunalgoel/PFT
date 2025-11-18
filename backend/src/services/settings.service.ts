import { SettingsRepository } from '../repositories/settings.repository.js';
import {
  UserSettings,
  UserSettingsInput,
  Currency,
  ErrorCode,
} from '../types/database.js';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Settings Service
 * Handles business logic for user settings operations
 */
export class SettingsService {
  private readonly SUPPORTED_CURRENCIES: Currency[] = ['GBP', 'INR'];

  constructor(private settingsRepository: SettingsRepository) {}

  /**
   * Get user settings
   * Creates default settings if they don't exist
   */
  async getUserSettings(userId: string): Promise<UserSettings> {
    const settings = await this.settingsRepository.getUserSettings(userId);

    if (!settings) {
      // Create default settings with GBP
      return await this.settingsRepository.createSettings(userId, {
        currency: 'GBP',
      });
    }

    return settings;
  }

  /**
   * Update user settings
   */
  async updateSettings(
    userId: string,
    input: Partial<UserSettingsInput>
  ): Promise<UserSettings> {
    // Validate input
    const validation = this.validateSettings(input);
    if (!validation.valid) {
      throw this.createValidationError(validation.errors);
    }

    // Check if settings exist
    const existing = await this.settingsRepository.getUserSettings(userId);

    if (!existing) {
      // Create new settings if they don't exist
      return await this.settingsRepository.createSettings(userId, {
        currency: input.currency || 'GBP',
      });
    }

    // Update existing settings
    return await this.settingsRepository.updateSettings(userId, input);
  }

  /**
   * Update currency preference
   */
  async updateCurrency(userId: string, currency: Currency): Promise<UserSettings> {
    // Validate currency
    if (!this.SUPPORTED_CURRENCIES.includes(currency)) {
      throw this.createValidationError([
        `Currency must be one of: ${this.SUPPORTED_CURRENCIES.join(', ')}`,
      ]);
    }

    return await this.updateSettings(userId, { currency });
  }

  /**
   * Create default settings for a new user
   */
  async createDefaultSettings(
    userId: string,
    currency: Currency = 'GBP'
  ): Promise<UserSettings> {
    // Validate currency
    if (!this.SUPPORTED_CURRENCIES.includes(currency)) {
      throw this.createValidationError([
        `Currency must be one of: ${this.SUPPORTED_CURRENCIES.join(', ')}`,
      ]);
    }

    // Check if settings already exist
    const existing = await this.settingsRepository.getUserSettings(userId);
    if (existing) {
      return existing;
    }

    return await this.settingsRepository.createSettings(userId, { currency });
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): Currency[] {
    return [...this.SUPPORTED_CURRENCIES];
  }

  /**
   * Validate settings input
   */
  private validateSettings(input: Partial<UserSettingsInput>): ValidationResult {
    const errors: string[] = [];

    // Validate currency if provided
    if (input.currency !== undefined) {
      if (!this.SUPPORTED_CURRENCIES.includes(input.currency)) {
        errors.push(
          `Currency must be one of: ${this.SUPPORTED_CURRENCIES.join(', ')}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create validation error
   */
  private createValidationError(errors: string[]): Error {
    const error = new Error(errors.join('; '));
    (error as any).code = ErrorCode.VALIDATION_ERROR;
    (error as any).details = errors;
    return error;
  }
}
