import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDatabaseConnection, supabaseConfig } from './config/supabase.js';
import { checkDatabaseHealth } from './utils/database.js';
import { supabase } from './config/supabase.js';
import transactionRoutes from './routes/transaction.routes.js';
import budgetRoutes from './routes/budget.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import insightsRoutes from './routes/insights.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint with database status
app.get('/health', async (_req, res) => {
  const dbHealth = await checkDatabaseHealth(supabase);
  
  res.json({
    status: dbHealth.healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbHealth.healthy,
      latency: dbHealth.latency,
      message: dbHealth.message,
    },
    supabase: {
      url: supabaseConfig.url,
      hasServiceKey: supabaseConfig.hasServiceKey,
    },
  });
});

// API routes
app.get('/api', (_req, res) => {
  res.json({ message: 'AI Finance Tracker API' });
});

// Transaction routes
app.use('/api/transactions', transactionRoutes);

// Budget routes
app.use('/api/budgets', budgetRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// AI Insights routes
app.use('/api/insights', insightsRoutes);

// Start server with database connection test
const startServer = async () => {
  try {
    console.log('🚀 Starting AI Finance Tracker Backend...');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Test database connection
    console.log('🔌 Testing database connection...');
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.warn('⚠️  Database connection failed, but server will start anyway');
      console.warn('   Please check your Supabase credentials in .env file');
    }
    
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log(`✓ API endpoint: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
