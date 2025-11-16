import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base.repository.js';
import { Transaction, TransactionFilters, TABLE_NAMES } from '../types/database.js';
import { executeQuery, RetryOptions } from '../utils/database.js';

/**
 * Transaction repository for database operations
 */
export class TransactionRepository extends BaseRepository<Transaction> {
  constructor(client: SupabaseClient) {
    super(client, TABLE_NAMES.TRANSACTIONS);
  }

  /**
   * Find transactions with filters
   */
  async findWithFilters(
    userId: string,
    filters: TransactionFilters,
    options?: RetryOptions
  ): Promise<Transaction[]> {
    return executeQuery(async () => {
      let query = this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId);

      // Apply filters
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.minAmount !== undefined) {
        query = query.gte('amount', filters.minAmount);
      }
      if (filters.maxAmount !== undefined) {
        query = query.lte('amount', filters.maxAmount);
      }
      if (filters.merchant) {
        query = query.ilike('merchant', `%${filters.merchant}%`);
      }

      query = query.order('date', { ascending: false });

      return await query;
    }, options);
  }

  /**
   * Find transactions by date range
   */
  async findByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
    options?: RetryOptions
  ): Promise<Transaction[]> {
    return this.findWithFilters(userId, { startDate, endDate }, options);
  }

  /**
   * Find transactions by category
   */
  async findByCategory(
    userId: string,
    category: string,
    options?: RetryOptions
  ): Promise<Transaction[]> {
    return executeQuery(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .select('*')
          .eq('user_id', userId)
          .eq('category', category)
          .order('date', { ascending: false});
        return result;
      },
      options
    );
  }

  /**
   * Get total spending for a user
   */
  async getTotalSpending(
    userId: string,
    startDate?: string,
    endDate?: string,
    options?: RetryOptions
  ): Promise<number> {
    const transactions = await executeQuery(async () => {
      let query = this.client
        .from(this.tableName)
        .select('amount')
        .eq('user_id', userId);

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      return await query;
    }, options);

    return transactions.reduce((sum, t: any) => sum + Number(t.amount), 0);
  }

  /**
   * Get spending by category
   */
  async getSpendingByCategory(
    userId: string,
    startDate?: string,
    endDate?: string,
    options?: RetryOptions
  ): Promise<{ category: string; total: number; count: number }[]> {
    const transactions = await executeQuery(async () => {
      let query = this.client
        .from(this.tableName)
        .select('category, amount')
        .eq('user_id', userId);

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      return await query;
    }, options);

    // Group by category
    const categoryMap = new Map<string, { total: number; count: number }>();
    
    transactions.forEach((transaction: any) => {
      const existing = categoryMap.get(transaction.category) || { total: 0, count: 0 };
      categoryMap.set(transaction.category, {
        total: existing.total + Number(transaction.amount),
        count: existing.count + 1,
      });
    });

    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      total: stats.total,
      count: stats.count,
    }));
  }

  /**
   * Get unique categories for a user
   */
  async getCategories(userId: string, options?: RetryOptions): Promise<string[]> {
    const transactions = await executeQuery(async () => {
      return await this.client
        .from(this.tableName)
        .select('category')
        .eq('user_id', userId);
    }, options);

    const categories = new Set(transactions.map((t: any) => t.category));
    return Array.from(categories).sort();
  }
}
