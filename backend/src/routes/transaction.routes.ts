import { Router, Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { getAuthenticatedClient } from '../config/supabase.js';
import {
  authenticate,
  asyncHandler,
  AppError,
  ErrorCode,
  uploadLimiter,
} from '../middleware/index.js';

const router = Router();

/**
 * POST /api/transactions
 * Create a single transaction
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const transactionRepository = new TransactionRepository(supabase);
    const transactionService = new TransactionService(transactionRepository);
    
    const transaction = await transactionService.create(userId, req.body);

    res.status(201).json(transaction);
  })
);

/**
 * POST /api/transactions/bulk
 * Create multiple transactions (CSV upload)
 */
router.post(
  '/bulk',
  uploadLimiter,
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const transactionRepository = new TransactionRepository(supabase);
    const transactionService = new TransactionService(transactionRepository);
    
    const { transactions } = req.body;

    if (!Array.isArray(transactions)) {
      throw new AppError(
        'Request body must contain a "transactions" array',
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const created = await transactionService.createBulk(userId, transactions);

    res.status(201).json({
      message: `Successfully created ${created.length} transactions`,
      count: created.length,
      transactions: created,
    });
  })
);

/**
 * GET /api/transactions
 * Get all transactions with optional filters
 * Query params: startDate, endDate, category, minAmount, maxAmount, merchant
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const transactionRepository = new TransactionRepository(supabase);
    const transactionService = new TransactionService(transactionRepository);

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
    if (req.query.minAmount) {
      filters.minAmount = parseFloat(req.query.minAmount as string);
    }
    if (req.query.maxAmount) {
      filters.maxAmount = parseFloat(req.query.maxAmount as string);
    }
    if (req.query.merchant) {
      filters.merchant = req.query.merchant as string;
    }

    const transactions = await transactionService.findAll(userId, filters);

    res.json({
      count: transactions.length,
      transactions,
    });
  })
);

/**
 * GET /api/transactions/:id
 * Get a single transaction by ID
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const transactionRepository = new TransactionRepository(supabase);
    const transactionService = new TransactionService(transactionRepository);
    const { id } = req.params;

    const transaction = await transactionService.findById(userId, id);

    res.json(transaction);
  })
);

/**
 * PUT /api/transactions/:id
 * Update a transaction
 */
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const transactionRepository = new TransactionRepository(supabase);
    const transactionService = new TransactionService(transactionRepository);
    const { id } = req.params;

    const transaction = await transactionService.update(userId, id, req.body);

    res.json(transaction);
  })
);

/**
 * DELETE /api/transactions/:id
 * Delete a transaction
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const transactionRepository = new TransactionRepository(supabase);
    const transactionService = new TransactionService(transactionRepository);
    const { id } = req.params;

    await transactionService.delete(userId, id);

    res.status(204).send();
  })
);

export default router;
