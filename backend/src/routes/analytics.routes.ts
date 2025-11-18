import { Router, Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { BudgetRepository } from '../repositories/budget.repository.js';
import { getAuthenticatedClient } from '../config/supabase.js';
import {
  authenticate,
  asyncHandler,
  AppError,
  ErrorCode,
} from '../middleware/index.js';

const router = Router();

/**
 * GET /api/analytics/summary
 * Get spending summary with total and category breakdown
 * Query params: startDate, endDate, category
 */
router.get(
  '/summary',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const transactionRepository = new TransactionRepository(supabase);
    const budgetRepository = new BudgetRepository(supabase);
    const analyticsService = new AnalyticsService(transactionRepository, budgetRepository);

    // Build filters from query params
    const filters: any = {};

    if (req.query.startDate) {
      filters.startDate = req.query.startDate as string;
    }
    if (req.query.endDate) {
      filters.endDate = req.query.endDate as string;
    }
    if (req.query.category) {
      filters.category = req.query.category as string;
    }

    const summary = await analyticsService.getSummary(userId, filters);

    res.json(summary);
  })
);

/**
 * GET /api/analytics/trends
 * Get spending trends over time
 * Query params: startDate, endDate, category, groupBy (day|week|month)
 */
router.get(
  '/trends',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const transactionRepository = new TransactionRepository(supabase);
    const budgetRepository = new BudgetRepository(supabase);
    const analyticsService = new AnalyticsService(transactionRepository, budgetRepository);

    // Build filters from query params
    const filters: any = {};

    if (req.query.startDate) {
      filters.startDate = req.query.startDate as string;
    }
    if (req.query.endDate) {
      filters.endDate = req.query.endDate as string;
    }
    if (req.query.category) {
      filters.category = req.query.category as string;
    }
    if (req.query.groupBy) {
      const groupBy = req.query.groupBy as string;
      if (!['day', 'week', 'month'].includes(groupBy)) {
        throw new AppError(
          'groupBy must be one of: day, week, month',
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }
      filters.groupBy = groupBy;
    }

    const trends = await analyticsService.getTrends(userId, filters);

    res.json({
      count: trends.length,
      trends,
    });
  })
);

/**
 * GET /api/analytics/categories
 * Get category breakdown for pie chart data
 * Query params: startDate, endDate
 */
router.get(
  '/categories',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const transactionRepository = new TransactionRepository(supabase);
    const budgetRepository = new BudgetRepository(supabase);
    const analyticsService = new AnalyticsService(transactionRepository, budgetRepository);

    // Build filters from query params
    const filters: any = {};

    if (req.query.startDate) {
      filters.startDate = req.query.startDate as string;
    }
    if (req.query.endDate) {
      filters.endDate = req.query.endDate as string;
    }

    const categories = await analyticsService.getCategoryBreakdown(
      userId,
      filters
    );

    res.json({
      count: categories.length,
      categories,
    });
  })
);

/**
 * GET /api/analytics/budget-comparison
 * Get budget vs actual spending comparison
 * Query params: startDate, endDate
 */
router.get(
  '/budget-comparison',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const transactionRepository = new TransactionRepository(supabase);
    const budgetRepository = new BudgetRepository(supabase);
    const analyticsService = new AnalyticsService(transactionRepository, budgetRepository);

    // Build filters from query params
    const filters: any = {};

    if (req.query.startDate) {
      filters.startDate = req.query.startDate as string;
    }
    if (req.query.endDate) {
      filters.endDate = req.query.endDate as string;
    }

    const comparison = await analyticsService.getBudgetComparison(
      userId,
      filters
    );

    res.json({
      count: comparison.length,
      budgets: comparison,
    });
  })
);

export default router;
