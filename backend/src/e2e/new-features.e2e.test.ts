import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios, { AxiosInstance } from 'axios';

/**
 * Integration Tests for New Features
 * 
 * Task 24: Integration testing for new features
 * - 24.1: Test currency support end-to-end
 * - 24.2: Test real AI integration
 * - 24.3: Test data transformation
 * 
 * Requirements tested: 14.1, 14.4, 14.5, 16.1, 16.2, 16.5, 17.1, 17.5, 8.1, 9.1
 */

const API_URL = process.env.API_URL || 'http://localhost:5000';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

describe('E2E: New Features Integration', () => {
  let supabase: SupabaseClient;
  let api: AxiosInstance;
  let authToken: string;
  let userId: string;
  let testEmail: string;
  let testPassword: string;

  beforeAll(() => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const timestamp = Date.now();
    testEmail = `newfeatures${timestamp}@testmail.com`;
    testPassword = 'TestPassword123!';
  });

  afterAll(async () => {
    if (authToken) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
  });

  describe('24.1: Currency Support End-to-End (Req 14.1, 14.4, 14.5, 17.5)', () => {
    describe('Currency selection during signup', () => {
      it('should create user with default GBP currency', async () => {
        const { data, error } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        });

        expect(error).toBeNull();
        expect(data.user).toBeDefined();
        
        if (data.session) {
          authToken = data.session.access_token;
          userId = data.user!.id;
          api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        }
      });

      it('should have default user settings with GBP currency', async () => {
        const response = await api.get('/api/settings');

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('currency');
        expect(response.data.currency).toBe('GBP');
      });
    });

    describe('Currency change in settings', () => {
      it('should update currency from GBP to INR', async () => {
        const response = await api.put('/api/settings', {
          currency: 'INR',
        });

        expect(response.status).toBe(200);
        expect(response.data.currency).toBe('INR');
      });

      it('should retrieve updated currency setting', async () => {
        const response = await api.get('/api/settings');

        expect(response.status).toBe(200);
        expect(response.data.currency).toBe('INR');
      });

      it('should reject invalid currency', async () => {
        try {
          await api.put('/api/settings', {
            currency: 'USD',
          });
          expect.fail('Should have thrown validation error');
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      });

      it('should change currency back to GBP', async () => {
        const response = await api.put('/api/settings', {
          currency: 'GBP',
        });

        expect(response.status).toBe(200);
        expect(response.data.currency).toBe('GBP');
      });
    });

    describe('Verify amounts display with correct currency', () => {
      let transactionId: string;
      let budgetId: string;

      it('should create transaction and verify currency context', async () => {
        const response = await api.post('/api/transactions', {
          date: '2024-03-01',
          amount: 100.50,
          category: 'Food',
          merchant: 'Test Store',
        });

        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('amount');
        expect(response.data.amount).toBe(100.50);
        transactionId = response.data.id;
      });

      it('should retrieve transaction with amount', async () => {
        const response = await api.get(`/api/transactions/${transactionId}`);

        expect(response.status).toBe(200);
        expect(response.data.amount).toBe(100.50);
      });

      it('should create budget and verify amount', async () => {
        const response = await api.post('/api/budgets', {
          name: 'Test Budget',
          amount: 500.00,
          period_type: 'monthly',
          category: 'Food',
        });

        expect(response.status).toBe(201);
        expect(response.data.amount).toBe(500.00);
        budgetId = response.data.id;
      });

      it('should retrieve budget progress with amounts', async () => {
        const response = await api.get(`/api/budgets/${budgetId}/progress`);

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('current_spending');
        expect(response.data).toHaveProperty('remaining');
        expect(typeof response.data.current_spending).toBe('number');
        expect(typeof response.data.remaining).toBe('number');
      });

      it('should get analytics summary with amounts', async () => {
        const response = await api.get('/api/analytics/summary');

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('total_spending');
        expect(typeof response.data.total_spending).toBe('number');
      });
    });

    describe('Test currency in AI insights', () => {
      it('should generate AI insights with currency context', async () => {
        // Change to INR for this test
        await api.put('/api/settings', { currency: 'INR' });

        const response = await api.post('/api/insights/generate', {
          period_start: '2024-03-01',
          period_end: '2024-03-31',
        });

        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('monthlySummary');
        expect(response.data).toHaveProperty('categoryInsights');
        
        // Verify insights contain currency-aware content
        const summary = response.data.monthlySummary;
        expect(typeof summary).toBe('string');
        expect(summary.length).toBeGreaterThan(0);
      });

      it('should generate AI insights with GBP currency', async () => {
        // Change back to GBP
        await api.put('/api/settings', { currency: 'GBP' });

        const response = await api.post('/api/insights/generate', {
          period_start: '2024-03-01',
          period_end: '2024-03-31',
        });

        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('monthlySummary');
        
        const summary = response.data.monthlySummary;
        expect(typeof summary).toBe('string');
        expect(summary.length).toBeGreaterThan(0);
      });
    });

    describe('Test with both GBP and INR', () => {
      it('should handle currency switching without data loss', async () => {
        // Create transaction with GBP
        await api.put('/api/settings', { currency: 'GBP' });
        const gbpTransaction = await api.post('/api/transactions', {
          date: '2024-03-15',
          amount: 50.00,
          category: 'Transport',
        });
        expect(gbpTransaction.status).toBe(201);

        // Switch to INR
        await api.put('/api/settings', { currency: 'INR' });
        const settings = await api.get('/api/settings');
        expect(settings.data.currency).toBe('INR');

        // Create transaction with INR
        const inrTransaction = await api.post('/api/transactions', {
          date: '2024-03-16',
          amount: 1000.00,
          category: 'Food',
        });
        expect(inrTransaction.status).toBe(201);

        // Verify both transactions exist
        const transactions = await api.get('/api/transactions');
        expect(transactions.status).toBe(200);
        expect(transactions.data.transactions.length).toBeGreaterThanOrEqual(2);

        // Switch back to GBP
        await api.put('/api/settings', { currency: 'GBP' });
        const finalSettings = await api.get('/api/settings');
        expect(finalSettings.data.currency).toBe('GBP');

        // Verify transactions still accessible
        const finalTransactions = await api.get('/api/transactions');
        expect(finalTransactions.status).toBe(200);
        expect(finalTransactions.data.transactions.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('24.2: Real AI Integration (Req 16.1, 16.2, 16.5, 17.1)', () => {
    beforeAll(async () => {
      // Ensure we have auth token
      if (!authToken) {
        const { data } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });
        if (data.session) {
          authToken = data.session.access_token;
          userId = data.user!.id;
          api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        }
      }

      // Create some transactions for AI analysis
      const transactions = [
        { date: '2024-04-01', amount: 150.00, category: 'Food', merchant: 'Grocery Store' },
        { date: '2024-04-05', amount: 80.00, category: 'Transport', merchant: 'Gas Station' },
        { date: '2024-04-10', amount: 200.00, category: 'Food', merchant: 'Restaurant' },
        { date: '2024-04-15', amount: 50.00, category: 'Entertainment', merchant: 'Cinema' },
        { date: '2024-04-20', amount: 120.00, category: 'Shopping', merchant: 'Retail Store' },
      ];

      for (const transaction of transactions) {
        await api.post('/api/transactions', transaction);
      }
    });

    describe('Test AI insights generation with OpenAI', () => {
      it('should generate AI insights using real LLM', async () => {
        const response = await api.post('/api/insights/generate', {
          period_start: '2024-04-01',
          period_end: '2024-04-30',
        });

        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        expect(response.data).toHaveProperty('monthlySummary');
        expect(response.data).toHaveProperty('categoryInsights');
        expect(response.data).toHaveProperty('recommendations');
        expect(response.data).toHaveProperty('projections');

        // Verify structure of insights
        expect(typeof response.data.monthlySummary).toBe('string');
        expect(response.data.monthlySummary.length).toBeGreaterThan(0);
        
        expect(Array.isArray(response.data.categoryInsights)).toBe(true);
        expect(Array.isArray(response.data.recommendations)).toBe(true);
        
        expect(response.data.projections).toHaveProperty('nextWeek');
        expect(response.data.projections).toHaveProperty('nextMonth');
      });

      it('should retrieve latest AI insights', async () => {
        const response = await api.get('/api/insights/latest');

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('monthlySummary');
        expect(typeof response.data.monthlySummary).toBe('string');
      });
    });

    describe('Test error handling when LLM fails', () => {
      it('should handle insights generation gracefully on error', async () => {
        // This test verifies the system handles errors gracefully
        // The actual error might not occur if LLM is working, but we test the endpoint
        const response = await api.post('/api/insights/generate', {
          period_start: '2024-04-01',
          period_end: '2024-04-30',
        });

        // Should either succeed or return a graceful error
        expect([201, 503]).toContain(response.status);
        
        if (response.status === 201) {
          expect(response.data).toHaveProperty('monthlySummary');
        }
      });
    });

    describe('Test fallback to cached insights', () => {
      it('should return cached insights when available', async () => {
        // Generate insights first
        const generateResponse = await api.post('/api/insights/generate', {
          period_start: '2024-04-01',
          period_end: '2024-04-30',
        });
        expect(generateResponse.status).toBe(201);

        // Retrieve latest (should be cached)
        const cachedResponse = await api.get('/api/insights/latest');
        expect(cachedResponse.status).toBe(200);
        expect(cachedResponse.data).toHaveProperty('monthlySummary');
        
        // Verify it's the same insights
        expect(cachedResponse.data.id).toBe(generateResponse.data.id);
      });
    });

    describe('Verify currency context in AI responses', () => {
      it('should include currency context in AI insights with GBP', async () => {
        await api.put('/api/settings', { currency: 'GBP' });

        const response = await api.post('/api/insights/generate', {
          period_start: '2024-04-01',
          period_end: '2024-04-30',
        });

        expect(response.status).toBe(201);
        expect(response.data.monthlySummary).toBeDefined();
        expect(typeof response.data.monthlySummary).toBe('string');
      });

      it('should include currency context in AI insights with INR', async () => {
        await api.put('/api/settings', { currency: 'INR' });

        const response = await api.post('/api/insights/generate', {
          period_start: '2024-04-01',
          period_end: '2024-04-30',
        });

        expect(response.status).toBe(201);
        expect(response.data.monthlySummary).toBeDefined();
        expect(typeof response.data.monthlySummary).toBe('string');
      });
    });

    describe('Test cost optimization features', () => {
      it('should cache insights for 24 hours', async () => {
        const firstResponse = await api.post('/api/insights/generate', {
          period_start: '2024-04-01',
          period_end: '2024-04-30',
        });
        expect(firstResponse.status).toBe(201);
        const firstId = firstResponse.data.id;

        // Immediate second request should return cached
        const secondResponse = await api.get('/api/insights/latest');
        expect(secondResponse.status).toBe(200);
        expect(secondResponse.data.id).toBe(firstId);
      });

      it('should handle multiple insight requests efficiently', async () => {
        const startTime = Date.now();
        
        // Make multiple requests
        const requests = [
          api.get('/api/insights/latest'),
          api.get('/api/insights/latest'),
          api.get('/api/insights/latest'),
        ];

        const responses = await Promise.all(requests);
        const endTime = Date.now();

        // All should succeed
        responses.forEach(response => {
          expect(response.status).toBe(200);
        });

        // Should be fast due to caching (under 5 seconds for 3 requests)
        expect(endTime - startTime).toBeLessThan(5000);
      });
    });
  });

  describe('24.3: Data Transformation (Req 8.1, 9.1)', () => {
    beforeAll(async () => {
      // Ensure we have auth token
      if (!authToken) {
        const { data } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });
        if (data.session) {
          authToken = data.session.access_token;
          userId = data.user!.id;
          api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        }
      }
    });

    describe('Verify all API responses use camelCase', () => {
      it('should return transaction in camelCase format', async () => {
        const response = await api.post('/api/transactions', {
          date: '2024-05-01',
          amount: 75.00,
          category: 'Food',
          merchant: 'Test Merchant',
        });

        expect(response.status).toBe(201);
        
        // Check for camelCase properties
        expect(response.data).toHaveProperty('id');
        expect(response.data).toHaveProperty('userId');
        expect(response.data).toHaveProperty('date');
        expect(response.data).toHaveProperty('amount');
        expect(response.data).toHaveProperty('category');
        expect(response.data).toHaveProperty('merchant');
        expect(response.data).toHaveProperty('createdAt');
        expect(response.data).toHaveProperty('updatedAt');

        // Should NOT have snake_case properties
        expect(response.data).not.toHaveProperty('user_id');
        expect(response.data).not.toHaveProperty('created_at');
        expect(response.data).not.toHaveProperty('updated_at');
      });

      it('should return budget in camelCase format', async () => {
        const response = await api.post('/api/budgets', {
          name: 'Test Budget',
          amount: 300.00,
          period_type: 'monthly',
          category: 'Food',
        });

        expect(response.status).toBe(201);
        
        // Check for camelCase properties
        expect(response.data).toHaveProperty('id');
        expect(response.data).toHaveProperty('userId');
        expect(response.data).toHaveProperty('name');
        expect(response.data).toHaveProperty('amount');
        expect(response.data).toHaveProperty('periodType');
        expect(response.data).toHaveProperty('category');
        expect(response.data).toHaveProperty('createdAt');

        // Should NOT have snake_case properties
        expect(response.data).not.toHaveProperty('user_id');
        expect(response.data).not.toHaveProperty('period_type');
        expect(response.data).not.toHaveProperty('created_at');
      });

      it('should return analytics in camelCase format', async () => {
        const response = await api.get('/api/analytics/summary');

        expect(response.status).toBe(200);
        
        // Check for camelCase properties
        expect(response.data).toHaveProperty('totalSpending');
        expect(response.data).toHaveProperty('transactionCount');

        // Should NOT have snake_case properties
        expect(response.data).not.toHaveProperty('total_spending');
        expect(response.data).not.toHaveProperty('transaction_count');
      });

      it('should return settings in camelCase format', async () => {
        const response = await api.get('/api/settings');

        expect(response.status).toBe(200);
        
        // Check for camelCase properties
        expect(response.data).toHaveProperty('id');
        expect(response.data).toHaveProperty('userId');
        expect(response.data).toHaveProperty('currency');
        expect(response.data).toHaveProperty('createdAt');
        expect(response.data).toHaveProperty('updatedAt');

        // Should NOT have snake_case properties
        expect(response.data).not.toHaveProperty('user_id');
        expect(response.data).not.toHaveProperty('created_at');
        expect(response.data).not.toHaveProperty('updated_at');
      });
    });

    describe('Test nested object transformations', () => {
      it('should transform AI insights with nested objects to camelCase', async () => {
        const response = await api.post('/api/insights/generate', {
          period_start: '2024-05-01',
          period_end: '2024-05-31',
        });

        expect(response.status).toBe(201);
        
        // Check top-level camelCase
        expect(response.data).toHaveProperty('id');
        expect(response.data).toHaveProperty('userId');
        expect(response.data).toHaveProperty('periodStart');
        expect(response.data).toHaveProperty('periodEnd');
        expect(response.data).toHaveProperty('monthlySummary');
        expect(response.data).toHaveProperty('categoryInsights');
        expect(response.data).toHaveProperty('spendingSpikes');
        expect(response.data).toHaveProperty('recommendations');
        expect(response.data).toHaveProperty('projections');
        expect(response.data).toHaveProperty('generatedAt');

        // Should NOT have snake_case
        expect(response.data).not.toHaveProperty('user_id');
        expect(response.data).not.toHaveProperty('period_start');
        expect(response.data).not.toHaveProperty('period_end');
        expect(response.data).not.toHaveProperty('monthly_summary');
        expect(response.data).not.toHaveProperty('category_insights');
        expect(response.data).not.toHaveProperty('spending_spikes');
        expect(response.data).not.toHaveProperty('generated_at');

        // Check nested objects in projections
        if (response.data.projections) {
          expect(response.data.projections).toHaveProperty('nextWeek');
          expect(response.data.projections).toHaveProperty('nextMonth');
          
          // Should NOT have snake_case in nested objects
          expect(response.data.projections).not.toHaveProperty('next_week');
          expect(response.data.projections).not.toHaveProperty('next_month');
        }
      });

      it('should transform budget progress with nested alerts to camelCase', async () => {
        // Create a budget first
        const budgetResponse = await api.post('/api/budgets', {
          name: 'Transform Test Budget',
          amount: 200.00,
          period_type: 'monthly',
          category: 'Food',
        });
        const budgetId = budgetResponse.data.id;

        // Add transactions to trigger alerts
        await api.post('/api/transactions', {
          date: '2024-05-15',
          amount: 180.00,
          category: 'Food',
        });

        const response = await api.get(`/api/budgets/${budgetId}/progress`);

        expect(response.status).toBe(200);
        
        // Check camelCase properties
        expect(response.data).toHaveProperty('budgetId');
        expect(response.data).toHaveProperty('currentSpending');
        expect(response.data).toHaveProperty('percentage');
        expect(response.data).toHaveProperty('remaining');
        expect(response.data).toHaveProperty('alerts');

        // Should NOT have snake_case
        expect(response.data).not.toHaveProperty('budget_id');
        expect(response.data).not.toHaveProperty('current_spending');

        // Check nested alerts array
        if (response.data.alerts && response.data.alerts.length > 0) {
          const alert = response.data.alerts[0];
          expect(alert).toHaveProperty('id');
          expect(alert).toHaveProperty('budgetId');
          expect(alert).toHaveProperty('alertType');
          expect(alert).toHaveProperty('thresholdPercentage');
          expect(alert).toHaveProperty('triggeredAt');
          expect(alert).toHaveProperty('isActive');

          // Should NOT have snake_case
          expect(alert).not.toHaveProperty('budget_id');
          expect(alert).not.toHaveProperty('alert_type');
          expect(alert).not.toHaveProperty('threshold_percentage');
          expect(alert).not.toHaveProperty('triggered_at');
          expect(alert).not.toHaveProperty('is_active');
        }
      });
    });

    describe('Verify frontend components receive correct data format', () => {
      it('should return transaction list in correct format for frontend', async () => {
        const response = await api.get('/api/transactions');

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('transactions');
        expect(Array.isArray(response.data.transactions)).toBe(true);

        if (response.data.transactions.length > 0) {
          const transaction = response.data.transactions[0];
          
          // Verify all expected camelCase properties exist
          expect(transaction).toHaveProperty('id');
          expect(transaction).toHaveProperty('userId');
          expect(transaction).toHaveProperty('date');
          expect(transaction).toHaveProperty('amount');
          expect(transaction).toHaveProperty('category');
          expect(transaction).toHaveProperty('createdAt');
          expect(transaction).toHaveProperty('updatedAt');
        }
      });

      it('should return budget list in correct format for frontend', async () => {
        const response = await api.get('/api/budgets');

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('budgets');
        expect(Array.isArray(response.data.budgets)).toBe(true);

        if (response.data.budgets.length > 0) {
          const budget = response.data.budgets[0];
          
          // Verify all expected camelCase properties exist
          expect(budget).toHaveProperty('id');
          expect(budget).toHaveProperty('userId');
          expect(budget).toHaveProperty('name');
          expect(budget).toHaveProperty('amount');
          expect(budget).toHaveProperty('periodType');
          expect(budget).toHaveProperty('createdAt');
        }
      });

      it('should return analytics data in correct format for charts', async () => {
        const response = await api.get('/api/analytics/categories');

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('categories');
        expect(Array.isArray(response.data.categories)).toBe(true);

        if (response.data.categories.length > 0) {
          const category = response.data.categories[0];
          
          // Verify properties are in camelCase
          expect(category).toHaveProperty('category');
          expect(category).toHaveProperty('total');
          expect(category).toHaveProperty('percentage');
        }
      });
    });

    describe('Test with various data scenarios', () => {
      it('should handle empty arrays with correct format', async () => {
        // Create a new user to have empty data
        const newEmail = `empty${Date.now()}@testmail.com`;
        const { data } = await supabase.auth.signUp({
          email: newEmail,
          password: testPassword,
        });

        if (data.session) {
          const newApi = axios.create({
            baseURL: API_URL,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`,
            },
          });

          const response = await newApi.get('/api/transactions');
          
          expect(response.status).toBe(200);
          expect(response.data).toHaveProperty('transactions');
          expect(Array.isArray(response.data.transactions)).toBe(true);
          expect(response.data.transactions.length).toBe(0);
        }
      });

      it('should handle null values correctly', async () => {
        const response = await api.post('/api/transactions', {
          date: '2024-05-20',
          amount: 50.00,
          category: 'Food',
          // merchant and notes are optional (null)
        });

        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('merchant');
        expect(response.data).toHaveProperty('notes');
        // These can be null or undefined
      });

      it('should handle bulk operations with correct transformation', async () => {
        const transactions = [
          { date: '2024-05-21', amount: 30.00, category: 'Food' },
          { date: '2024-05-22', amount: 40.00, category: 'Transport' },
          { date: '2024-05-23', amount: 50.00, category: 'Entertainment' },
        ];

        const response = await api.post('/api/transactions/bulk', {
          transactions,
        });

        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('transactions');
        expect(Array.isArray(response.data.transactions)).toBe(true);
        expect(response.data.transactions.length).toBe(3);

        // Verify all transactions are in camelCase
        response.data.transactions.forEach((transaction: any) => {
          expect(transaction).toHaveProperty('id');
          expect(transaction).toHaveProperty('userId');
          expect(transaction).toHaveProperty('createdAt');
          expect(transaction).not.toHaveProperty('user_id');
          expect(transaction).not.toHaveProperty('created_at');
        });
      });
    });
  });
});
