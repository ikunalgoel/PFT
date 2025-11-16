import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsService } from './analytics.service.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { BudgetRepository } from '../repositories/budget.repository.js';
import { Transaction, Budget, BudgetProgress } from '../types/database.js';

// Mock repositories
const mockTransactionRepository = {
  findWithFilters: vi.fn(),
  getSpendingByCategory: vi.fn(),
} as unknown as TransactionRepository;

const mockBudgetRepository = {
  findAll: vi.fn(),
  getBudgetProgress: vi.fn(),
} as unknown as BudgetRepository;

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  const userId = 'test-user-id';

  beforeEach(() => {
    service = new AnalyticsService(
      mockTransactionRepository,
      mockBudgetRepository
    );
    vi.clearAllMocks();
    service.clearAllCache();
  });

  describe('getSummary', () => {
    it('should calculate spending summary with category breakdown', async () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          user_id: userId,
          date: '2024-01-15',
          amount: 100,
          category: 'Food',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          user_id: userId,
          date: '2024-01-16',
          amount: 50,
          category: 'Food',
          created_at: '2024-01-16T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z',
        },
        {
          id: '3',
          user_id: userId,
          date: '2024-01-17',
          amount: 200,
          category: 'Transport',
          created_at: '2024-01-17T10:00:00Z',
          updated_at: '2024-01-17T10:00:00Z',
        },
      ];

      vi.mocked(mockTransactionRepository.findWithFilters).mockResolvedValue(
        mockTransactions
      );

      const result = await service.getSummary(userId, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result.total_spending).toBe(350);
      expect(result.transaction_count).toBe(3);
      expect(result.average_transaction).toBeCloseTo(116.67, 2);
      expect(result.category_breakdown).toHaveLength(2);
      
      // Check Transport category (highest spending)
      expect(result.category_breakdown[0].category).toBe('Transport');
      expect(result.category_breakdown[0].total).toBe(200);
      expect(result.category_breakdown[0].count).toBe(1);
      expect(result.category_breakdown[0].percentage).toBeCloseTo(57.14, 2);
      
      // Check Food category
      expect(result.category_breakdown[1].category).toBe('Food');
      expect(result.category_breakdown[1].total).toBe(150);
      expect(result.category_breakdown[1].count).toBe(2);
      expect(result.category_breakdown[1].percentage).toBeCloseTo(42.86, 2);
    });

    it('should handle empty transaction list', async () => {
      vi.mocked(mockTransactionRepository.findWithFilters).mockResolvedValue([]);

      const result = await service.getSummary(userId);

      expect(result.total_spending).toBe(0);
      expect(result.transaction_count).toBe(0);
      expect(result.average_transaction).toBe(0);
      expect(result.category_breakdown).toHaveLength(0);
    });

    it('should use cached data on subsequent calls', async () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          user_id: userId,
          date: '2024-01-15',
          amount: 100,
          category: 'Food',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      ];

      vi.mocked(mockTransactionRepository.findWithFilters).mockResolvedValue(
        mockTransactions
      );

      // First call
      await service.getSummary(userId);
      expect(mockTransactionRepository.findWithFilters).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await service.getSummary(userId);
      expect(mockTransactionRepository.findWithFilters).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTrends', () => {
    it('should group transactions by day', async () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          user_id: userId,
          date: '2024-01-15',
          amount: 100,
          category: 'Food',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          user_id: userId,
          date: '2024-01-15',
          amount: 50,
          category: 'Transport',
          created_at: '2024-01-15T11:00:00Z',
          updated_at: '2024-01-15T11:00:00Z',
        },
        {
          id: '3',
          user_id: userId,
          date: '2024-01-16',
          amount: 200,
          category: 'Food',
          created_at: '2024-01-16T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z',
        },
      ];

      vi.mocked(mockTransactionRepository.findWithFilters).mockResolvedValue(
        mockTransactions
      );

      const result = await service.getTrends(userId, { groupBy: 'day' });

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-01-15');
      expect(result[0].amount).toBe(150);
      expect(result[0].transaction_count).toBe(2);
      expect(result[1].date).toBe('2024-01-16');
      expect(result[1].amount).toBe(200);
      expect(result[1].transaction_count).toBe(1);
    });

    it('should group transactions by month', async () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          user_id: userId,
          date: '2024-01-15',
          amount: 100,
          category: 'Food',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          user_id: userId,
          date: '2024-01-20',
          amount: 50,
          category: 'Transport',
          created_at: '2024-01-20T10:00:00Z',
          updated_at: '2024-01-20T10:00:00Z',
        },
        {
          id: '3',
          user_id: userId,
          date: '2024-02-10',
          amount: 200,
          category: 'Food',
          created_at: '2024-02-10T10:00:00Z',
          updated_at: '2024-02-10T10:00:00Z',
        },
      ];

      vi.mocked(mockTransactionRepository.findWithFilters).mockResolvedValue(
        mockTransactions
      );

      const result = await service.getTrends(userId, { groupBy: 'month' });

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-01');
      expect(result[0].amount).toBe(150);
      expect(result[0].transaction_count).toBe(2);
      expect(result[1].date).toBe('2024-02');
      expect(result[1].amount).toBe(200);
      expect(result[1].transaction_count).toBe(1);
    });

    it('should default to day grouping', async () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          user_id: userId,
          date: '2024-01-15',
          amount: 100,
          category: 'Food',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      ];

      vi.mocked(mockTransactionRepository.findWithFilters).mockResolvedValue(
        mockTransactions
      );

      const result = await service.getTrends(userId);

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2024-01-15');
    });
  });

  describe('getCategoryBreakdown', () => {
    it('should return category breakdown with percentages', async () => {
      const mockCategoryData = [
        { category: 'Food', total: 300, count: 5 },
        { category: 'Transport', total: 200, count: 3 },
        { category: 'Entertainment', total: 100, count: 2 },
      ];

      vi.mocked(
        mockTransactionRepository.getSpendingByCategory
      ).mockResolvedValue(mockCategoryData);

      const result = await service.getCategoryBreakdown(userId);

      expect(result).toHaveLength(3);
      
      // Should be sorted by total descending
      expect(result[0].category).toBe('Food');
      expect(result[0].total).toBe(300);
      expect(result[0].percentage).toBe(50);
      
      expect(result[1].category).toBe('Transport');
      expect(result[1].total).toBe(200);
      expect(result[1].percentage).toBeCloseTo(33.33, 2);
      
      expect(result[2].category).toBe('Entertainment');
      expect(result[2].total).toBe(100);
      expect(result[2].percentage).toBeCloseTo(16.67, 2);
    });

    it('should handle empty category data', async () => {
      vi.mocked(
        mockTransactionRepository.getSpendingByCategory
      ).mockResolvedValue([]);

      const result = await service.getCategoryBreakdown(userId);

      expect(result).toHaveLength(0);
    });
  });

  describe('getBudgetComparison', () => {
    it('should return budget comparison with status', async () => {
      const mockBudgets: Budget[] = [
        {
          id: 'budget-1',
          user_id: userId,
          name: 'Food Budget',
          amount: 500,
          period_type: 'monthly',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'budget-2',
          user_id: userId,
          name: 'Transport Budget',
          amount: 200,
          period_type: 'monthly',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockProgress1: BudgetProgress = {
        budget_id: 'budget-1',
        budget: mockBudgets[0],
        current_spending: 250,
        percentage: 50,
        remaining: 250,
        alerts: [],
      };

      const mockProgress2: BudgetProgress = {
        budget_id: 'budget-2',
        budget: mockBudgets[1],
        current_spending: 180,
        percentage: 90,
        remaining: 20,
        alerts: [],
      };

      vi.mocked(mockBudgetRepository.findAll).mockResolvedValue(mockBudgets);
      vi.mocked(mockBudgetRepository.getBudgetProgress)
        .mockResolvedValueOnce(mockProgress1)
        .mockResolvedValueOnce(mockProgress2);

      const result = await service.getBudgetComparison(userId);

      expect(result).toHaveLength(2);
      
      // Should be sorted by percentage descending
      expect(result[0].budget.name).toBe('Transport Budget');
      expect(result[0].actual_spending).toBe(180);
      expect(result[0].percentage_used).toBe(90);
      expect(result[0].status).toBe('near');
      
      expect(result[1].budget.name).toBe('Food Budget');
      expect(result[1].actual_spending).toBe(250);
      expect(result[1].percentage_used).toBe(50);
      expect(result[1].status).toBe('under');
    });

    it('should classify budget status correctly', async () => {
      const mockBudgets: Budget[] = [
        {
          id: 'budget-1',
          user_id: userId,
          name: 'Under Budget',
          amount: 500,
          period_type: 'monthly',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'budget-2',
          user_id: userId,
          name: 'Near Budget',
          amount: 200,
          period_type: 'monthly',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'budget-3',
          user_id: userId,
          name: 'Over Budget',
          amount: 100,
          period_type: 'monthly',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(mockBudgetRepository.findAll).mockResolvedValue(mockBudgets);
      vi.mocked(mockBudgetRepository.getBudgetProgress)
        .mockResolvedValueOnce({
          budget_id: 'budget-1',
          budget: mockBudgets[0],
          current_spending: 300,
          percentage: 60,
          remaining: 200,
          alerts: [],
        })
        .mockResolvedValueOnce({
          budget_id: 'budget-2',
          budget: mockBudgets[1],
          current_spending: 170,
          percentage: 85,
          remaining: 30,
          alerts: [],
        })
        .mockResolvedValueOnce({
          budget_id: 'budget-3',
          budget: mockBudgets[2],
          current_spending: 120,
          percentage: 120,
          remaining: -20,
          alerts: [],
        });

      const result = await service.getBudgetComparison(userId);

      expect(result[0].status).toBe('over'); // 120%
      expect(result[1].status).toBe('near'); // 85%
      expect(result[2].status).toBe('under'); // 60%
    });
  });

  describe('cache management', () => {
    it('should clear user-specific cache', async () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          user_id: userId,
          date: '2024-01-15',
          amount: 100,
          category: 'Food',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      ];

      vi.mocked(mockTransactionRepository.findWithFilters).mockResolvedValue(
        mockTransactions
      );

      // First call - should hit repository
      await service.getSummary(userId);
      expect(mockTransactionRepository.findWithFilters).toHaveBeenCalledTimes(1);

      // Clear cache
      service.clearUserCache(userId);

      // Second call - should hit repository again
      await service.getSummary(userId);
      expect(mockTransactionRepository.findWithFilters).toHaveBeenCalledTimes(2);
    });

    it('should clear all cache', async () => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          user_id: userId,
          date: '2024-01-15',
          amount: 100,
          category: 'Food',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      ];

      vi.mocked(mockTransactionRepository.findWithFilters).mockResolvedValue(
        mockTransactions
      );

      // First call
      await service.getSummary(userId);
      expect(mockTransactionRepository.findWithFilters).toHaveBeenCalledTimes(1);

      // Clear all cache
      service.clearAllCache();

      // Second call - should hit repository again
      await service.getSummary(userId);
      expect(mockTransactionRepository.findWithFilters).toHaveBeenCalledTimes(2);
    });
  });
});
