import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base.repository.js';
import { UserSettings, UserSettingsInput, TABLE_NAMES } from '../types/database.js';
import { executeQuery, executeMutation, RetryOptions } from '../utils/database.js';

/**
 * Settings Repository
 * Handles database operations for user settings
 */
export class SettingsRepository extends BaseRepository<UserSettings> {
  constructor(client: SupabaseClient) {
    super(client, TABLE_NAMES.USER_SETTINGS);
  }

  /**
   * Get user settings by user ID
   * Returns null if settings don't exist yet
   */
  async getUserSettings(userId: string, options?: RetryOptions): Promise<UserSettings | null> {
    try {
      const result = await executeQuery(
        async () => {
          const result = await this.client
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId)
            .single();
          return result;
        },
        options
      );
      return result as UserSettings;
    } catch (error) {
      // Return null if not found instead of throwing
      if (error instanceof Error && error.message.includes('No rows found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create user settings
   */
  async createSettings(
    userId: string,
    input: UserSettingsInput,
    options?: RetryOptions
  ): Promise<UserSettings> {
    return executeMutation(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .insert({
            user_id: userId,
            currency: input.currency,
          })
          .select()
          .single();
        return result;
      },
      options
    );
  }

  /**
   * Update user settings
   */
  async updateSettings(
    userId: string,
    input: Partial<UserSettingsInput>,
    options?: RetryOptions
  ): Promise<UserSettings> {
    return executeMutation(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .update(input)
          .eq('user_id', userId)
          .select()
          .single();
        return result;
      },
      options
    );
  }

  /**
   * Get or create user settings with default currency
   */
  async getOrCreate(userId: string, defaultCurrency: 'GBP' | 'INR' = 'GBP'): Promise<UserSettings> {
    const existing = await this.getUserSettings(userId);
    
    if (existing) {
      return existing;
    }

    // Create with default currency
    return await this.createSettings(userId, { currency: defaultCurrency });
  }
}
