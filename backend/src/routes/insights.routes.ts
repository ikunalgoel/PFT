import { Router, Request, Response } from 'express';
import { AIInsightsService } from '../services/ai-insights.service.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { InsightsRepository } from '../repositories/insights.repository.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { BudgetRepository } from '../repositories/budget.repository.js';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { ErrorCode } from '../types/database.js';

const router = Router();

// Initialize repositories and services
const transactionRepository = new TransactionRepository(supabase);
const budgetRepository = new BudgetRepository(supabase);
const insightsRepository = new InsightsRepository(supabase);
const analyticsService = new AnalyticsService(
  transactionRepository,
  budgetRepository
);
const aiInsightsService = new AIInsightsService(
  analyticsService,
  insightsRepository
);

/**
 * POST /api/insights/generate
 * Generate AI insights for a specified period
 * Body: { startDate: string, endDate: string }
 */
router.post('/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.body;

    // Validate required fields
    if (!startDate || !endDate) {
      return res.status(400).json({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'startDate and endDate are required',
        timestamp: new Date().toISOString(),
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Dates must be in YYYY-MM-DD format',
        timestamp: new Date().toISOString(),
      });
    }

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'startDate must be before or equal to endDate',
        timestamp: new Date().toISOString(),
      });
    }

    const insights = await aiInsightsService.generateInsights(userId, {
      startDate,
      endDate,
    });

    res.status(201).json(insights);
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * GET /api/insights/latest
 * Get the most recent AI insights for the authenticated user
 */
router.get('/latest', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const insights = await aiInsightsService.getLatestInsights(userId);

    if (!insights) {
      return res.status(404).json({
        code: ErrorCode.NOT_FOUND,
        message: 'No insights found. Generate insights first.',
        timestamp: new Date().toISOString(),
      });
    }

    res.json(insights);
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * POST /api/insights/export
 * Export insights as PDF or text format
 * Body: { insightId: string, format: 'pdf' | 'text' }
 */
router.post('/export', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { insightId, format } = req.body;

    // Validate required fields
    if (!insightId) {
      return res.status(400).json({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'insightId is required',
        timestamp: new Date().toISOString(),
      });
    }

    // Validate format
    if (!format || !['pdf', 'text'].includes(format)) {
      return res.status(400).json({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'format must be either "pdf" or "text"',
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch the insight
    const insight = await insightsRepository.findById(insightId, userId);

    if (!insight) {
      return res.status(404).json({
        code: ErrorCode.NOT_FOUND,
        message: 'Insight not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Generate export content
    const exportContent = generateExportContent(insight, format);

    // Set appropriate headers
    const filename = `financial-insights-${insight.period_start}-to-${insight.period_end}.${format === 'pdf' ? 'pdf' : 'txt'}`;
    
    if (format === 'text') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportContent);
    } else {
      // For PDF, we would need a PDF generation library
      // For now, return text with a note that PDF generation is not yet implemented
      res.status(501).json({
        code: 'NOT_IMPLEMENTED',
        message: 'PDF export is not yet implemented. Please use text format.',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * Generate export content in the specified format
 */
function generateExportContent(insight: any, format: 'pdf' | 'text'): string {
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

/**
 * Error handler helper
 */
function handleError(error: any, res: Response): void {
  console.error('AI Insights API error:', error);

  // Handle AI service errors
  if (error.code === ErrorCode.AI_SERVICE_ERROR) {
    res.status(503).json({
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle validation errors
  if (error.code === ErrorCode.VALIDATION_ERROR) {
    res.status(400).json({
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle not found errors
  if (error.code === ErrorCode.NOT_FOUND) {
    res.status(404).json({
      code: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle database errors
  if (error.message?.includes('Database')) {
    res.status(500).json({
      code: ErrorCode.DATABASE_ERROR,
      message: 'Database operation failed',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Generic error
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    details: error.message,
    timestamp: new Date().toISOString(),
  });
}

export default router;
