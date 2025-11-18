import { Router, Request, Response } from 'express';
import { SettingsService } from '../services/settings.service.js';
import { SettingsRepository } from '../repositories/settings.repository.js';
import { getAuthenticatedClient } from '../config/supabase.js';
import { authenticate, asyncHandler } from '../middleware/index.js';
import { validateCurrency } from '../utils/currency.js';

const router = Router();

/**
 * GET /api/settings
 * Get user settings (creates default if not exists)
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const settingsRepository = new SettingsRepository(supabase);
    const settingsService = new SettingsService(settingsRepository);

    const settings = await settingsService.getUserSettings(userId);

    res.json(settings);
  })
);

/**
 * PUT /api/settings
 * Update user settings
 */
router.put(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const supabase = getAuthenticatedClient(req.accessToken!);
    const settingsRepository = new SettingsRepository(supabase);
    const settingsService = new SettingsService(settingsRepository);

    // Validate currency if provided
    if (req.body.currency && !validateCurrency(req.body.currency)) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid currency code',
        details: ['Currency must be GBP or INR'],
      });
    }

    const settings = await settingsService.updateSettings(userId, req.body);

    res.json(settings);
  })
);

/**
 * POST /api/settings/currency
 * Update currency preference
 */
router.post(
  '/currency',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { currency } = req.body;

    // Validate currency
    if (!currency) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Currency is required',
        details: ['Currency field is required'],
      });
    }

    if (!validateCurrency(currency)) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid currency code',
        details: ['Currency must be GBP or INR'],
      });
    }

    const supabase = getAuthenticatedClient(req.accessToken!);
    const settingsRepository = new SettingsRepository(supabase);
    const settingsService = new SettingsService(settingsRepository);

    const settings = await settingsService.updateCurrency(userId, currency);

    res.json(settings);
  })
);

export default router;
