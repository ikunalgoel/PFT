import { AnalyticsService } from './analytics.service.js';
import { InsightsRepository } from '../repositories/insights.repository.js';
import { SettingsService } from './settings.service.js';
import {
  AIInsights,
  AIInsightsInput,
  CategoryInsight,
  SpendingSpike,
  Projection,
  ErrorCode,
  Currency,
} from '../types/database.js';
import { LLMClient, LLMError } from '../clients/llm.client.js';
import { CurrencyFormatter } from '../utils/currency.js';

/**
 * Date range interface for insights generation
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Analytics data structure for AI prompt
 */
export interface AnalyticsData {
  totalSpending: number;
  transactionCount: number;
  categoryBreakdown: Array<{
    category: string;
    total: number;
    count: number;
    percentage: number;
  }>;
  topMerchants?: Array<{
    merchant: string;
    total: number;
  }>;
  budgetStatus?: Array<{
    name: string;
    percentageUsed: number;
    spent: number;
    limit: number;
  }>;
  trends?: Array<{
    date: string;
    amount: number;
  }>;
}

/**
 * AI response structure
 */
interface AIResponse {
  monthlySummary: string;
  categoryInsights: CategoryInsight[];
  spendingSpikes?: SpendingSpike[];
  recommendations?: string[];
  projections?: Projection;
}

/**
 * Cache entry interface
 */
interface CacheEntry {
  data: AIInsights;
  timestamp: number;
}

/**
 * AI Insights Service
 * Handles AI-powered financial insights generation using real LLM
 */
export class AIInsightsService {
  private cache: Map<string, CacheEntry>;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  constructor(
    private analyticsService: AnalyticsService,
    private insightsRepository: InsightsRepository,
    private settingsService: SettingsService,
    private llmClient: LLMClient
  ) {
    this.cache = new Map();
  }

