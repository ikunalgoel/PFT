import { BudgetRepository } from '../repositories/budget.repository.js';
import { AlertRepository } from '../repositories/alert.repository.js';
import {
  Budget,
  BudgetInput,
  BudgetProgress,
  Alert,
  ErrorCode,
} from '../types/database.js';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Budget Service
 * Handles business logic for budget operations
 */
export class BudgetService {
  constructor(
    private budgetRepository: BudgetRepository,
    private alertRepository: AlertRepository
  ) {}

  /**
   * Create a new budget
   */
  async create(userId: string, input: BudgetInput): Promise<Budget> {
    // Validate input
    const validation = this.validateBudget(input);
    if (!validation.valid) {
      throw this.createValidationError(validation.errors);
    }

    return await this.budgetRepository.create(input, userId);
  }

  /**
   * Find all budgets for a user
   */
  async findAll(userId: string): Promise<Budget[]> {
    return await this.budgetRepository.findAll(userId);
  }

  /**
   * Find a single budget by ID
   */
  async findById(userId: string, id: string): Promise<Budget> {
    const budget = await this.budgetRepository.findById(id, userId);

    if (!budget) {
      throw this.createNotFoundError(id);
    }

    return budget;
  }

  /**
   * Update a budget
   */
  async update(
    userId: string,
    id: string,
    input: Partial<BudgetInput>
  ): Promise<Budget> {
    // Check if budget exists
    const exists = await this.budgetRepository.exists(id, userId);
    if (!exists) {
      throw this.createNotFoundError(id);
    }

    // Validate partial input
    if (Object.keys(input).length > 0) {
      const validation = this.validatePartialBudget(input);
      if (!validation.valid) {
        throw this.createValidationError(validation.errors);
      }
    }

    return await this.budgetRepository.update(id, input, userId);
  }

  /**
   * Delete a budget
   */
  async delete(userId: string, id: string): Promise<void> {
    // Check if budget exists
    const exists = await this.budgetRepository.exists(id, userId);
    if (!exists) {
      throw this.createNotFoundError(id);
    }

    await this.budgetRepository.delete(id, userId);
  }

  /**
   * Calculate budget progress and check thresholds
   */
  async calculateProgress(userId: string, budgetId: string): Promise<BudgetProgress> {
    const progress = await this.budgetRepository.getBudgetProgress(userId, budgetId);

    if (!progress) {
      throw this.createNotFoundError(budgetId);
    }

    // Check thresholds and create alerts if needed
    await this.checkThresholds(budgetId, progress.percentage);

    // Refresh alerts after threshold check
    const updatedProgress = await this.budgetRepository.getBudgetProgress(userId, budgetId);
    return updatedProgress!;
  }

  /**
   * Check budget thresholds and create/resolve alerts
   */
  async checkThresholds(budgetId: string, percentage: number): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Check critical threshold (100%)
    if (percentage >= 100) {
      const criticalExists = await this.alertRepository.existsForThreshold(
        budgetId,
        100
      );

      if (!criticalExists) {
        const alert = await this.alertRepository.create(budgetId, 'critical', 100);
        alerts.push(alert);
      }
    } else {
      // Resolve critical alerts if spending drops below 100%
      const activeAlerts = await this.alertRepository.findActiveByBudget(budgetId);
      const criticalAlerts = activeAlerts.filter(
        (a) => a.alert_type === 'critical'
      );
      
      for (const alert of criticalAlerts) {
        await this.alertRepository.resolve(alert.id);
      }
    }

    // Check warning threshold (80%)
    if (percentage >= 80 && percentage < 100) {
      const warningExists = await this.alertRepository.existsForThreshold(
        budgetId,
        80
      );

      if (!warningExists) {
        const alert = await this.alertRepository.create(budgetId, 'warning', 80);
        alerts.push(alert);
      }
    } else if (percentage < 80) {
      // Resolve warning alerts if spending drops below 80%
      const activeAlerts = await this.alertRepository.findActiveByBudget(budgetId);
      const warningAlerts = activeAlerts.filter(
        (a) => a.alert_type === 'warning'
      );
      
      for (const alert of warningAlerts) {
        await this.alertRepository.resolve(alert.id);
      }
    }

