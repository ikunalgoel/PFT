import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BudgetService } from './budget.service.js';
import { BudgetRepository } from '../repositories/budget.repository.js';
import { AlertRepository } from '../repositories/alert.repository.js';
import { Budget, BudgetInput, BudgetProgress, Alert } from '../types/database.js';

// Mock repositories
const mockBudgetRepository = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  exists: vi.fn(),
  getBudgetProgress: vi.fn(),
  getAllBudgetProgress: vi.fn(),
} as unknown as BudgetRepository;

const mockAlertRepository = {
  create: vi.fn(),
  findActiveByBudget: vi.fn(),
  existsForThreshold: vi.fn(),
  resolve: vi.fn(),
  resolveByBudget: vi.fn(),
} as unknown as AlertRepository;

describe('BudgetService', () => {
  let service: BudgetService;
  const userId = 'test-user-id';

  beforeEach(() => {
    service = new BudgetService(mockBudgetRepository, mockAlertRepository);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a valid monthly budget', async () => {
      const input: BudgetInput = {
        name: 'Groceries',
        amount: 500.00,
        period_type: 'monthly',
        category: 'Food',
      };

      const expected: Budget = {
        id: '123',
        user_id: userId,
        ...input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(mockBudgetRepository.create).mockResolvedValue(expected);

      const result = await service.create(userId, input);

      expect(result).toEqual(expected);
      expect(mockBudgetRepository.create).toHaveBeenCalledWith(input, userId);
    });

    it('should create a valid custom period budget', async () => {
      const input: BudgetInput = {
        name: 'Vacation',
        amount: 2000.00,
        period_type: 'custom',
        period_start: '2024-06-01',
        period_end: '2024-06-30',
      };

      const expected: Budget = {
        id: '456',
        user_id: userId,
        ...input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(mockBudgetRepository.create).mockResolvedValue(expected);

      const result = await service.create(userId, input);

      expect(result).toEqual(expected);
    });

    it('should reject budget with missing name', async () => {
      const input = {
        amount: 500.00,
        period_type: 'monthly',
      } as BudgetInput;

      await expect(service.create(userId, input)).rejects.toThrow('Name is required');
    });

    it('should reject budget with empty name', async () => {
      const input: BudgetInput = {
        name: '   ',
        amount: 500.00,
        period_type: 'monthly',
      };

      await expect(service.create(userId, input)).rejects.toThrow('Name cannot be empty');
    });

    it('should reject budget with missing amount', async () => {
      const input = {
        name: 'Groceries',
        period_type: 'monthly',
      } as BudgetInput;

      await expect(service.create(userId, input)).rejects.toThrow('Amount is required');
    });

    it('should reject budget with negative amount', async () => {
      const input: BudgetInput = {
        name: 'Groceries',
        amount: -500.00,
        period_type: 'monthly',
      };

      await expect(service.create(userId, input)).rejects.toThrow('Amount must be a positive number');
    });

    it('should reject budget with invalid period type', async () => {
      const input = {
        name: 'Groceries',
        amount: 500.00,
        period_type: 'yearly',
      } as any;

      await expect(service.create(userId, input)).rejects.toThrow('Period type must be "monthly" or "custom"');
    });

    it('should reject custom budget without start date', async () => {
      const input: BudgetInput = {
        name: 'Vacation',
        amount: 2000.00,
        period_type: 'custom',
        period_end: '2024-06-30',
      };

      await expect(service.create(userId, input)).rejects.toThrow('Period start date is required');
    });

    it('should reject custom budget without end date', async () => {
      const input: BudgetInput = {
        name: 'Vacation',
        amount: 2000.00,
        period_type: 'custom',
        period_start: '2024-06-01',
      };

      await expect(service.create(userId, input)).rejects.toThrow('Period end date is required');
    });

    it('should reject custom budget with end date before start date', async () => {
      const input: BudgetInput = {
        name: 'Vacation',
        amount: 2000.00,
        period_type: 'custom',
        period_start: '2024-06-30',
        period_end: '2024-06-01',
      };

      await expect(service.create(userId, input)).rejects.toThrow('Period end date must be after start date');
    });
  });

  describe('findAll', () => {
    it('should return all budgets for a user', async () => {
      const expected: Budget[] = [
        {
          id: '1',
          user_id: userId,
          name: 'Groceries',
          amount: 500.00,
          period_type: 'monthly',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      vi.mocked(mockBudgetRepository.findAll).mockResolvedValue(expected);

      const result = await service.findAll(userId);

      expect(result).toEqual(expected);
      expect(mockBudgetRepository.findAll).toHaveBeenCalledWith(userId);
    });
  });

  describe('findById', () => {
    it('should return budget when found', async () => {
      const expected: Budget = {
        id: '123',
        user_id: userId,
        name: 'Groceries',
        amount: 500.00,
        period_type: 'monthly',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(mockBudgetRepository.findById).mockResolvedValue(expected);

      const result = await service.findById(userId, '123');

      expect(result).toEqual(expected);
    });

    it('should throw error when budget not found', async () => {
      vi.mocked(mockBudgetRepository.findById).mockResolvedValue(null);

      await expect(service.findById(userId, '999')).rejects.toThrow('not found');
    });
  });

  describe('update', () => {
    it('should update budget with valid data', async () => {
      const update = { amount: 600.00 };
      const expected: Budget = {
        id: '123',
        user_id: userId,
        name: 'Groceries',
        amount: 600.00,
        period_type: 'monthly',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(mockBudgetRepository.exists).mockResolvedValue(true);
      vi.mocked(mockBudgetRepository.update).mockResolvedValue(expected);

      const result = await service.update(userId, '123', update);

      expect(result).toEqual(expected);
    });

    it('should throw error when updating non-existent budget', async () => {
      vi.mocked(mockBudgetRepository.exists).mockResolvedValue(false);

      await expect(service.update(userId, '999', { amount: 600.00 })).rejects.toThrow('not found');
    });

    it('should reject update with invalid amount', async () => {
      vi.mocked(mockBudgetRepository.exists).mockResolvedValue(true);

      await expect(service.update(userId, '123', { amount: -500 })).rejects.toThrow('positive number');
    });
  });

  describe('delete', () => {
    it('should delete existing budget', async () => {
      vi.mocked(mockBudgetRepository.exists).mockResolvedValue(true);
      vi.mocked(mockBudgetRepository.delete).mockResolvedValue(undefined);

      await service.delete(userId, '123');

      expect(mockBudgetRepository.delete).toHaveBeenCalledWith('123', userId);
    });

    it('should throw error when deleting non-existent budget', async () => {
      vi.mocked(mockBudgetRepository.exists).mockResolvedValue(false);

      await expect(service.delete(userId, '999')).rejects.toThrow('not found');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress and check thresholds', async () => {
      const budget: Budget = {
        id: '123',
        user_id: userId,
        name: 'Groceries',
        amount: 500.00,
        period_type: 'monthly',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const progress: BudgetProgress = {
        budget_id: '123',
        budget,
        current_spending: 250.00,
        percentage: 50,
        remaining: 250.00,
        alerts: [],
      };

      vi.mocked(mockBudgetRepository.getBudgetProgress).mockResolvedValue(progress);
      vi.mocked(mockAlertRepository.existsForThreshold).mockResolvedValue(false);
      vi.mocked(mockAlertRepository.findActiveByBudget).mockResolvedValue([]);

      const result = await service.calculateProgress(userId, '123');

      expect(result).toBeDefined();
      expect(mockBudgetRepository.getBudgetProgress).toHaveBeenCalled();
    });

    it('should throw error when budget not found', async () => {
      vi.mocked(mockBudgetRepository.getBudgetProgress).mockResolvedValue(null);

      await expect(service.calculateProgress(userId, '999')).rejects.toThrow('not found');
    });
  });

  describe('checkThresholds', () => {
    const budgetId = '123';

    it('should create warning alert at 80% threshold', async () => {
      const alert: Alert = {
        id: 'alert-1',
        budget_id: budgetId,
        alert_type: 'warning',
        threshold_percentage: 80,
        triggered_at: new Date().toISOString(),
        is_active: true,
      };

      vi.mocked(mockAlertRepository.existsForThreshold).mockResolvedValue(false);
      vi.mocked(mockAlertRepository.create).mockResolvedValue(alert);
      vi.mocked(mockAlertRepository.findActiveByBudget).mockResolvedValue([]);

      const result = await service.checkThresholds(budgetId, 85);

      expect(result).toHaveLength(1);
      expect(result[0].alert_type).toBe('warning');
      expect(mockAlertRepository.create).toHaveBeenCalledWith(budgetId, 'warning', 80);
    });

    it('should create critical alert at 100% threshold', async () => {
      const alert: Alert = {
        id: 'alert-2',
        budget_id: budgetId,
        alert_type: 'critical',
        threshold_percentage: 100,
        triggered_at: new Date().toISOString(),
        is_active: true,
      };

      vi.mocked(mockAlertRepository.existsForThreshold).mockResolvedValue(false);
      vi.mocked(mockAlertRepository.create).mockResolvedValue(alert);
      vi.mocked(mockAlertRepository.findActiveByBudget).mockResolvedValue([]);

      const result = await service.checkThresholds(budgetId, 105);

      expect(result).toHaveLength(1);
      expect(result[0].alert_type).toBe('critical');
      expect(mockAlertRepository.create).toHaveBeenCalledWith(budgetId, 'critical', 100);
    });

    it('should not create duplicate alerts', async () => {
      vi.mocked(mockAlertRepository.existsForThreshold).mockResolvedValue(true);
      vi.mocked(mockAlertRepository.findActiveByBudget).mockResolvedValue([]);

      const result = await service.checkThresholds(budgetId, 85);

      expect(result).toHaveLength(0);
      expect(mockAlertRepository.create).not.toHaveBeenCalled();
    });

    it('should resolve warning alerts when spending drops below 80%', async () => {
      const warningAlert: Alert = {
        id: 'alert-1',
        budget_id: budgetId,
        alert_type: 'warning',
        threshold_percentage: 80,
        triggered_at: new Date().toISOString(),
        is_active: true,
      };

      vi.mocked(mockAlertRepository.existsForThreshold).mockResolvedValue(false);
      vi.mocked(mockAlertRepository.findActiveByBudget).mockResolvedValue([warningAlert]);

      await service.checkThresholds(budgetId, 75);

      expect(mockAlertRepository.resolve).toHaveBeenCalledWith('alert-1');
    });

    it('should resolve critical alerts when spending drops below 100%', async () => {
      const criticalAlert: Alert = {
        id: 'alert-2',
        budget_id: budgetId,
        alert_type: 'critical',
        threshold_percentage: 100,
        triggered_at: new Date().toISOString(),
        is_active: true,
      };

      vi.mocked(mockAlertRepository.existsForThreshold).mockResolvedValue(false);
      vi.mocked(mockAlertRepository.findActiveByBudget).mockResolvedValue([criticalAlert]);

      await service.checkThresholds(budgetId, 95);

      expect(mockAlertRepository.resolve).toHaveBeenCalledWith('alert-2');
    });
  });

  describe('resetPeriod', () => {
    it('should reset monthly budget period', async () => {
      const budget: Budget = {
        id: '123',
        user_id: userId,
        name: 'Groceries',
        amount: 500.00,
        period_type: 'monthly',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(mockBudgetRepository.findById).mockResolvedValue(budget);
      vi.mocked(mockAlertRepository.resolveByBudget).mockResolvedValue(undefined);

      const result = await service.resetPeriod(userId, '123');

      expect(result).toEqual(budget);
      expect(mockAlertRepository.resolveByBudget).toHaveBeenCalledWith('123');
    });

    it('should throw error when resetting custom budget', async () => {
      const budget: Budget = {
        id: '123',
        user_id: userId,
        name: 'Vacation',
        amount: 2000.00,
        period_type: 'custom',
        period_start: '2024-06-01',
        period_end: '2024-06-30',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(mockBudgetRepository.findById).mockResolvedValue(budget);

      await expect(service.resetPeriod(userId, '123')).rejects.toThrow('Only monthly budgets can be reset');
    });
  });

  describe('getAllProgress', () => {
    it('should return progress for all budgets', async () => {
      const budget: Budget = {
        id: '123',
        user_id: userId,
        name: 'Groceries',
        amount: 500.00,
        period_type: 'monthly',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const progress: BudgetProgress[] = [
        {
          budget_id: '123',
          budget,
          current_spending: 250.00,
          percentage: 50,
          remaining: 250.00,
          alerts: [],
        },
      ];

      vi.mocked(mockBudgetRepository.getAllBudgetProgress).mockResolvedValue(progress);

      const result = await service.getAllProgress(userId);

      expect(result).toEqual(progress);
      expect(mockBudgetRepository.getAllBudgetProgress).toHaveBeenCalledWith(userId);
    });
  });
});