  /**
   * Generate AI insights for a specific period
   */
  async generateInsights(
    userId: string,
    period: DateRange
  ): Promise<AIInsights> {
    try {
      // Check cache first
      const cacheKey = `${userId}:${period.startDate}:${period.endDate}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      // Check if insights already exist in database for this period
      const existing = await this.insightsRepository.findByPeriod(
        userId,
        period.startDate,
        period.endDate
      );

      if (existing) {
        this.setCache(cacheKey, existing);
        return existing;
      }

      // Get user settings for currency
      const settings = await this.settingsService.getUserSettings(userId);
      const currency = settings.currency;

      // Gather analytics data
      const analyticsData = await this.gatherAnalyticsData(userId, period);

      // Build prompt for AI with currency context
      const prompt = this.buildPrompt(analyticsData, period, currency);

      // Call LLM with retry logic
      const aiResponse = await this.llmClient.retry(
        () => this.llmClient.generateInsights(prompt, currency),
        2
      );

      // Parse and validate AI response
      const parsedInsights = this.parseAIResponse(aiResponse, currency);

      // Store insights in database
      const insightsInput: AIInsightsInput = {
        period_start: period.startDate,
        period_end: period.endDate,
        monthly_summary: parsedInsights.monthlySummary,
        category_insights: parsedInsights.categoryInsights,
        spending_spikes: parsedInsights.spendingSpikes || [],
        recommendations: parsedInsights.recommendations || [],
        projections: parsedInsights.projections || {
          next_week: 0,
          next_month: 0,
          confidence: 'low',
          explanation: 'Insufficient data for projections',
        },
      };

      const savedInsights = await this.insightsRepository.create(
        insightsInput,
        userId
      );

      // Cache the result
      this.setCache(cacheKey, savedInsights);

      // Clean up old insights (keep only 10 most recent)
      await this.insightsRepository.deleteOldInsights(userId, 10);

      return savedInsights;
    } catch (error) {
      // Graceful degradation - return cached or default insights
      return this.handleGenerationError(userId, period, error);
    }
  }

  /**
   * Get the latest insights for a user
   */
  async getLatestInsights(userId: string): Promise<AIInsights | null> {
    try {
      return await this.insightsRepository.findLatest(userId);
    } catch (error) {
      console.error('Error fetching latest insights:', error);
      return null;
    }
  }

  /**
   * Build AI prompt from analytics data with currency context
   */
  buildPrompt(data: AnalyticsData, period: DateRange, currency: Currency): string {
    const currencySymbol = CurrencyFormatter.getSymbol(currency);
    
    const categoryBreakdownText = data.categoryBreakdown
      .map(
        (c) =>
          `- ${c.category}: ${CurrencyFormatter.format(c.total, currency)} (${c.percentage.toFixed(1)}%)`
      )
      .join('\n');

    const topMerchantsText = data.topMerchants
      ? data.topMerchants
          .map((m) => `- ${m.merchant}: ${CurrencyFormatter.format(m.total, currency)}`)
          .join('\n')
      : 'No merchant data available';

    const budgetStatusText = data.budgetStatus
      ? data.budgetStatus
          .map(
            (b) =>
              `- ${b.name}: ${b.percentageUsed.toFixed(1)}% used (${CurrencyFormatter.format(b.spent, currency)} of ${CurrencyFormatter.format(b.limit, currency)})`
          )
          .join('\n')
      : 'No budgets configured';

    const trendsText = data.trends
      ? `Recent spending trend:\n${data.trends
          .slice(-7)
          .map((t) => `- ${t.date}: ${CurrencyFormatter.format(t.amount, currency)}`)
          .join('\n')}`
      : '';

    return `You are a financial advisor analyzing a user's spending patterns.

User Currency: ${currency}
Currency Symbol: ${currencySymbol}

Period: ${period.startDate} to ${period.endDate}
Total Spending: ${CurrencyFormatter.format(data.totalSpending, currency)}
Number of Transactions: ${data.transactionCount}

Category Breakdown:
${categoryBreakdownText}

Top Merchants:
${topMerchantsText}

Budget Status:
${budgetStatusText}

${trendsText}

Please provide:
1. A brief monthly summary (2-3 sentences)
2. Insights for each major spending category
3. Any unusual spending spikes or patterns
4. 3-5 personalized savings recommendations
5. Spending projections for next week and next month

IMPORTANT: Use the ${currencySymbol} symbol for all monetary amounts in your response.

Format your response as JSON with the following structure:
{
  "monthlySummary": "...",
  "categoryInsights": [
    {
      "category": "...",
      "total_spent": 0,
      "percentage_of_total": 0,
      "insight": "..."
    }
  ],
  "spendingSpikes": [
    {
      "date": "YYYY-MM-DD",
      "amount": 0,
      "category": "...",
      "description": "..."
    }
  ],
  "recommendations": ["...", "..."],
  "projections": {
    "next_week": 0,
    "next_month": 0,
    "confidence": "high|medium|low",
    "explanation": "..."
  }
}`;
  }

  /**
   * Parse and validate AI response
   */
  parseAIResponse(response: string, _currency: Currency): AIResponse {
    try {
      // Try to extract JSON from response (in case AI adds extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.monthlySummary || typeof parsed.monthlySummary !== 'string') {
        throw new Error('Invalid or missing monthlySummary');
      }

      if (!Array.isArray(parsed.categoryInsights)) {
        throw new Error('Invalid or missing categoryInsights');
      }

      // Validate category insights structure
      parsed.categoryInsights.forEach((insight: any, index: number) => {
        if (
          !insight.category ||
          typeof insight.total_spent !== 'number' ||
          typeof insight.percentage_of_total !== 'number' ||
          !insight.insight
        ) {
          throw new Error(`Invalid category insight at index ${index}`);
        }
      });

      // Optional fields with defaults
      const spendingSpikes = Array.isArray(parsed.spendingSpikes)
        ? parsed.spendingSpikes
        : [];
      const recommendations = Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [];

      // Validate projections if present
      let projections: Projection | undefined;
      if (parsed.projections) {
        if (
          typeof parsed.projections.next_week === 'number' &&
          typeof parsed.projections.next_month === 'number' &&
          ['high', 'medium', 'low'].includes(parsed.projections.confidence) &&
          typeof parsed.projections.explanation === 'string'
        ) {
          projections = parsed.projections;
        }
      }

      return {
        monthlySummary: parsed.monthlySummary,
        categoryInsights: parsed.categoryInsights,
        spendingSpikes,
        recommendations,
        projections,
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear cache for a specific user
   */
  clearUserCache(userId: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.startsWith(userId)) {
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
   * Gather analytics data for AI prompt
   */
  private async gatherAnalyticsData(
    userId: string,
    period: DateRange
  ): Promise<AnalyticsData> {
    const filters = {
      startDate: period.startDate,
      endDate: period.endDate,
    };

    // Get summary data
    const summary = await this.analyticsService.getSummary(userId, filters);

    // Get trends
    const trends = await this.analyticsService.getTrends(userId, {
      ...filters,
      groupBy: 'day',
    });

    // Get budget comparison
    const budgetComparison = await this.analyticsService.getBudgetComparison(
      userId,
      filters
    );

    return {
      totalSpending: summary.total_spending,
      transactionCount: summary.transaction_count,
      categoryBreakdown: summary.category_breakdown,
      trends: trends.map((t) => ({
        date: t.date,
        amount: t.amount,
      })),
      budgetStatus: budgetComparison.map((b) => ({
        name: b.budget.name,
        percentageUsed: b.percentage_used,
        spent: b.actual_spending,
        limit: b.budget.amount,
      })),
    };
  }

  /**
   * Handle generation errors with graceful degradation
   */
  private async handleGenerationError(
    userId: string,
    period: DateRange,
    error: any
  ): Promise<AIInsights> {
    console.error('Error generating AI insights:', error);

    // If it's an LLM error and retryable, try to return cached insights
    if (error instanceof LLMError && error.retryable) {
      const latest = await this.getLatestInsights(userId);
      if (latest) {
        console.log('Returning latest cached insights due to LLM error');
        return latest;
      }
    }

    // Try to return the latest cached insights
    const latest = await this.getLatestInsights(userId);
    if (latest) {
      console.log('Returning latest cached insights due to generation error');
      return latest;
    }

    // If no cached insights, create a basic fallback
    const fallbackInsights: AIInsightsInput = {
      period_start: period.startDate,
      period_end: period.endDate,
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
    };

    // Store fallback insights
    try {
      return await this.insightsRepository.create(fallbackInsights, userId);
    } catch (dbError) {
      // If even storing fails, throw an error
      const errorResponse = {
        code: ErrorCode.AI_SERVICE_ERROR,
        message: 'Failed to generate AI insights',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
      throw errorResponse;
    }
  }

  /**
   * Get data from cache if not expired
   */
  private getFromCache(key: string): AIInsights | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache
   */
  private setCache(key: string, data: AIInsights): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }


}
