import { Router, Request, Response } from 'express';
import { BudgetService } from '../services/budget.service.js';
import { BudgetRepository } from '../repositories/budget.repository.js';
import { AlertRepository } from '../repositories/alert.repository.js';
import { getAuthenticatedClient } from '../config/supabase.js';
import { authenticate, asyncHandler } from '../middleware/index.js';

const router = Router();

/**
 * POST /api/budgets
 * Create a new budget
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const budgetRepository = new BudgetRepository(supabase);
    const alertRepository = new AlertRepository(supabase);
    const budgetService = new BudgetService(budgetRepository, alertRepository);
    
    const budget = await budgetService.create(userId, req.body);

    res.status(201).json(budget);
  })
);

/**
 * GET /api/budgets
 * Get all budgets for the authenticated user
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const budgetRepository = new BudgetRepository(supabase);
    const alertRepository = new AlertRepository(supabase);
    const budgetService = new BudgetService(budgetRepository, alertRepository);
    
    const budgets = await budgetService.findAll(userId);

    res.json({
      count: budgets.length,
      budgets,
    });
  })
);

/**
 * GET /api/budgets/:id
 * Get a single budget by ID
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const budgetRepository = new BudgetRepository(supabase);
    const alertRepository = new AlertRepository(supabase);
    const budgetService = new BudgetService(budgetRepository, alertRepository);
    const { id } = req.params;

    const budget = await budgetService.findById(userId, id);

    res.json(budget);
  })
);

/**
 * GET /api/budgets/:id/progress
 * Get budget progress with current spending and alerts
 */
router.get(
  '/:id/progress',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const budgetRepository = new BudgetRepository(supabase);
    const alertRepository = new AlertRepository(supabase);
    const budgetService = new BudgetService(budgetRepository, alertRepository);
    const { id } = req.params;

    const progress = await budgetService.calculateProgress(userId, id);

    res.json(progress);
  })
);

/**
 * PUT /api/budgets/:id
 * Update a budget
 */
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const budgetRepository = new BudgetRepository(supabase);
    const alertRepository = new AlertRepository(supabase);
    const budgetService = new BudgetService(budgetRepository, alertRepository);
    const { id } = req.params;

    const budget = await budgetService.update(userId, id, req.body);

    res.json(budget);
  })
);

/**
 * DELETE /api/budgets/:id
 * Delete a budget
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const budgetRepository = new BudgetRepository(supabase);
    const alertRepository = new AlertRepository(supabase);
    const budgetService = new BudgetService(budgetRepository, alertRepository);
    const { id } = req.params;

    await budgetService.delete(userId, id);

    res.status(204).send();
  })
);

export default router;
