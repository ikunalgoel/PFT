import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testDatabaseConnection, supabaseConfig } from './config/supabase.js';
import { checkDatabaseHealth } from './utils/database.js';
import { supabase } from './config/supabase.js';
import transactionRoutes from './routes/transaction.routes.js';
import budgetRoutes from './routes/budget.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import insightsRoutes from './routes/insights.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import {
  errorHandler,
  notFoundHandler,
  apiLimiter,
  transformResponse,
} from './middleware/index.js';
import {
  performanceMonitor,
  getPerformanceStats,
} from './middleware/performance.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for CSV uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Performance monitoring middleware
app.use(performanceMonitor);

// Rate limiting for all API routes
app.use('/api', apiLimiter);

// Transform responses to camelCase for all API routes
app.use('/api', transformResponse);

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

// Performance metrics endpoint
app.get('/metrics', (_req, res) => {
  const stats = getPerformanceStats();
  res.json({
    timestamp: new Date().toISOString(),
    performance: stats,
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

// Settings routes
app.use('/api/settings', settingsRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

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
