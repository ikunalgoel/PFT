import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base.repository.js';
import { AIInsights, TABLE_NAMES } from '../types/database.js';
import { executeQuery, RetryOptions } from '../utils/database.js';

/**
 * AI Insights repository for database operations
 */
export class InsightsRepository extends BaseRepository<AIInsights> {
  constructor(client: SupabaseClient) {
    super(client, TABLE_NAMES.AI_INSIGHTS);
  }

  /**
   * Find insights by date range
   */
  async findByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
    options?: RetryOptions
  ): Promise<AIInsights[]> {
    return executeQuery(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .select('*')
          .eq('user_id', userId)
          .gte('period_start', startDate)
          .lte('period_end', endDate)
          .order('generated_at', { ascending: false});
        return result;
      },
      options
    );
  }

  /**
   * Find the most recent insight for a user
   */
  async findLatest(userId: string, options?: RetryOptions): Promise<AIInsights | null> {
    try {
      return await executeQuery(
        async () => {
          const result = await this.client
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId)
            .order('generated_at', { ascending: false })
            .limit(1)
            .single();
          return result;
        },
        options
      );
    } catch (error) {
      // Return null if no insights found
      if (error instanceof Error && error.message.includes('No rows found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Find insights for a specific period
   */
  async findByPeriod(
    userId: string,
    periodStart: string,
    periodEnd: string,
    options?: RetryOptions
  ): Promise<AIInsights | null> {
    try {
      return await executeQuery(
        async () => {
          const result = await this.client
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId)
            .eq('period_start', periodStart)
            .eq('period_end', periodEnd)
            .order('generated_at', { ascending: false })
            .limit(1)
            .single();
          return result;
        },
        options
      );
    } catch (error) {
      // Return null if no insights found
      if (error instanceof Error && error.message.includes('No rows found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get all insights for a user, ordered by most recent
   */
  async findAllOrdered(userId: string, options?: RetryOptions): Promise<AIInsights[]> {
    return executeQuery(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .select('*')
          .eq('user_id', userId)
          .order('generated_at', { ascending: false});
        return result;
      },
      options
    );
  }

  /**
   * Delete old insights (keep only the most recent N)
   */
  async deleteOldInsights(
    userId: string,
    keepCount: number = 10,
    options?: RetryOptions
  ): Promise<void> {
    // Get all insights ordered by date
    const allInsights = await this.findAllOrdered(userId, options);

    // If we have more than keepCount, delete the oldest ones
    if (allInsights.length > keepCount) {
      const toDelete = allInsights.slice(keepCount);
      const deletePromises = toDelete.map((insight) =>
        this.delete(insight.id, userId, options)
      );
      await Promise.all(deletePromises);
    }
  }
}