    return alerts;
  }

  /**
   * Reset budget period (for monthly budgets)
   */
  async resetPeriod(userId: string, budgetId: string): Promise<Budget> {
    const budget = await this.findById(userId, budgetId);

    if (budget.period_type !== 'monthly') {
      throw new Error('Only monthly budgets can be reset');
    }

    // Resolve all active alerts for this budget
    await this.alertRepository.resolveByBudget(budgetId);

    // For monthly budgets, the period is automatically calculated
    // based on the current month, so no update is needed
    // Just return the budget
    return budget;
  }

  /**
   * Get all budget progress for a user
   */
  async getAllProgress(userId: string): Promise<BudgetProgress[]> {
    return await this.budgetRepository.getAllBudgetProgress(userId);
  }

  /**
   * Validate a complete budget
   */
  private validateBudget(input: BudgetInput): ValidationResult {
    const errors: string[] = [];

    // Validate name
    if (!input.name) {
      errors.push('Name is required');
    } else if (input.name.trim().length === 0) {
      errors.push('Name cannot be empty');
    }

    // Validate amount
    if (input.amount === undefined || input.amount === null) {
      errors.push('Amount is required');
    } else if (typeof input.amount !== 'number' || input.amount <= 0) {
      errors.push('Amount must be a positive number');
    }

    // Validate period type
    if (!input.period_type) {
      errors.push('Period type is required');
    } else if (!['monthly', 'custom'].includes(input.period_type)) {
      errors.push('Period type must be "monthly" or "custom"');
    }

    // Validate custom period dates
    if (input.period_type === 'custom') {
      if (!input.period_start) {
        errors.push('Period start date is required for custom periods');
      } else if (!this.isValidDate(input.period_start)) {
        errors.push('Invalid period start date format (use YYYY-MM-DD)');
      }

      if (!input.period_end) {
        errors.push('Period end date is required for custom periods');
      } else if (!this.isValidDate(input.period_end)) {
        errors.push('Invalid period end date format (use YYYY-MM-DD)');
      }

      // Check that end date is after start date
      if (input.period_start && input.period_end) {
        const start = new Date(input.period_start);
        const end = new Date(input.period_end);
        if (end <= start) {
          errors.push('Period end date must be after start date');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate partial budget (for updates)
   */
  private validatePartialBudget(
    input: Partial<BudgetInput>
  ): ValidationResult {
    const errors: string[] = [];

    // Validate name if provided
    if (input.name !== undefined) {
      if (!input.name || input.name.trim().length === 0) {
        errors.push('Name cannot be empty');
      }
    }

    // Validate amount if provided
    if (input.amount !== undefined) {
      if (typeof input.amount !== 'number' || input.amount <= 0) {
        errors.push('Amount must be a positive number');
      }
    }

    // Validate period type if provided
    if (input.period_type !== undefined) {
      if (!['monthly', 'custom'].includes(input.period_type)) {
        errors.push('Period type must be "monthly" or "custom"');
      }
    }

    // Validate custom period dates if provided
    if (input.period_start !== undefined) {
      if (!this.isValidDate(input.period_start)) {
        errors.push('Invalid period start date format (use YYYY-MM-DD)');
      }
    }

    if (input.period_end !== undefined) {
      if (!this.isValidDate(input.period_end)) {
        errors.push('Invalid period end date format (use YYYY-MM-DD)');
      }
    }

    // Check date range if both dates are provided
    if (input.period_start && input.period_end) {
      const start = new Date(input.period_start);
      const end = new Date(input.period_end);
      if (end <= start) {
        errors.push('Period end date must be after start date');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if date string is valid ISO format
   */
  private isValidDate(dateString: string): boolean {
    // Check format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }

    // Check if it's a valid date
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Create validation error
   */
  private createValidationError(errors: string[]): Error {
    const error = new Error(errors.join('; '));
    (error as any).code = ErrorCode.VALIDATION_ERROR;
    (error as any).details = errors;
    return error;
  }

  /**
   * Create not found error
   */
  private createNotFoundError(id: string): Error {
    const error = new Error(`Budget with ID ${id} not found`);
    (error as any).code = ErrorCode.NOT_FOUND;
    return error;
  }
}
