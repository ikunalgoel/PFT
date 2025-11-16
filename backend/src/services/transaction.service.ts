import { TransactionRepository } from '../repositories/transaction.repository.js';
import {
  Transaction,
  TransactionInput,
  TransactionFilters,
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
 * CSV row interface for bulk uploads
 */
export interface CSVTransactionRow {
  date: string;
  amount: string | number;
  category: string;
  merchant?: string;
  notes?: string;
}

/**
 * Transaction Service
 * Handles business logic for transaction operations
 */
export class TransactionService {
  constructor(private repository: TransactionRepository) {}

  /**
   * Create a single transaction
   */
  async create(userId: string, input: TransactionInput): Promise<Transaction> {
    // Validate input
    const validation = this.validateTransaction(input);
    if (!validation.valid) {
      throw this.createValidationError(validation.errors);
    }

    return await this.repository.create(input, userId);
  }

  /**
   * Create multiple transactions in bulk (for CSV uploads)
   */
  async createBulk(
    userId: string,
    inputs: TransactionInput[]
  ): Promise<Transaction[]> {
    // Validate all transactions
    const errors: string[] = [];
    inputs.forEach((input, index) => {
      const validation = this.validateTransaction(input);
      if (!validation.valid) {
        errors.push(`Row ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });

    if (errors.length > 0) {
      throw this.createValidationError(errors);
    }

    return await this.repository.createMany(inputs, userId);
  }

  /**
   * Find all transactions with optional filters
   */
  async findAll(
    userId: string,
    filters: TransactionFilters = {}
  ): Promise<Transaction[]> {
    if (Object.keys(filters).length === 0) {
      return await this.repository.findAll(userId);
    }

    return await this.repository.findWithFilters(userId, filters);
  }

  /**
   * Find a single transaction by ID
   */
  async findById(userId: string, id: string): Promise<Transaction> {
    const transaction = await this.repository.findById(id, userId);

    if (!transaction) {
      throw this.createNotFoundError(id);
    }

    return transaction;
  }

  /**
   * Update a transaction
   */
  async update(
    userId: string,
    id: string,
    input: Partial<TransactionInput>
  ): Promise<Transaction> {
    // Check if transaction exists
    const exists = await this.repository.exists(id, userId);
    if (!exists) {
      throw this.createNotFoundError(id);
    }

    // Validate partial input
    if (Object.keys(input).length > 0) {
      const validation = this.validatePartialTransaction(input);
      if (!validation.valid) {
        throw this.createValidationError(validation.errors);
      }
    }

    return await this.repository.update(id, input, userId);
  }

  /**
   * Delete a transaction
   */
  async delete(userId: string, id: string): Promise<void> {
    // Check if transaction exists
    const exists = await this.repository.exists(id, userId);
    if (!exists) {
      throw this.createNotFoundError(id);
    }

    await this.repository.delete(id, userId);
  }

  /**
   * Validate CSV data for bulk upload
   */
  validateCSV(rows: CSVTransactionRow[]): ValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(rows) || rows.length === 0) {
      errors.push('CSV file is empty or invalid');
      return { valid: false, errors };
    }

    // Check required columns
    const requiredColumns = ['date', 'amount', 'category'];
    const firstRow = rows[0];
    const missingColumns = requiredColumns.filter(
      (col) => !(col in firstRow)
    );

    if (missingColumns.length > 0) {
      errors.push(
        `Missing required columns: ${missingColumns.join(', ')}`
      );
      return { valid: false, errors };
    }

    // Validate each row
    rows.forEach((row, index) => {
      const rowNum = index + 1;

      // Validate date
      if (!row.date || !this.isValidDate(row.date)) {
        errors.push(`Row ${rowNum}: Invalid date format`);
      }

      // Validate amount
      const amount = typeof row.amount === 'string' 
        ? parseFloat(row.amount) 
        : row.amount;
      
      if (isNaN(amount) || amount <= 0) {
        errors.push(`Row ${rowNum}: Invalid amount (must be positive number)`);
      }

      // Validate category
      if (!row.category || row.category.trim().length === 0) {
        errors.push(`Row ${rowNum}: Category is required`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert CSV rows to TransactionInput format
   */
  convertCSVToTransactions(rows: CSVTransactionRow[]): TransactionInput[] {
    return rows.map((row) => ({
      date: row.date,
      amount: typeof row.amount === 'string' 
        ? parseFloat(row.amount) 
        : row.amount,
      category: row.category.trim(),
      merchant: row.merchant?.trim(),
      notes: row.notes?.trim(),
    }));
  }

  /**
   * Validate a complete transaction
   */
  private validateTransaction(input: TransactionInput): ValidationResult {
    const errors: string[] = [];

    // Validate date
    if (!input.date) {
      errors.push('Date is required');
    } else if (!this.isValidDate(input.date)) {
      errors.push('Invalid date format (use YYYY-MM-DD)');
    }

    // Validate amount
    if (input.amount === undefined || input.amount === null) {
      errors.push('Amount is required');
    } else if (typeof input.amount !== 'number' || input.amount <= 0) {
      errors.push('Amount must be a positive number');
    }

    // Validate category
    if (!input.category) {
      errors.push('Category is required');
    } else if (input.category.trim().length === 0) {
      errors.push('Category cannot be empty');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate partial transaction (for updates)
   */
  private validatePartialTransaction(
    input: Partial<TransactionInput>
  ): ValidationResult {
    const errors: string[] = [];

    // Validate date if provided
    if (input.date !== undefined) {
      if (!this.isValidDate(input.date)) {
        errors.push('Invalid date format (use YYYY-MM-DD)');
      }
    }

    // Validate amount if provided
    if (input.amount !== undefined) {
      if (typeof input.amount !== 'number' || input.amount <= 0) {
        errors.push('Amount must be a positive number');
      }
    }

    // Validate category if provided
    if (input.category !== undefined) {
      if (!input.category || input.category.trim().length === 0) {
        errors.push('Category cannot be empty');
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
    const error = new Error(`Transaction with ID ${id} not found`);
    (error as any).code = ErrorCode.NOT_FOUND;
    return error;
  }
}
