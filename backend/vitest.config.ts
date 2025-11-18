import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000, // 30 seconds for E2E tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
      API_URL: process.env.API_URL || 'http://localhost:5000',
    },
  },
});
