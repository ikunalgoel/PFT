-- AI-Powered Personal Finance Tracker Database Schema
-- This schema creates all necessary tables, indexes, and Row Level Security policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(100) NOT NULL,
  merchant VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('monthly', 'custom')),
  period_start DATE,
  period_end DATE,
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_period CHECK (
    (period_type = 'monthly') OR 
    (period_type = 'custom' AND period_start IS NOT NULL AND period_end IS NOT NULL)
  )
);

-- Budget alerts table
CREATE TABLE IF NOT EXISTS budget_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('warning', 'critical')),
  threshold_percentage INTEGER NOT NULL CHECK (threshold_percentage > 0 AND threshold_percentage <= 100),
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- AI insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  monthly_summary TEXT NOT NULL,
  category_insights JSONB NOT NULL DEFAULT '[]'::jsonb,
  spending_spikes JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  projections JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_period CHECK (period_end >= period_start)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Transactions indexes for optimized queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
  ON transactions(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_category 
  ON transactions(user_id, category);

CREATE INDEX IF NOT EXISTS idx_transactions_date_range 
  ON transactions(user_id, date);

-- Budgets indexes
CREATE INDEX IF NOT EXISTS idx_budgets_user 
  ON budgets(user_id);

CREATE INDEX IF NOT EXISTS idx_budgets_period 
  ON budgets(user_id, period_start, period_end);

-- Budget alerts indexes
CREATE INDEX IF NOT EXISTS idx_budget_alerts_budget 
  ON budget_alerts(budget_id, is_active);

CREATE INDEX IF NOT EXISTS idx_budget_alerts_active 
  ON budget_alerts(budget_id) 
  WHERE is_active = TRUE;

-- AI insights indexes
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_date 
  ON ai_insights(user_id, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_insights_period 
  ON ai_insights(user_id, period_start, period_end);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Transactions RLS Policies
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Budgets RLS Policies
CREATE POLICY "Users can view their own budgets"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);

-- Budget Alerts RLS Policies
CREATE POLICY "Users can view alerts for their budgets"
  ON budget_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM budgets 
      WHERE budgets.id = budget_alerts.budget_id 
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert alerts for their budgets"
  ON budget_alerts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets 
      WHERE budgets.id = budget_alerts.budget_id 
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update alerts for their budgets"
  ON budget_alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM budgets 
      WHERE budgets.id = budget_alerts.budget_id 
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete alerts for their budgets"
  ON budget_alerts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM budgets 
      WHERE budgets.id = budget_alerts.budget_id 
      AND budgets.user_id = auth.uid()
    )
  );

-- AI Insights RLS Policies
CREATE POLICY "Users can view their own insights"
  ON ai_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights"
  ON ai_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON ai_insights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights"
  ON ai_insights FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
