import { SupabaseClient } from '@supabase/supabase-js';
import { Alert, TABLE_NAMES } from '../types/database.js';
import { executeQuery, executeMutation, RetryOptions } from '../utils/database.js';

/**
 * Alert repository for database operations
 * Note: Alerts are tied to budgets, so user access is verified through budget ownership
 */
export class AlertRepository {
  protected client: SupabaseClient;
  protected tableName: string;

  constructor(client: SupabaseClient) {
    this.client = client;
    this.tableName = TABLE_NAMES.BUDGET_ALERTS;
  }

  /**
   * Find all alerts for a user's budgets
   */
  async findByUser(userId: string, options?: RetryOptions): Promise<Alert[]> {
    return executeQuery(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .select(`
            *,
            budgets!inner (
              user_id
            )
          `)
          .eq('budgets.user_id', userId)
          .order('triggered_at', { ascending: false});
        return result;
      },
      options
    );
  }

  /**
   * Find active alerts for a user
   */
  async findActiveByUser(userId: string, options?: RetryOptions): Promise<Alert[]> {
    return executeQuery(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .select(`
            *,
            budgets!inner (
              user_id
            )
          `)
          .eq('budgets.user_id', userId)
          .eq('is_active', true)
          .order('triggered_at', { ascending: false});
        return result;
      },
      options
    );
  }

  /**
   * Find alerts by budget ID
   */
  async findByBudget(budgetId: string, options?: RetryOptions): Promise<Alert[]> {
    return executeQuery(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .select('*')
          .eq('budget_id', budgetId)
          .order('triggered_at', { ascending: false});
        return result;
      },
      options
    );
  }

  /**
   * Find active alerts by budget ID
   */
  async findActiveByBudget(budgetId: string, options?: RetryOptions): Promise<Alert[]> {
    return executeQuery(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .select('*')
          .eq('budget_id', budgetId)
          .eq('is_active', true)
          .order('triggered_at', { ascending: false});
        return result;
      },
      options
    );
  }

  /**
   * Create a new alert
   */
  async create(
    budgetId: string,
    alertType: 'warning' | 'critical',
    thresholdPercentage: number,
    options?: RetryOptions
  ): Promise<Alert> {
    return executeMutation(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .insert({
            budget_id: budgetId,
            alert_type: alertType,
            threshold_percentage: thresholdPercentage,
            is_active: true,
          })
          .select()
          .single();
        return result;
      },
      options
    );
  }

  /**
   * Resolve an alert (mark as inactive)
   */
  async resolve(alertId: string, options?: RetryOptions): Promise<Alert> {
    return executeMutation(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .update({
            is_active: false,
            resolved_at: new Date().toISOString(),
          })
          .eq('id', alertId)
          .select()
          .single();
        return result;
      },
      options
    );
  }

  /**
   * Resolve all alerts for a budget
   */
  async resolveByBudget(budgetId: string, options?: RetryOptions): Promise<void> {
    await executeMutation(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .update({
            is_active: false,
            resolved_at: new Date().toISOString(),
          })
          .eq('budget_id', budgetId)
          .eq('is_active', true);
        return result;
      },
      options
    );
  }

  /**
   * Delete an alert
   */
  async delete(alertId: string, options?: RetryOptions): Promise<void> {
    await executeMutation(
      async () => {
        const result = await this.client.from(this.tableName).delete().eq('id', alertId);
        return result;
      },
      options
    );
  }

  /**
   * Check if an alert exists for a budget and threshold
   */
  async existsForThreshold(
    budgetId: string,
    thresholdPercentage: number,
    options?: RetryOptions
  ): Promise<boolean> {
    try {
      const result = await executeQuery(
        async () => {
          const result = await this.client
            .from(this.tableName)
            .select('id')
            .eq('budget_id', budgetId)
            .eq('threshold_percentage', thresholdPercentage)
            .eq('is_active', true)
            .single();
          return result;
        },
        options
      );

      return result !== null;
    } catch {
      return false;
    }
  }
}
