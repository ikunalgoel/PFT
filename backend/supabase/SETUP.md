# Supabase Database Setup Guide

This guide walks you through setting up the Supabase database and authentication for the AI-Powered Personal Finance Tracker.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Access to the Supabase dashboard

## Step 1: Create a Supabase Project

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Click "New Project"
3. Fill in the project details:
   - **Name**: `ai-finance-tracker` (or your preferred name)
   - **Database Password**: Choose a strong password (save this securely)
   - **Region**: Select the region closest to your users
   - **Pricing Plan**: Free tier is sufficient for development
4. Click "Create new project"
5. Wait for the project to be provisioned (this may take a few minutes)

## Step 2: Obtain Supabase Credentials

Once your project is created:

1. Navigate to **Settings** → **API** in the left sidebar
2. You'll find the following credentials:
   - **Project URL**: This is your `SUPABASE_URL`
   - **anon public**: This is your `SUPABASE_ANON_KEY`
   - **service_role**: This is your `SUPABASE_SERVICE_KEY` (keep this secret!)

3. Copy these values - you'll need them for environment variables

## Step 3: Create Database Schema

1. In the Supabase dashboard, navigate to **SQL Editor** in the left sidebar
2. Click "New query"
3. Copy the entire contents of `backend/supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema creation
6. Verify that all tables were created successfully by checking the **Table Editor**

You should see the following tables:
- `transactions`
- `budgets`
- `budget_alerts`
- `ai_insights`

## Step 4: Verify Row Level Security (RLS)

1. Navigate to **Authentication** → **Policies** in the left sidebar
2. Verify that RLS is enabled for all tables
3. Check that policies exist for each table:
   - `transactions`: 4 policies (SELECT, INSERT, UPDATE, DELETE)
   - `budgets`: 4 policies (SELECT, INSERT, UPDATE, DELETE)
   - `budget_alerts`: 4 policies (SELECT, INSERT, UPDATE, DELETE)
   - `ai_insights`: 4 policies (SELECT, INSERT, UPDATE, DELETE)

## Step 5: Configure Authentication

Supabase Auth is enabled by default. Configure the authentication providers:

1. Navigate to **Authentication** → **Providers** in the left sidebar
2. Enable **Email** provider (enabled by default)
3. Optional: Configure additional providers (Google, GitHub, etc.)
4. Navigate to **Authentication** → **URL Configuration**
5. Set the **Site URL** to your frontend URL:
   - Development: `http://localhost:5173`
   - Production: Your deployed frontend URL
6. Add **Redirect URLs**:
   - Development: `http://localhost:5173/**`
   - Production: `https://your-app.netlify.app/**`

## Step 6: Configure Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# AI Agent Configuration
AI_AGENT_API_KEY=your_ai_agent_api_key
```

Replace the placeholder values with your actual Supabase credentials.

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the placeholder values with your actual Supabase credentials.

## Step 7: Verify Database Indexes

1. Navigate to **Database** → **Indexes** in the left sidebar
2. Verify that the following indexes were created:
   - `idx_transactions_user_date`
   - `idx_transactions_category`
   - `idx_transactions_date_range`
   - `idx_budgets_user`
   - `idx_budgets_period`
   - `idx_budget_alerts_budget`
   - `idx_budget_alerts_active`
   - `idx_ai_insights_user_date`
   - `idx_ai_insights_period`

## Step 8: Test Database Connection

You can test the database connection by running a simple query in the SQL Editor:

```sql
SELECT * FROM transactions LIMIT 1;
```

This should return an empty result (no error) if everything is set up correctly.

## Step 9: Create a Test User (Optional)

For development purposes, you can create a test user:

1. Navigate to **Authentication** → **Users** in the left sidebar
2. Click "Add user" → "Create new user"
3. Enter an email and password
4. Click "Create user"
5. Use these credentials to test authentication in your application

## Troubleshooting

### Issue: RLS policies not working

**Solution**: Ensure that:
- RLS is enabled on all tables
- The `auth.uid()` function is available (it's built into Supabase)
- Your JWT token is being sent correctly in API requests

### Issue: Cannot connect to database

**Solution**: Verify that:
- Your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Your network allows connections to Supabase
- The project is not paused (free tier projects pause after inactivity)

### Issue: Indexes not created

**Solution**: 
- Re-run the index creation statements from `schema.sql`
- Check for any error messages in the SQL Editor

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use `SUPABASE_SERVICE_KEY` only in backend** - never expose it to the frontend
3. **Use `SUPABASE_ANON_KEY` in frontend** - it's safe for public use with RLS
4. **Rotate keys regularly** in production environments
5. **Enable email confirmation** for production (Authentication → Settings)
6. **Set up proper CORS** in your backend to only allow your frontend domain

## Next Steps

After completing this setup:

1. Install dependencies: `npm install` in both `backend` and `frontend` directories
2. Start the backend server: `cd backend && npm run dev`
3. Start the frontend: `cd frontend && npm run dev`
4. Test user registration and authentication
5. Proceed to implement the backend services (Task 3)

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
