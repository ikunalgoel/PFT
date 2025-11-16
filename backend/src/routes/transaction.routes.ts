import { Router, Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { ErrorCode } from '../types/database.js';

const router = Router();

// Initialize service
const transactionRepository = new TransactionRepository(supabase);
const transactionService = new TransactionService(transactionRepository);

/**
 * POST /api/transactions
 * Create a single transaction
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const transaction = await transactionService.create(userId, req.body);

    res.status(201).json(transaction);
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * POST /api/transactions/bulk
 * Create multiple transactions (CSV upload)
 */
router.post('/bulk', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { transactions } = req.body;

    if (!Array.isArray(transactions)) {
      return res.status(400).json({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Request body must contain a "transactions" array',
        timestamp: new Date().toISOString(),
      });
    }

    const created = await transactionService.createBulk(userId, transactions);

    res.status(201).json({
      message: `Successfully created ${created.length} transactions`,
      count: created.length,
      transactions: created,
    });
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * GET /api/transactions
 * Get all transactions with optional filters
 * Query params: startDate, endDate, category, minAmount, maxAmount, merchant
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
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
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * GET /api/transactions/:id
 * Get a single transaction by ID
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const transaction = await transactionService.findById(userId, id);

    res.json(transaction);
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * PUT /api/transactions/:id
 * Update a transaction
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const transaction = await transactionService.update(userId, id, req.body);

    res.json(transaction);
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * DELETE /api/transactions/:id
 * Delete a transaction
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await transactionService.delete(userId, id);

    res.status(204).send();
  } catch (error: any) {
    handleError(error, res);
  }
});

/**
 * Error handler helper
 */
function handleError(error: any, res: Response): void {
  console.error('Transaction API error:', error);

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
