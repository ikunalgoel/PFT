# Data Seeding Guide

## Overview
This guide explains how to populate your AI Finance Tracker with sample data to make the application look presentable and fully functional.

## What Was Fixed

### 1. Transaction Loading Error ✅
- **Issue**: CORS mismatch between frontend (port 3000) and backend (port 5173)
- **Fix**: Updated `backend/.env` to set `FRONTEND_URL=http://localhost:3000`
- **Fix**: Updated `useTransactions` hook to properly extract transactions array from API response

### 2. No Insights Error ✅
- **Issue**: No AI insights were generated for the user
- **Fix**: Created `generate-insights.ts` script to generate mock AI insights

## Sample Data Created

### Transactions (150 total)
- **Date Range**: Last 90 days
- **Categories**: groceries, dining, transportation, entertainment, utilities, healthcare, shopping, travel, education, other
- **Realistic Data**: Random amounts, merchants, and descriptions for each category

### Budgets (10 total)
- **Period**: Current month
- **Categories**: One budget for each spending category
- **Amounts**: Realistic monthly budget limits ($150-$1000 depending on category)

### AI Insights
- **Monthly Summary**: Overview of spending patterns
- **Category Insights**: Top 5 spending categories with personalized insights
- **Spending Spikes**: Largest transactions identified
- **Recommendations**: 3-5 personalized savings tips
- **Projections**: Next week and next month spending forecasts

## How to Use

### Initial Setup (Already Done)
```bash
# Seed transactions and budgets
cd backend
npm run seed

# Generate AI insights
npm run generate-insights
```

### Re-seed Data (If Needed)
If you want to clear and regenerate all data:

1. **Clear existing data** (in Supabase dashboard or via SQL):
```sql
DELETE FROM ai_insights WHERE user_id = 'your-user-id';
DELETE FROM transactions WHERE user_id = 'your-user-id';
DELETE FROM budgets WHERE user_id = 'your-user-id';
```

2. **Run seed scripts**:
```bash
npm run seed
npm run generate-insights
```

### Add More Data
To add additional transactions without clearing existing ones:

```bash
# Edit seed-data.ts and change numTransactions
# Then run:
npm run seed
npm run generate-insights
```

## What You Should See Now

### Dashboard Page
- ✅ Total spending summary
- ✅ Category breakdown pie chart
- ✅ Spending trends line chart
- ✅ Budget progress bars
- ✅ AI-generated insights and recommendations

### Transactions Page
- ✅ List of 150 transactions
- ✅ Filtering by category, date, merchant
- ✅ Add/Edit/Delete functionality
- ✅ CSV upload capability

### Budgets Page
- ✅ 10 category budgets
- ✅ Progress indicators
- ✅ Alert banners for overspending
- ✅ Add/Edit/Delete functionality

### Analytics Page
- ✅ Spending trends over time
- ✅ Category comparisons
- ✅ Top merchants
- ✅ Budget vs actual spending

## Customization

### Adjust Transaction Volume
Edit `backend/src/scripts/seed-data.ts`:
```typescript
const numTransactions = 150; // Change this number
```

### Adjust Date Range
Edit `backend/src/scripts/seed-data.ts`:
```typescript
const date = getRandomDate(90); // Change from 90 days
```

### Adjust Budget Amounts
Edit `backend/src/scripts/seed-data.ts`:
```typescript
const budgetAmounts: Record<string, number> = {
  groceries: 600,  // Modify these values
  dining: 400,
  // ...
};
```

### Customize Merchants
Edit the `merchants` object in `seed-data.ts` to add your preferred merchant names.

## Troubleshooting

### "No insights found" Error
**Solution**: Run `npm run generate-insights` in the backend directory

### Transactions Not Showing
**Solution**: 
1. Check backend is running: `npm run dev`
2. Verify CORS settings in `backend/.env`
3. Check browser console for errors

### Budgets Not Appearing
**Solution**: Ensure budgets were created for the current month period

### Data Looks Unrealistic
**Solution**: Adjust the amount ranges in `getRandomAmount()` function in `seed-data.ts`

## Scripts Reference

| Script | Purpose | Location |
|--------|---------|----------|
| `npm run seed` | Generate transactions and budgets | `backend/` |
| `npm run generate-insights` | Create AI insights | `backend/` |
| `npm run dev` | Start backend server | `backend/` |

## Next Steps

1. ✅ Refresh your browser at `http://localhost:3000`
2. ✅ Navigate through all pages to see the populated data
3. ✅ Test adding/editing/deleting transactions
4. ✅ Try creating new budgets
5. ✅ Explore the AI insights on the dashboard

Your app should now look fully functional and presentable! 🎉
