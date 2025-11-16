import { Router, Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { BudgetRepository } from '../repositories/budget.repository.js';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { ErrorCode } from '../types/database.js';

const router = Router();

// Initialize service
const transactionRepository = new TransactionRepository(supabase);
const budgetRepository = new BudgetRepository(supabase);
const analyticsService = new AnalyticsService(
  transactionRepository,
  budgetRepository
);

/**
 * GET /api/analytics/summary
 * Get spending summary with total and category breakdown
 * Query params: startDate, endDate, category
 */
router.get('/summary', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

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
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * GET /api/analytics/trends
 * Get spending trends over time
 * Query params: startDate, endDate, category, groupBy (day|week|month)
 */
router.get('/trends', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

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
        return res.status(400).json({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'groupBy must be one of: day, week, month',
          timestamp: new Date().toISOString(),
        });
      }
      filters.groupBy = groupBy;
    }

    const trends = await analyticsService.getTrends(userId, filters);

    res.json({
      count: trends.length,
      trends,
    });
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * GET /api/analytics/categories
 * Get category breakdown for pie chart data
 * Query params: startDate, endDate
 */
router.get('/categories', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

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
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * GET /api/analytics/budget-comparison
 * Get budget vs actual spending comparison
 * Query params: startDate, endDate
 */
router.get(
  '/budget-comparison',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

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
    } catch (error: any) {
      handleError(error, res);
    }
  }
);

/**
 * Error handler helper
 */
function handleError(error: any, res: Response): void {
  console.error('Analytics API error:', error);

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
