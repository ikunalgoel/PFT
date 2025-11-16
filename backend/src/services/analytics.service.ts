import { TransactionRepository } from '../repositories/transaction.repository.js';
import { BudgetRepository } from '../repositories/budget.repository.js';
import {
  SpendingSummary,
  CategoryBreakdown,
  TrendData,
  BudgetComparison,
} from '../types/database.js';

/**
 * Analytics filters interface
 */
export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
}

/**
 * Trend filters interface
 */
export interface TrendFilters extends AnalyticsFilters {
  groupBy?: 'day' | 'week' | 'month';
}

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Analytics Service
 * Handles data aggregation and analysis for financial insights
 */
export class AnalyticsService {
  private cache: Map<string, CacheEntry<any>>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private transactionRepository: TransactionRepository,
    private budgetRepository: BudgetRepository
  ) {
    this.cache = new Map();
  }

  /**
   * Get spending summary with total and category breakdown
   */
  async getSummary(
    userId: string,
    filters: AnalyticsFilters = {}
  ): Promise<SpendingSummary> {
    const cacheKey = `summary:${userId}:${JSON.stringify(filters)}`;
    const cached = this.getFromCache<SpendingSummary>(cacheKey);
    if (cached) return cached;

    // Get all transactions for the period
    const transactions = await this.transactionRepository.findWithFilters(
      userId,
      filters
    );

    // Calculate total spending
    const totalSpending = transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );

    // Calculate average transaction
    const averageTransaction =
      transactions.length > 0 ? totalSpending / transactions.length : 0;

    // Get category breakdown
    const categoryMap = new Map<string, { total: number; count: number }>();
    transactions.forEach((t) => {
      const existing = categoryMap.get(t.category) || { total: 0, count: 0 };
      categoryMap.set(t.category, {
        total: existing.total + Number(t.amount),
        count: existing.count + 1,
      });
    });

    const categoryBreakdown: CategoryBreakdown[] = Array.from(
      categoryMap.entries()
    ).map(([category, stats]) => ({
      category,
      total: stats.total,
      count: stats.count,
      percentage: totalSpending > 0 ? (stats.total / totalSpending) * 100 : 0,
    }));

    // Sort by total descending
    categoryBreakdown.sort((a, b) => b.total - a.total);

    // Determine period
    const period = this.determinePeriod(filters, transactions);

    const summary: SpendingSummary = {
      total_spending: totalSpending,
      transaction_count: transactions.length,
      average_transaction: averageTransaction,
      category_breakdown: categoryBreakdown,
      period,
    };

    this.setCache(cacheKey, summary);
    return summary;
  }

  /**
   * Get spending trends over time
   */
  async getTrends(
    userId: string,
    filters: TrendFilters = {}
  ): Promise<TrendData[]> {
    const cacheKey = `trends:${userId}:${JSON.stringify(filters)}`;
    const cached = this.getFromCache<TrendData[]>(cacheKey);
    if (cached) return cached;

    const groupBy = filters.groupBy || 'day';

    // Get all transactions for the period
    const transactions = await this.transactionRepository.findWithFilters(
      userId,
      {
        startDate: filters.startDate,
        endDate: filters.endDate,
        category: filters.category,
      }
    );

    // Group transactions by date period
    const trendMap = new Map<string, { amount: number; count: number }>();

    transactions.forEach((t) => {
      const groupKey = this.getGroupKey(t.date, groupBy);
      const existing = trendMap.get(groupKey) || { amount: 0, count: 0 };
      trendMap.set(groupKey, {
        amount: existing.amount + Number(t.amount),
        count: existing.count + 1,
      });
    });

    // Convert to array and sort by date
    const trends: TrendData[] = Array.from(trendMap.entries())
      .map(([date, stats]) => ({
        date,
        amount: stats.amount,
        transaction_count: stats.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    this.setCache(cacheKey, trends);
    return trends;
  }

  /**
   * Get category breakdown for pie chart data
   */
  async getCategoryBreakdown(
    userId: string,
    filters: AnalyticsFilters = {}
  ): Promise<CategoryBreakdown[]> {
    const cacheKey = `categories:${userId}:${JSON.stringify(filters)}`;
    const cached = this.getFromCache<CategoryBreakdown[]>(cacheKey);
    if (cached) return cached;

    // Get spending by category from repository
    const categoryData = await this.transactionRepository.getSpendingByCategory(
      userId,
      filters.startDate,
      filters.endDate
    );

    // Calculate total for percentages
    const total = categoryData.reduce((sum, c) => sum + c.total, 0);

    // Map to CategoryBreakdown format
    const breakdown: CategoryBreakdown[] = categoryData.map((c) => ({
      category: c.category,
      total: c.total,
      count: c.count,
      percentage: total > 0 ? (c.total / total) * 100 : 0,
    }));

    // Sort by total descending
    breakdown.sort((a, b) => b.total - a.total);

    this.setCache(cacheKey, breakdown);
    return breakdown;
  }

  /**
   * Get budget comparison (budget vs actual spending)
   */
  async getBudgetComparison(
    userId: string,
    filters: AnalyticsFilters = {}
  ): Promise<BudgetComparison[]> {
    const cacheKey = `budget-comparison:${userId}:${JSON.stringify(filters)}`;
    const cached = this.getFromCache<BudgetComparison[]>(cacheKey);
    if (cached) return cached;

    // Get all budgets
    const budgets = await this.budgetRepository.findAll(userId);

    // Get budget progress for each
    const comparisons: BudgetComparison[] = [];

    for (const budget of budgets) {
      const progress = await this.budgetRepository.getBudgetProgress(
        userId,
        budget.id
      );

      if (progress) {
        let status: 'under' | 'near' | 'over';
        if (progress.percentage >= 100) {
          status = 'over';
        } else if (progress.percentage >= 80) {
          status = 'near';
        } else {
          status = 'under';
        }

        comparisons.push({
          budget: progress.budget,
          actual_spending: progress.current_spending,
          percentage_used: progress.percentage,
          status,
        });
      }
    }

    // Sort by percentage used descending
    comparisons.sort((a, b) => b.percentage_used - a.percentage_used);

    this.setCache(cacheKey, comparisons);
    return comparisons;
  }

  /**
   * Clear cache for a specific user
   */
  clearUserCache(userId: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(userId)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Get data from cache if not expired
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache
   */
  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Determine period from filters or transactions
   */
  private determinePeriod(
    filters: AnalyticsFilters,
    transactions: any[]
  ): { start: string; end: string } {
    if (filters.startDate && filters.endDate) {
      return {
        start: filters.startDate,
        end: filters.endDate,
      };
    }

    if (transactions.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      return { start: today, end: today };
    }

    // Find min and max dates from transactions
    const dates = transactions.map((t) => t.date).sort();
    return {
      start: dates[0],
      end: dates[dates.length - 1],
    };
  }

  /**
   * Get group key for date based on grouping type
   */
  private getGroupKey(dateString: string, groupBy: 'day' | 'week' | 'month'): string {
    const date = new Date(dateString);

    switch (groupBy) {
      case 'day':
        return dateString; // Already in YYYY-MM-DD format

      case 'week': {
        // Get ISO week number
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor(
          (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
        );
        const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
      }

      case 'month':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      default:
        return dateString;
    }
  }
}
