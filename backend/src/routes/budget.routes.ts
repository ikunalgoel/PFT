import { Router, Request, Response } from 'express';
import { BudgetService } from '../services/budget.service.js';
import { BudgetRepository } from '../repositories/budget.repository.js';
import { AlertRepository } from '../repositories/alert.repository.js';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { ErrorCode } from '../types/database.js';

const router = Router();

// Initialize service
const budgetRepository = new BudgetRepository(supabase);
const alertRepository = new AlertRepository(supabase);
const budgetService = new BudgetService(budgetRepository, alertRepository);

/**
 * POST /api/budgets
 * Create a new budget
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const budget = await budgetService.create(userId, req.body);

    res.status(201).json(budget);
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * GET /api/budgets
 * Get all budgets for the authenticated user
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const budgets = await budgetService.findAll(userId);

    res.json({
      count: budgets.length,
      budgets,
    });
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * GET /api/budgets/:id
 * Get a single budget by ID
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const budget = await budgetService.findById(userId, id);

    res.json(budget);
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * GET /api/budgets/:id/progress
 * Get budget progress with current spending and alerts
 */
router.get('/:id/progress', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const progress = await budgetService.calculateProgress(userId, id);

    res.json(progress);
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * PUT /api/budgets/:id
 * Update a budget
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const budget = await budgetService.update(userId, id, req.body);

    res.json(budget);
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * DELETE /api/budgets/:id
 * Delete a budget
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await budgetService.delete(userId, id);

    res.status(204).send();
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * Error handler helper
 */
function handleError(error: any, res: Response): void {
  console.error('Budget API error:', error);

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
