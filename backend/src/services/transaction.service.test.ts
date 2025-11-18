import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransactionService } from './transaction.service.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { Transaction, TransactionInput } from '../types/database.js';

// Mock repository
const mockRepository = {
  create: vi.fn(),
  createMany: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  findWithFilters: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  exists: vi.fn(),
} as unknown as TransactionRepository;

describe('TransactionService', () => {
  let service: TransactionService;
  const userId = 'test-user-id';

  beforeEach(() => {
    service = new TransactionService(mockRepository);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a valid transaction', async () => {
      const input: TransactionInput = {
        date: '2024-01-15',
        amount: 50.00,
        category: 'Food',
        merchant: 'Test Store',
      };

      const expected: Transaction = {
        id: '123',
        user_id: userId,
        ...input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(mockRepository.create).mockResolvedValue(expected);

      const result = await service.create(userId, input);

      expect(result).toEqual(expected);
      expect(mockRepository.create).toHaveBeenCalledWith(input, userId);
    });

    it('should reject transaction with missing date', async () => {
      const input = {
        amount: 50.00,
        category: 'Food',
      } as TransactionInput;

      await expect(service.create(userId, input)).rejects.toThrow('Date is required');
    });

    it('should reject transaction with invalid date format', async () => {
      const input: TransactionInput = {
        date: '15-01-2024',
        amount: 50.00,
        category: 'Food',
      };

      await expect(service.create(userId, input)).rejects.toThrow('Invalid date format');
    });

    it('should reject transaction with missing amount', async () => {
      const input = {
        date: '2024-01-15',
        category: 'Food',
      } as TransactionInput;

      await expect(service.create(userId, input)).rejects.toThrow('Amount is required');
    });

    it('should reject transaction with negative amount', async () => {
      const input: TransactionInput = {
        date: '2024-01-15',
        amount: -50.00,
        category: 'Food',
      };

      await expect(service.create(userId, input)).rejects.toThrow('Amount must be a positive number');
    });

    it('should reject transaction with missing category', async () => {
      const input = {
        date: '2024-01-15',
        amount: 50.00,
      } as TransactionInput;

      await expect(service.create(userId, input)).rejects.toThrow('Category is required');
    });

    it('should reject transaction with empty category', async () => {
      const input: TransactionInput = {
        date: '2024-01-15',
        amount: 50.00,
        category: '   ',
      };

      await expect(service.create(userId, input)).rejects.toThrow('Category cannot be empty');
    });
  });

  describe('createBulk', () => {
    it('should create multiple valid transactions', async () => {
      const inputs: TransactionInput[] = [
        { date: '2024-01-15', amount: 50.00, category: 'Food' },
        { date: '2024-01-16', amount: 100.00, category: 'Transport' },
      ];

      const expected: Transaction[] = inputs.map((input, i) => ({
        id: `${i}`,
        user_id: userId,
        ...input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      vi.mocked(mockRepository.createMany).mockResolvedValue(expected);

      const result = await service.createBulk(userId, inputs);

      expect(result).toEqual(expected);
      expect(mockRepository.createMany).toHaveBeenCalledWith(inputs, userId);
    });

    it('should reject bulk creation if any transaction is invalid', async () => {
      const inputs: TransactionInput[] = [
        { date: '2024-01-15', amount: 50.00, category: 'Food' },
        { date: 'invalid', amount: 100.00, category: 'Transport' },
      ];

      await expect(service.createBulk(userId, inputs)).rejects.toThrow('Row 2');
    });
  });

  describe('findAll', () => {
    it('should return all transactions when no filters provided', async () => {
      const expected: Transaction[] = [
        {
          id: '1',
          user_id: userId,
          date: '2024-01-15',
          amount: 50.00,
          category: 'Food',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      vi.mocked(mockRepository.findAll).mockResolvedValue(expected);

      const result = await service.findAll(userId);

      expect(result).toEqual(expected);
      expect(mockRepository.findAll).toHaveBeenCalledWith(userId);
    });

    it('should return filtered transactions when filters provided', async () => {
      const filters = { category: 'Food', startDate: '2024-01-01' };
      const expected: Transaction[] = [];

      vi.mocked(mockRepository.findWithFilters).mockResolvedValue(expected);

      const result = await service.findAll(userId, filters);

      expect(result).toEqual(expected);
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith(userId, filters);
    });
  });

  describe('findById', () => {
    it('should return transaction when found', async () => {
      const expected: Transaction = {
        id: '123',
        user_id: userId,
        date: '2024-01-15',
        amount: 50.00,
        category: 'Food',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(expected);

      const result = await service.findById(userId, '123');

      expect(result).toEqual(expected);
    });

    it('should throw error when transaction not found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(service.findById(userId, '999')).rejects.toThrow('not found');
    });
  });

  describe('update', () => {
    it('should update transaction with valid data', async () => {
      const update = { amount: 75.00 };
      const expected: Transaction = {
        id: '123',
        user_id: userId,
        date: '2024-01-15',
        amount: 75.00,
        category: 'Food',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(mockRepository.exists).mockResolvedValue(true);
      vi.mocked(mockRepository.update).mockResolvedValue(expected);

      const result = await service.update(userId, '123', update);

      expect(result).toEqual(expected);
    });

    it('should throw error when updating non-existent transaction', async () => {
      vi.mocked(mockRepository.exists).mockResolvedValue(false);

      await expect(service.update(userId, '999', { amount: 75.00 })).rejects.toThrow('not found');
    });

    it('should reject update with invalid amount', async () => {
      vi.mocked(mockRepository.exists).mockResolvedValue(true);

      await expect(service.update(userId, '123', { amount: -50 })).rejects.toThrow('positive number');
    });
  });

  describe('delete', () => {
    it('should delete existing transaction', async () => {
      vi.mocked(mockRepository.exists).mockResolvedValue(true);
      vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

      await service.delete(userId, '123');

      expect(mockRepository.delete).toHaveBeenCalledWith('123', userId);
    });

    it('should throw error when deleting non-existent transaction', async () => {
      vi.mocked(mockRepository.exists).mockResolvedValue(false);

      await expect(service.delete(userId, '999')).rejects.toThrow('not found');
    });
  });

  describe('validateCSV', () => {
    it('should validate correct CSV data', () => {
      const rows = [
        { date: '2024-01-15', amount: '50.00', category: 'Food' },
        { date: '2024-01-16', amount: 100, category: 'Transport' },
      ];

      const result = service.validateCSV(rows);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty CSV', () => {
      const result = service.validateCSV([]);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('empty');
    });

    it('should reject CSV with missing required columns', () => {
      const rows = [{ date: '2024-01-15', amount: '50.00' }] as any;

      const result = service.validateCSV(rows);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Missing required columns');
    });

    it('should reject CSV with invalid date', () => {
      const rows = [
        { date: 'invalid-date', amount: '50.00', category: 'Food' },
      ];

      const result = service.validateCSV(rows);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid date format');
    });

    it('should reject CSV with invalid amount', () => {
      const rows = [
        { date: '2024-01-15', amount: 'not-a-number', category: 'Food' },
      ];

      const result = service.validateCSV(rows);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid amount');
    });
  });

  describe('convertCSVToTransactions', () => {
    it('should convert CSV rows to transaction inputs', () => {
      const rows = [
        { date: '2024-01-15', amount: '50.00', category: 'Food', merchant: 'Store' },
        { date: '2024-01-16', amount: 100, category: 'Transport' },
      ];

      const result = service.convertCSVToTransactions(rows);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        date: '2024-01-15',
        amount: 50.00,
        category: 'Food',
        merchant: 'Store',
        notes: undefined,
      });
      expect(result[1]).toEqual({
        date: '2024-01-16',
        amount: 100,
        category: 'Transport',
        merchant: undefined,
        notes: undefined,
      });
    });
  });
});
