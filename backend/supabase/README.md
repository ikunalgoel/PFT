# Supabase Database Configuration

This directory contains all Supabase database configuration files for the AI-Powered Personal Finance Tracker.

## Files

- **schema.sql**: Complete database schema including tables, indexes, RLS policies, and triggers
- **SETUP.md**: Step-by-step guide for setting up Supabase project and database

## Quick Start

1. **Create Supabase Project**
   - Sign up at https://supabase.com
   - Create a new project
   - Note your project credentials

2. **Run Database Schema**
   - Open Supabase SQL Editor
   - Copy and paste contents of `schema.sql`
   - Execute the script

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env` in the backend directory
   - Add your Supabase credentials

4. **Verify Setup**
   - Start the backend server: `npm run dev`
   - Check health endpoint: http://localhost:5000/health
   - Verify database connection status

## Database Schema Overview

### Tables

1. **transactions**
   - Stores all financial transactions
   - Fields: id, user_id, date, amount, category, merchant, notes
   - Indexes: user_date, category, date_range

2. **budgets**
   - Stores user-defined budgets
   - Fields: id, user_id, name, amount, period_type, period_start, period_end, category
   - Indexes: user, period

3. **budget_alerts**
   - Stores budget threshold alerts
   - Fields: id, budget_id, alert_type, threshold_percentage, triggered_at, resolved_at, is_active
   - Indexes: budget, active

4. **ai_insights**
   - Stores AI-generated financial insights
   - Fields: id, user_id, period_start, period_end, monthly_summary, category_insights, spending_spikes, recommendations, projections
   - Indexes: user_date, period

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- All CRUD operations are restricted to the authenticated user
- Budget alerts are accessible only to the budget owner

### Indexes

Optimized indexes for common query patterns:
- Transaction queries by user and date
- Category-based filtering
- Budget period lookups
- Active alert retrieval

## Security Features

- **Row Level Security**: Automatic data isolation per user
- **JWT Authentication**: Token-based authentication via Supabase Auth
- **Input Validation**: Database constraints for data integrity
- **Cascade Deletes**: Automatic cleanup of related records

## Maintenance

### Adding New Tables

1. Add table definition to `schema.sql`
2. Create appropriate indexes
3. Add RLS policies
4. Update TypeScript types in `backend/src/types/database.ts`

### Modifying Existing Tables

1. Create a migration SQL file
2. Test in development environment
3. Apply to production via Supabase dashboard

### Monitoring

- Check database health via `/health` endpoint
- Monitor query performance in Supabase dashboard
- Review RLS policy effectiveness in Auth logs

## Troubleshooting

### Common Issues

**Issue**: RLS policies blocking queries
- **Solution**: Verify JWT token is being sent correctly
- Check that `auth.uid()` matches the user_id in queries

**Issue**: Slow queries
- **Solution**: Review query execution plans in Supabase
- Ensure indexes are being used
- Consider adding composite indexes for complex queries

**Issue**: Connection timeouts
- **Solution**: Check network connectivity
- Verify Supabase project is not paused
- Review connection pool settings

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
