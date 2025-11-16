import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base.repository.js';
import { Budget, BudgetProgress, TABLE_NAMES } from '../types/database.js';
import { executeQuery, RetryOptions } from '../utils/database.js';

/**
 * Budget repository for database operations
 */
export class BudgetRepository extends BaseRepository<Budget> {
  constructor(client: SupabaseClient) {
    super(client, TABLE_NAMES.BUDGETS);
  }

  /**
   * Find active budgets (within current period)
   */
  async findActive(userId: string, currentDate: string, options?: RetryOptions): Promise<Budget[]> {
    return executeQuery(async () => {
      return await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .or(`period_type.eq.monthly,and(period_start.lte.${currentDate},period_end.gte.${currentDate})`)
        .order('created_at', { ascending: false});
    }, options);
  }

  /**
   * Find budgets by category
   */
  async findByCategory(
    userId: string,
    category: string,
    options?: RetryOptions
  ): Promise<Budget[]> {
    return executeQuery(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .select('*')
          .eq('user_id', userId)
          .eq('category', category)
          .order('created_at', { ascending: false});
        return result;
      },
      options
    );
  }

  /**
   * Find budgets by period type
   */
  async findByPeriodType(
    userId: string,
    periodType: 'monthly' | 'custom',
    options?: RetryOptions
  ): Promise<Budget[]> {
    return executeQuery(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .select('*')
          .eq('user_id', userId)
          .eq('period_type', periodType)
          .order('created_at', { ascending: false});
        return result;
      },
      options
    );
  }

  /**
   * Get budget progress with current spending
   * This requires joining with transactions, so it's done in application code
   */
  async getBudgetProgress(
    userId: string,
    budgetId: string,
    options?: RetryOptions
  ): Promise<BudgetProgress | null> {
    const budget = await this.findById(budgetId, userId, options);
    if (!budget) return null;

    // Get current spending for this budget
    const { startDate, endDate } = this.getBudgetPeriodDates(budget);

    let query = this.client
      .from(TABLE_NAMES.TRANSACTIONS)
      .select('amount')
      .eq('user_id', userId);

    if (budget.category) {
      query = query.eq('category', budget.category);
    }

    query = query.gte('date', startDate).lte('date', endDate);

    const { data: transactions, error } = await query;
    if (error) throw error;

    const currentSpending = (transactions || []).reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );

    const percentage = (currentSpending / budget.amount) * 100;
    const remaining = budget.amount - currentSpending;

    // Get active alerts for this budget
    const { data: alerts, error: alertError } = await this.client
      .from(TABLE_NAMES.BUDGET_ALERTS)
      .select('*')
      .eq('budget_id', budgetId)
      .eq('is_active', true)
      .order('triggered_at', { ascending: false });

    if (alertError) throw alertError;

    return {
      budget_id: budgetId,
      budget,
      current_spending: currentSpending,
      percentage,
      remaining,
      alerts: alerts || [],
    };
  }

  /**
   * Get all budget progress for a user
   */
  async getAllBudgetProgress(
    userId: string,
    options?: RetryOptions
  ): Promise<BudgetProgress[]> {
    const budgets = await this.findAll(userId, options);
    
    const progressPromises = budgets.map((budget) =>
      this.getBudgetProgress(userId, budget.id, options)
    );

    const results = await Promise.all(progressPromises);
    return results.filter((p): p is BudgetProgress => p !== null);
  }

  /**
   * Helper to get budget period dates
   */
  private getBudgetPeriodDates(budget: Budget): { startDate: string; endDate: string } {
    if (budget.period_type === 'custom') {
      return {
        startDate: budget.period_start!,
        endDate: budget.period_end!,
      };
    }

    // For monthly budgets, use current month
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];

    return { startDate, endDate };
  }
}
