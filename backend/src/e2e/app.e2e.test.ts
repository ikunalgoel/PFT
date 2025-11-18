import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios, { AxiosInstance } from 'axios';

/**
 * End-to-End Tests for AI Finance Tracker
 * 
 * These tests verify complete user flows through the application:
 * - User signup and authentication
 * - CSV upload and transaction management
 * - Budget creation and alert generation
 * - AI insights generation and export
 * - CRUD operations for transactions and budgets
 * - Error handling and edge cases
 * 
 * Requirements tested: 1.1, 1.2, 1.3, 1.4, 3.1, 4.1, 8.1, 10.1
 */

const API_URL = process.env.API_URL || 'http://localhost:5000';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

describe('E2E: AI Finance Tracker', () => {
  let supabase: SupabaseClient;
  let api: AxiosInstance;
  let authToken: string;
  let userId: string;
  let testEmail: string;
  let testPassword: string;

  beforeAll(() => {
    // Initialize Supabase client
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Initialize API client
    api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Generate unique test credentials
    const timestamp = Date.now();
    // Use a more realistic email format that Supabase will accept
    testEmail = `e2etest${timestamp}@testmail.com`;
    testPassword = 'TestPassword123!';
  });

  afterAll(async () => {
    // Cleanup: Delete test user if created
    if (authToken) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
  });

  describe('User Authentication Flow', () => {
    it('should sign up a new user', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(testEmail);
      
      if (data.session) {
        authToken = data.session.access_token;
        userId = data.user!.id;
        
        // Set auth token for API requests
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      }
    });

    it('should sign in with existing credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      expect(error).toBeNull();
      expect(data.session).toBeDefined();
      expect(data.user?.email).toBe(testEmail);
      
      authToken = data.session!.access_token;
      userId = data.user!.id;
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    });
  });

  describe('Transaction Management Flow (Req 1.1, 1.2, 1.3, 1.4)', () => {
    let transactionId: string;

    it('should create a single transaction manually', async () => {
      const transaction = {
        date: '2024-01-15',
        amount: 50.00,
        category: 'Food',
        merchant: 'Test Grocery Store',
        notes: 'Weekly groceries',
      };

      const response = await api.post('/api/transactions', transaction);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.amount).toBe(50.00);
      expect(response.data.category).toBe('Food');
      
      transactionId = response.data.id;
    });

    it('should retrieve all transactions', async () => {
      const response = await api.get('/api/transactions');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('transactions');
      expect(Array.isArray(response.data.transactions)).toBe(true);
      expect(response.data.transactions.length).toBeGreaterThan(0);
    });

    it('should retrieve a single transaction by ID', async () => {
      const response = await api.get(`/api/transactions/${transactionId}`);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(transactionId);
      expect(response.data.category).toBe('Food');
    });

    it('should update a transaction', async () => {
      const update = {
        amount: 55.00,
        notes: 'Updated groceries amount',
      };

      const response = await api.put(`/api/transactions/${transactionId}`, update);

      expect(response.status).toBe(200);
      expect(response.data.amount).toBe(55.00);
      expect(response.data.notes).toBe('Updated groceries amount');
    });

    it('should filter transactions by category', async () => {
      const response = await api.get('/api/transactions', {
        params: { category: 'Food' },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('transactions');
      expect(Array.isArray(response.data.transactions)).toBe(true);
      response.data.transactions.forEach((t: any) => {
        expect(t.category).toBe('Food');
      });
    });

    it('should filter transactions by date range', async () => {
      const response = await api.get('/api/transactions', {
        params: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('transactions');
      expect(Array.isArray(response.data.transactions)).toBe(true);
    });

    it('should upload transactions via CSV bulk import', async () => {
      const csvTransactions = [
        {
          date: '2024-01-16',
          amount: 100.00,
          category: 'Transport',
          merchant: 'Gas Station',
        },
        {
          date: '2024-01-17',
          amount: 25.00,
          category: 'Entertainment',
          merchant: 'Movie Theater',
        },
        {
          date: '2024-01-18',
          amount: 75.00,
          category: 'Food',
          merchant: 'Restaurant',
        },
      ];

      const response = await api.post('/api/transactions/bulk', {
        transactions: csvTransactions,
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('transactions');
      expect(Array.isArray(response.data.transactions)).toBe(true);
      expect(response.data.transactions.length).toBe(3);
    });

    it('should delete a transaction', async () => {
      const response = await api.delete(`/api/transactions/${transactionId}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for deleted transaction', async () => {
      try {
        await api.get(`/api/transactions/${transactionId}`);
        expect.fail('Should have thrown 404 error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('Budget Management and Alert Flow (Req 3.1, 4.1)', () => {
    let budgetId: string;

    it('should create a monthly budget', async () => {
      const budget = {
        name: 'Monthly Food Budget',
        amount: 500.00,
        period_type: 'monthly',
        category: 'Food',
      };

      const response = await api.post('/api/budgets', budget);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.name).toBe('Monthly Food Budget');
      expect(response.data.amount).toBe(500.00);
      
      budgetId = response.data.id;
    });

    it('should retrieve all budgets', async () => {
      const response = await api.get('/api/budgets');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('budgets');
      expect(Array.isArray(response.data.budgets)).toBe(true);
      expect(response.data.budgets.length).toBeGreaterThan(0);
    });

    it('should retrieve budget progress', async () => {
      const response = await api.get(`/api/budgets/${budgetId}/progress`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('budget_id');
      expect(response.data).toHaveProperty('current_spending');
      expect(response.data).toHaveProperty('percentage');
      expect(response.data).toHaveProperty('remaining');
      expect(response.data).toHaveProperty('alerts');
    });

    it('should add transactions to trigger budget alerts', async () => {
      // Add transactions totaling 420 (84% of 500 budget) to trigger warning alert
      const transactions = [
        { date: '2024-01-20', amount: 200.00, category: 'Food', merchant: 'Store 1' },
        { date: '2024-01-21', amount: 220.00, category: 'Food', merchant: 'Store 2' },
      ];

      for (const transaction of transactions) {
        await api.post('/api/transactions', transaction);
      }

      // Check budget progress - should have warning alert at 80%
      const response = await api.get(`/api/budgets/${budgetId}/progress`);

      expect(response.status).toBe(200);
      expect(response.data.percentage).toBeGreaterThan(80);
      expect(response.data.alerts.length).toBeGreaterThan(0);
      
      const warningAlert = response.data.alerts.find((a: any) => a.alert_type === 'warning');
      expect(warningAlert).toBeDefined();
    });

    it('should trigger critical alert when budget exceeded', async () => {
      // Add more transactions to exceed budget (100%+)
      await api.post('/api/transactions', {
        date: '2024-01-22',
        amount: 150.00,
        category: 'Food',
        merchant: 'Store 3',
      });

      const response = await api.get(`/api/budgets/${budgetId}/progress`);

      expect(response.status).toBe(200);
      expect(response.data.percentage).toBeGreaterThanOrEqual(100);
      
      const criticalAlert = response.data.alerts.find((a: any) => a.alert_type === 'critical');
      expect(criticalAlert).toBeDefined();
    });

    it('should update a budget', async () => {
      const update = {
        amount: 600.00,
        name: 'Updated Food Budget',
      };

      const response = await api.put(`/api/budgets/${budgetId}`, update);

      expect(response.status).toBe(200);
      expect(response.data.amount).toBe(600.00);
      expect(response.data.name).toBe('Updated Food Budget');
    });

    it('should create a custom period budget', async () => {
      const budget = {
        name: 'Vacation Budget',
        amount: 2000.00,
        period_type: 'custom',
        period_start: '2024-06-01',
        period_end: '2024-06-30',
      };

      const response = await api.post('/api/budgets', budget);

      expect(response.status).toBe(201);
      expect(response.data.period_type).toBe('custom');
      expect(response.data.period_start).toBe('2024-06-01');
      expect(response.data.period_end).toBe('2024-06-30');
    });

    it('should delete a budget', async () => {
      const response = await api.delete(`/api/budgets/${budgetId}`);

      expect(response.status).toBe(204);
    });
  });

  describe('Analytics Flow', () => {
    beforeEach(async () => {
      // Ensure we have some transactions for analytics
      const transactions = [
        { date: '2024-01-10', amount: 50.00, category: 'Food' },
        { date: '2024-01-11', amount: 30.00, category: 'Transport' },
        { date: '2024-01-12', amount: 100.00, category: 'Entertainment' },
      ];

      for (const transaction of transactions) {
        await api.post('/api/transactions', transaction);
      }
    });

    it('should retrieve spending summary', async () => {
      const response = await api.get('/api/analytics/summary');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('total_spending');
      expect(response.data).toHaveProperty('transaction_count');
      expect(typeof response.data.total_spending).toBe('number');
    });

    it('should retrieve spending trends', async () => {
      const response = await api.get('/api/analytics/trends', {
        params: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('trends');
      expect(Array.isArray(response.data.trends)).toBe(true);
    });

    it('should retrieve category breakdown', async () => {
      const response = await api.get('/api/analytics/categories');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('categories');
      expect(Array.isArray(response.data.categories)).toBe(true);
      
      if (response.data.categories.length > 0) {
        expect(response.data.categories[0]).toHaveProperty('category');
        expect(response.data.categories[0]).toHaveProperty('total');
        expect(response.data.categories[0]).toHaveProperty('percentage');
      }
    });
  });

  describe('AI Insights Flow (Req 8.1, 10.1)', () => {
    let insightId: string;

    it('should generate AI insights', async () => {
      const response = await api.post('/api/insights/generate', {
        period_start: '2024-01-01',
        period_end: '2024-01-31',
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('monthly_summary');
      expect(response.data).toHaveProperty('category_insights');
      expect(response.data).toHaveProperty('recommendations');
      
      insightId = response.data.id;
    });

    it('should retrieve latest AI insights', async () => {
      const response = await api.get('/api/insights/latest');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('monthly_summary');
      expect(typeof response.data.monthly_summary).toBe('string');
    });

    it('should export AI insights', async () => {
      const response = await api.post('/api/insights/export', {
        insight_id: insightId,
        format: 'text',
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('content');
      expect(typeof response.data.content).toBe('string');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should reject transaction with missing required fields', async () => {
      try {
        await api.post('/api/transactions', {
          amount: 50.00,
          // Missing date and category
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should reject transaction with negative amount', async () => {
      try {
        await api.post('/api/transactions', {
          date: '2024-01-15',
          amount: -50.00,
          category: 'Food',
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should reject transaction with invalid date format', async () => {
      try {
        await api.post('/api/transactions', {
          date: '15-01-2024',
          amount: 50.00,
          category: 'Food',
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should reject budget with missing required fields', async () => {
      try {
        await api.post('/api/budgets', {
          amount: 500.00,
          // Missing name and period_type
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should reject budget with negative amount', async () => {
      try {
        await api.post('/api/budgets', {
          name: 'Test Budget',
          amount: -500.00,
          period_type: 'monthly',
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should reject custom budget without period dates', async () => {
      try {
        await api.post('/api/budgets', {
          name: 'Test Budget',
          amount: 500.00,
          period_type: 'custom',
          // Missing period_start and period_end
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 404 for non-existent transaction', async () => {
      try {
        await api.get('/api/transactions/non-existent-id');
        expect.fail('Should have thrown 404 error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 404 for non-existent budget', async () => {
      try {
        await api.get('/api/budgets/non-existent-id');
        expect.fail('Should have thrown 404 error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should handle unauthorized requests', async () => {
      const unauthorizedApi = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      try {
        await unauthorizedApi.get('/api/transactions');
        expect.fail('Should have thrown 401 error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('Complete User Flow Integration', () => {
    it('should complete full user journey: signup → CSV upload → budget → alerts → insights', async () => {
      // 1. User signs up (already done in auth tests)
      expect(authToken).toBeDefined();
      expect(userId).toBeDefined();

      // 2. User uploads CSV with transactions
      const csvData = [
        { date: '2024-02-01', amount: 150.00, category: 'Food', merchant: 'Grocery' },
        { date: '2024-02-05', amount: 80.00, category: 'Transport', merchant: 'Gas' },
        { date: '2024-02-10', amount: 200.00, category: 'Food', merchant: 'Restaurant' },
        { date: '2024-02-15', amount: 50.00, category: 'Entertainment', merchant: 'Cinema' },
      ];

      const uploadResponse = await api.post('/api/transactions/bulk', {
        transactions: csvData,
      });
      expect(uploadResponse.status).toBe(201);
      expect(uploadResponse.data.transactions.length).toBe(4);

      // 3. User views dashboard (get analytics)
      const summaryResponse = await api.get('/api/analytics/summary');
      expect(summaryResponse.status).toBe(200);
      expect(summaryResponse.data.total_spending).toBeGreaterThan(0);

      // 4. User creates a budget
      const budgetResponse = await api.post('/api/budgets', {
        name: 'February Food Budget',
        amount: 300.00,
        period_type: 'monthly',
        category: 'Food',
      });
      expect(budgetResponse.status).toBe(201);
      const newBudgetId = budgetResponse.data.id;

      // 5. Check budget progress (should show alert since spending is 350 > 300)
      const progressResponse = await api.get(`/api/budgets/${newBudgetId}/progress`);
      expect(progressResponse.status).toBe(200);
      expect(progressResponse.data.percentage).toBeGreaterThan(100);
      expect(progressResponse.data.alerts.length).toBeGreaterThan(0);

      // 6. Generate AI insights
      const insightsResponse = await api.post('/api/insights/generate', {
        period_start: '2024-02-01',
        period_end: '2024-02-28',
      });
      expect(insightsResponse.status).toBe(201);
      expect(insightsResponse.data.monthly_summary).toBeDefined();

      // 7. Export insights
      const exportResponse = await api.post('/api/insights/export', {
        insight_id: insightsResponse.data.id,
        format: 'text',
      });
      expect(exportResponse.status).toBe(200);
      expect(exportResponse.data.content).toBeDefined();

      // Complete flow verified successfully
    });
  });
});
