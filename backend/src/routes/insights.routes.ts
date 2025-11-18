import { Router, Request, Response } from 'express';
import { AIInsightsService } from '../services/ai-insights.service.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { SettingsService } from '../services/settings.service.js';
import { InsightsRepository } from '../repositories/insights.repository.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { BudgetRepository } from '../repositories/budget.repository.js';
import { SettingsRepository } from '../repositories/settings.repository.js';
import { getAuthenticatedClient } from '../config/supabase.js';
import { createLLMClient } from '../clients/llm.factory.js';
import {
  authenticate,
  asyncHandler,
  AppError,
  ErrorCode,
  aiInsightsLimiter,
} from '../middleware/index.js';

const router = Router();

/**
 * POST /api/insights/generate
 * Generate AI insights for a specified period
 * Body: { startDate: string, endDate: string }
 */
router.post(
  '/generate',
  aiInsightsLimiter,
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const transactionRepository = new TransactionRepository(supabase);
    const budgetRepository = new BudgetRepository(supabase);
    const insightsRepository = new InsightsRepository(supabase);
    const settingsRepository = new SettingsRepository(supabase);
    const analyticsService = new AnalyticsService(transactionRepository, budgetRepository);
    const settingsService = new SettingsService(settingsRepository);
    const llmClient = createLLMClient();
    const aiInsightsService = new AIInsightsService(
      analyticsService,
      insightsRepository,
      settingsService,
      llmClient
    );
    
    const { startDate, endDate } = req.body;

    // Validate required fields
    if (!startDate || !endDate) {
      throw new AppError(
        'startDate and endDate are required',
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new AppError(
        'Dates must be in YYYY-MM-DD format',
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      throw new AppError(
        'startDate must be before or equal to endDate',
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const insights = await aiInsightsService.generateInsights(userId, {
      startDate,
      endDate,
    });

    res.status(201).json(insights);
  })
);

/**
 * GET /api/insights/latest
 * Get the most recent AI insights for the authenticated user
 */
router.get(
  '/latest',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const transactionRepository = new TransactionRepository(supabase);
    const budgetRepository = new BudgetRepository(supabase);
    const insightsRepository = new InsightsRepository(supabase);
    const settingsRepository = new SettingsRepository(supabase);
    const analyticsService = new AnalyticsService(transactionRepository, budgetRepository);
    const settingsService = new SettingsService(settingsRepository);
    const llmClient = createLLMClient();
    const aiInsightsService = new AIInsightsService(
      analyticsService,
      insightsRepository,
      settingsService,
      llmClient
    );

    const insights = await aiInsightsService.getLatestInsights(userId);

    if (!insights) {
      throw new AppError(
        'No insights found. Generate insights first.',
        404,
        ErrorCode.NOT_FOUND
      );
    }

    res.json(insights);
  })
);

/**
 * POST /api/insights/export
 * Export insights as PDF or text format
 * Body: { insightId: string, format: 'pdf' | 'text' }
 */
router.post(
  '/export',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const insightsRepository = new InsightsRepository(supabase);
    const { insightId, format } = req.body;

    // Validate required fields
    if (!insightId) {
      throw new AppError(
        'insightId is required',
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Validate format
    if (!format || !['pdf', 'text'].includes(format)) {
      throw new AppError(
        'format must be either "pdf" or "text"',
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Fetch the insight
    const insight = await insightsRepository.findById(insightId, userId);

    if (!insight) {
      throw new AppError('Insight not found', 404, ErrorCode.NOT_FOUND);
    }

    // Generate export content
    const exportContent = generateExportContent(insight);

    // Set appropriate headers
    const filename = `financial-insights-${insight.period_start}-to-${insight.period_end}.${format === 'pdf' ? 'pdf' : 'txt'}`;

    if (format === 'text') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );
      res.json({ content: exportContent });
    } else {
      // For PDF, we would need a PDF generation library
      // For now, return text with a note that PDF generation is not yet implemented
      res.status(501).json({
        code: 'NOT_IMPLEMENTED',
        message: 'PDF export is not yet implemented. Please use text format.',
        timestamp: new Date().toISOString(),
      });
    }
  })
);

/**
 * Generate export content in text format
 */
function generateExportContent(insight: any): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('FINANCIAL INSIGHTS REPORT');
  lines.push('='.repeat(60));
  lines.push('');
  lines.push(`Period: ${insight.period_start} to ${insight.period_end}`);
  lines.push(`Generated: ${new Date(insight.generated_at).toLocaleString()}`);
  lines.push('');
  lines.push('='.repeat(60));
  lines.push('MONTHLY SUMMARY');
  lines.push('='.repeat(60));
  lines.push('');
  lines.push(insight.monthly_summary);
  lines.push('');

  if (insight.category_insights && insight.category_insights.length > 0) {
    lines.push('='.repeat(60));
    lines.push('CATEGORY INSIGHTS');
    lines.push('='.repeat(60));
    lines.push('');
    insight.category_insights.forEach((cat: any) => {
      lines.push(`${cat.category}:`);
      lines.push(`  Total Spent: $${cat.total_spent.toFixed(2)}`);
      lines.push(`  Percentage: ${cat.percentage_of_total.toFixed(1)}%`);
      lines.push(`  Insight: ${cat.insight}`);
      lines.push('');
    });
  }

  if (insight.spending_spikes && insight.spending_spikes.length > 0) {
    lines.push('='.repeat(60));
    lines.push('SPENDING ALERTS');
    lines.push('='.repeat(60));
    lines.push('');
    insight.spending_spikes.forEach((spike: any) => {
      lines.push(`${spike.date} - ${spike.category}:`);
      lines.push(`  Amount: $${spike.amount.toFixed(2)}`);
      lines.push(`  ${spike.description}`);
      lines.push('');
    });
  }

  if (insight.recommendations && insight.recommendations.length > 0) {
    lines.push('='.repeat(60));
    lines.push('RECOMMENDATIONS');
    lines.push('='.repeat(60));
    lines.push('');
    insight.recommendations.forEach((rec: string, index: number) => {
      lines.push(`${index + 1}. ${rec}`);
    });
    lines.push('');
  }

  if (insight.projections) {
    lines.push('='.repeat(60));
    lines.push('SPENDING PROJECTIONS');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Next Week: $${insight.projections.next_week.toFixed(2)}`);
    lines.push(`Next Month: $${insight.projections.next_month.toFixed(2)}`);
    lines.push(`Confidence: ${insight.projections.confidence.toUpperCase()}`);
    lines.push(`Explanation: ${insight.projections.explanation}`);
    lines.push('');
  }

  lines.push('='.repeat(60));
  lines.push('END OF REPORT');
  lines.push('='.repeat(60));

  return lines.join('\n');
}

export default router;
