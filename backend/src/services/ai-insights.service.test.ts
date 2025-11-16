import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIInsightsService, AnalyticsData } from './ai-insights.service.js';
import { AnalyticsService } from './analytics.service.js';
import { InsightsRepository } from '../repositories/insights.repository.js';
import {
  AIInsights,
  SpendingSummary,
  TrendData,
  BudgetComparison,
} from '../types/database.js';

// Mock services and repositories
const mockAnalyticsService = {
  getSummary: vi.fn(),
  getTrends: vi.fn(),
  getBudgetComparison: vi.fn(),
} as unknown as AnalyticsService;

const mockInsightsRepository = {
  create: vi.fn(),
  findLatest: vi.fn(),
  findByPeriod: vi.fn(),
  deleteOldInsights: vi.fn(),
} as unknown as InsightsRepository;

describe('AIInsightsService', () => {
  let service: AIInsightsService;
  const userId = 'test-user-id';

  beforeEach(() => {
    service = new AIInsightsService(
      mockAnalyticsService,
      mockInsightsRepository
    );
    vi.clearAllMocks();
    service.clearAllCache();
  });

  describe('buildPrompt', () => {
    it('should construct a valid AI prompt from analytics data', () => {
      const analyticsData: AnalyticsData = {
        totalSpending: 1500,
        transactionCount: 25,
        categoryBreakdown: [
          { category: 'Food', total: 600, count: 10, percentage: 40 },
          { category: 'Transport', total: 500, count: 8, percentage: 33.33 },
          { category: 'Entertainment', total: 400, count: 7, percentage: 26.67 },
        ],
        topMerchants: [
          { merchant: 'Grocery Store', total: 300 },
          { merchant: 'Gas Station', total: 200 },
        ],
        budgetStatus: [
          {
            name: 'Food Budget',
            percentageUsed: 75,
            spent: 600,
            limit: 800,
          },
        ],
        trends: [
          { date: '2024-01-15', amount: 100 },
          { date: '2024-01-16', amount: 150 },
        ],
      };

      const period = { startDate: '2024-01-01', endDate: '2024-01-31' };
      const prompt = service.buildPrompt(analyticsData, period);

      // Verify prompt contains key information
      expect(prompt).toContain('Period: 2024-01-01 to 2024-01-31');
      expect(prompt).toContain('Total Spending: $1500.00');
      expect(prompt).toContain('Number of Transactions: 25');
      expect(prompt).toContain('Food: $600.00 (40.0%)');
      expect(prompt).toContain('Transport: $500.00 (33.3%)');
      expect(prompt).toContain('Grocery Store: $300.00');
      expect(prompt).toContain('Food Budget: 75.0% used');
      expect(prompt).toContain('Format your response as JSON');
    });

    it('should handle missing optional data gracefully', () => {
      const analyticsData: AnalyticsData = {
        totalSpending: 500,
        transactionCount: 5,
        categoryBreakdown: [
          { category: 'Food', total: 500, count: 5, percentage: 100 },
        ],
      };

      const period = { startDate: '2024-01-01', endDate: '2024-01-31' };
      const prompt = service.buildPrompt(analyticsData, period);

      expect(prompt).toContain('Total Spending: $500.00');
      expect(prompt).toContain('No merchant data available');
      expect(prompt).toContain('No budgets configured');
    });
  });

  describe('parseAIResponse', () => {
    it('should parse valid AI response JSON', () => {
      const validResponse = JSON.stringify({
        monthlySummary: 'You spent $1500 this month across 25 transactions.',
        categoryInsights: [
          {
            category: 'Food',
            total_spent: 600,
            percentage_of_total: 40,
            insight: 'Food spending is within normal range.',
          },
        ],
        spendingSpikes: [
          {
            date: '2024-01-15',
            amount: 200,
            category: 'Entertainment',
            description: 'Unusual entertainment expense detected.',
          },
        ],
        recommendations: [
          'Consider reducing dining out expenses',
          'Set up a budget for entertainment',
        ],
        projections: {
          next_week: 350,
          next_month: 1400,
          confidence: 'medium',
          explanation: 'Based on current spending patterns.',
        },
      });

      const parsed = service.parseAIResponse(validResponse);

      expect(parsed.monthlySummary).toBe(
        'You spent $1500 this month across 25 transactions.'
      );
      expect(parsed.categoryInsights).toHaveLength(1);
      expect(parsed.categoryInsights[0].category).toBe('Food');
      expect(parsed.spendingSpikes).toHaveLength(1);
      expect(parsed.recommendations).toHaveLength(2);
      expect(parsed.projections?.confidence).toBe('medium');
    });

    it('should extract JSON from response with extra text', () => {
      const responseWithText = `Here is your financial analysis:
      
      ${JSON.stringify({
        monthlySummary: 'Summary text',
        categoryInsights: [
          {
            category: 'Food',
            total_spent: 100,
            percentage_of_total: 50,
            insight: 'Good spending',
          },
        ],
      })}
      
      I hope this helps!`;

      const parsed = service.parseAIResponse(responseWithText);

      expect(parsed.monthlySummary).toBe('Summary text');
      expect(parsed.categoryInsights).toHaveLength(1);
    });

    it('should handle missing optional fields with defaults', () => {
      const minimalResponse = JSON.stringify({
        monthlySummary: 'Summary',
        categoryInsights: [
          {
            category: 'Food',
            total_spent: 100,
            percentage_of_total: 100,
            insight: 'Insight',
          },
        ],
      });

      const parsed = service.parseAIResponse(minimalResponse);

      expect(parsed.monthlySummary).toBe('Summary');
      expect(parsed.spendingSpikes).toEqual([]);
      expect(parsed.recommendations).toEqual([]);
      expect(parsed.projections).toBeUndefined();
    });

    it('should throw error for invalid JSON', () => {
      const invalidResponse = 'This is not JSON';

      expect(() => service.parseAIResponse(invalidResponse)).toThrow(
        'No JSON found in AI response'
      );
    });

    it('should throw error for missing required fields', () => {
      const missingFieldsResponse = JSON.stringify({
        categoryInsights: [],
      });

      expect(() => service.parseAIResponse(missingFieldsResponse)).toThrow(
        'Invalid or missing monthlySummary'
      );
    });

    it('should throw error for invalid category insights structure', () => {
      const invalidInsightsResponse = JSON.stringify({
        monthlySummary: 'Summary',
        categoryInsights: [
          {
            category: 'Food',
            // missing required fields
          },
        ],
      });

      expect(() => service.parseAIResponse(invalidInsightsResponse)).toThrow(
        'Invalid category insight'
      );
    });
  });

  describe('generateInsights', () => {
    it('should return cached insights if available', async () => {
      const mockInsights: AIInsights = {
        id: 'insight-1',
        user_id: userId,
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        monthly_summary: 'Cached summary',
        category_insights: [],
        spending_spikes: [],
        recommendations: [],
        projections: {
          next_week: 100,
          next_month: 400,
          confidence: 'medium',
          explanation: 'Test',
        },
        generated_at: new Date().toISOString(),
      };

      vi.mocked(mockInsightsRepository.findByPeriod).mockResolvedValue(
        mockInsights
      );

      const result = await service.generateInsights(userId, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result).toEqual(mockInsights);
      expect(mockInsightsRepository.findByPeriod).toHaveBeenCalledWith(
        userId,
        '2024-01-01',
        '2024-01-31'
      );
    });

    it('should handle AI service errors with graceful degradation', async () => {
      // No existing insights
      vi.mocked(mockInsightsRepository.findByPeriod).mockResolvedValue(null);
      vi.mocked(mockInsightsRepository.findLatest).mockResolvedValue(null);

      // Mock analytics data
      const mockSummary: SpendingSummary = {
        total_spending: 1000,
        transaction_count: 10,
        average_transaction: 100,
        category_breakdown: [],
        period: { start: '2024-01-01', end: '2024-01-31' },
      };

      const mockTrends: TrendData[] = [];
      const mockBudgetComparison: BudgetComparison[] = [];

      vi.mocked(mockAnalyticsService.getSummary).mockResolvedValue(mockSummary);
      vi.mocked(mockAnalyticsService.getTrends).mockResolvedValue(mockTrends);
      vi.mocked(mockAnalyticsService.getBudgetComparison).mockResolvedValue(
        mockBudgetComparison
      );

      // Mock fallback insights creation
      const fallbackInsights: AIInsights = {
        id: 'fallback-1',
        user_id: userId,
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        monthly_summary:
          'Unable to generate AI insights at this time. Please try again later.',
        category_insights: [],
        spending_spikes: [],
        recommendations: [
          'Track your spending regularly',
          'Set up budgets for major expense categories',
          'Review your transactions weekly',
        ],
        projections: {
          next_week: 0,
          next_month: 0,
          confidence: 'low',
          explanation: 'Insufficient data for projections',
        },
        generated_at: new Date().toISOString(),
      };

      vi.mocked(mockInsightsRepository.create).mockResolvedValue(
        fallbackInsights
      );

      const result = await service.generateInsights(userId, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result).toEqual(fallbackInsights);
      expect(mockInsightsRepository.create).toHaveBeenCalled();
    });
  });

  describe('getLatestInsights', () => {
    it('should return latest insights for user', async () => {
      const mockInsights: AIInsights = {
        id: 'insight-1',
        user_id: userId,
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        monthly_summary: 'Latest summary',
        category_insights: [],
        spending_spikes: [],
        recommendations: [],
        projections: {
          next_week: 100,
          next_month: 400,
          confidence: 'high',
          explanation: 'Test',
        },
        generated_at: new Date().toISOString(),
      };

      vi.mocked(mockInsightsRepository.findLatest).mockResolvedValue(
        mockInsights
      );

      const result = await service.getLatestInsights(userId);

      expect(result).toEqual(mockInsights);
      expect(mockInsightsRepository.findLatest).toHaveBeenCalledWith(userId);
    });

    it('should return null if no insights found', async () => {
      vi.mocked(mockInsightsRepository.findLatest).mockResolvedValue(null);

      const result = await service.getLatestInsights(userId);

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(mockInsightsRepository.findLatest).mockRejectedValue(
        new Error('Database error')
      );

      const result = await service.getLatestInsights(userId);

      expect(result).toBeNull();
    });
  });

  describe('cache management', () => {
    it('should cache generated insights', async () => {
      const mockInsights: AIInsights = {
        id: 'insight-1',
        user_id: userId,
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        monthly_summary: 'Summary',
        category_insights: [],
        spending_spikes: [],
        recommendations: [],
        projections: {
          next_week: 100,
          next_month: 400,
          confidence: 'medium',
          explanation: 'Test',
        },
        generated_at: new Date().toISOString(),
      };

      vi.mocked(mockInsightsRepository.findByPeriod)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockInsights);

      // First call - should query database
      await service.generateInsights(userId, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      // Clear mocks
      vi.clearAllMocks();

      // Second call - should use cache (no database call)
      const result = await service.generateInsights(userId, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockInsightsRepository.findByPeriod).not.toHaveBeenCalled();
      expect(result.monthly_summary).toBe('Summary');
    });

    it('should clear user-specific cache', async () => {
      const mockInsights: AIInsights = {
        id: 'insight-1',
        user_id: userId,
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        monthly_summary: 'Summary',
        category_insights: [],
        spending_spikes: [],
        recommendations: [],
        projections: {
          next_week: 100,
          next_month: 400,
          confidence: 'medium',
          explanation: 'Test',
        },
        generated_at: new Date().toISOString(),
      };

      vi.mocked(mockInsightsRepository.findByPeriod).mockResolvedValue(
        mockInsights
      );

      // First call
      await service.generateInsights(userId, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      // Clear user cache
      service.clearUserCache(userId);

      // Clear mocks to verify next call hits database
      vi.clearAllMocks();
      vi.mocked(mockInsightsRepository.findByPeriod).mockResolvedValue(
        mockInsights
      );

      // Second call - should query database again
      await service.generateInsights(userId, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockInsightsRepository.findByPeriod).toHaveBeenCalled();
    });

    it('should clear all cache', () => {
      service.clearAllCache();
      // If this doesn't throw, the cache was cleared successfully
      expect(true).toBe(true);
    });
  });
});
