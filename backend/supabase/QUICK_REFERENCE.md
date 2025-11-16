# Supabase Quick Reference

Quick reference for common Supabase operations in the AI Finance Tracker.

## Environment Variables

```bash
# Backend
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Frontend
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## Authentication

### Backend - Verify JWT Token
```typescript
import { authenticate } from './middleware/auth.js';

// Protect route with authentication
app.get('/api/protected', authenticate, (req, res) => {
  const userId = req.user?.id; // User ID from JWT
  // ... your logic
});
```

### Frontend - Sign Up
```typescript
import { supabase } from './config/supabase';

const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});
```

### Frontend - Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### Frontend - Get Current User
```typescript
import { getCurrentUser } from './config/supabase';

const user = await getCurrentUser();
```

### Frontend - Sign Out
```typescript
import { signOut } from './config/supabase';

await signOut();
```

## Database Operations

### Backend - Query with Retry Logic
```typescript
import { executeQuery } from './utils/database.js';
import { supabase } from './config/supabase.js';

const transactions = await executeQuery(
  () => supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
);
```

### Backend - Insert with Retry Logic
```typescript
import { executeMutation } from './utils/database.js';

const newTransaction = await executeMutation(
  () => supabase
    .from('transactions')
    .insert({
      user_id: userId,
      date: '2024-01-15',
      amount: 45.50,
      category: 'Groceries',
    })
    .select()
    .single()
);
```

### Frontend - Query Data
```typescript
import { supabase } from './config/supabase';

const { data, error } = await supabase
  .from('transactions')
  .select('*')
  .order('date', { ascending: false });
```

### Frontend - Insert Data
```typescript
const { data, error } = await supabase
  .from('transactions')
  .insert({
    date: '2024-01-15',
    amount: 45.50,
    category: 'Groceries',
    merchant: 'Whole Foods',
  })
  .select()
  .single();
```

## Common Queries

### Get Transactions by Date Range
```typescript
const { data } = await supabase
  .from('transactions')
  .select('*')
  .gte('date', startDate)
  .lte('date', endDate)
  .order('date', { ascending: false });
```

### Get Transactions by Category
```typescript
const { data } = await supabase
  .from('transactions')
  .select('*')
  .eq('category', 'Groceries')
  .order('date', { ascending: false });
```

### Get Budget with Progress
```typescript
const { data: budget } = await supabase
  .from('budgets')
  .select('*')
  .eq('id', budgetId)
  .single();

const { data: transactions } = await supabase
  .from('transactions')
  .select('amount')
  .eq('category', budget.category)
  .gte('date', budget.period_start)
  .lte('date', budget.period_end);

const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
```

### Get Active Budget Alerts
```typescript
const { data } = await supabase
  .from('budget_alerts')
  .select(`
    *,
    budgets (
      name,
      amount,
      category
    )
  `)
  .eq('is_active', true)
  .order('triggered_at', { ascending: false });
```

## Real-time Subscriptions

### Listen to Transaction Changes
```typescript
const subscription = supabase
  .channel('transactions')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'transactions',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('Transaction changed:', payload);
      // Update UI
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

## Error Handling

### Backend - Handle Database Errors
```typescript
import { handleDatabaseError } from './utils/database.js';

try {
  const { data, error } = await supabase
    .from('transactions')
    .select('*');
  
  if (error) {
    handleDatabaseError(error);
  }
  
  return data;
} catch (error) {
  console.error('Database operation failed:', error);
  throw error;
}
```

### Frontend - Handle Auth Errors
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  if (error.message.includes('Invalid login credentials')) {
    // Show user-friendly message
    alert('Invalid email or password');
  } else {
    alert('An error occurred. Please try again.');
  }
}
```

## Testing

### Test Database Connection
```typescript
import { testDatabaseConnection } from './config/supabase.js';

const isConnected = await testDatabaseConnection();
console.log('Database connected:', isConnected);
```

### Check Database Health
```typescript
import { checkDatabaseHealth } from './utils/database.js';
import { supabase } from './config/supabase.js';

const health = await checkDatabaseHealth(supabase);
console.log('Database health:', health);
```

## Useful SQL Queries

### Get Spending Summary by Category
```sql
SELECT 
  category,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount
FROM transactions
WHERE user_id = 'user-uuid'
  AND date >= '2024-01-01'
  AND date <= '2024-01-31'
GROUP BY category
ORDER BY total_amount DESC;
```

### Get Budget Status
```sql
SELECT 
  b.name,
  b.amount as budget_limit,
  COALESCE(SUM(t.amount), 0) as spent,
  b.amount - COALESCE(SUM(t.amount), 0) as remaining,
  (COALESCE(SUM(t.amount), 0) / b.amount * 100) as percentage_used
FROM budgets b
LEFT JOIN transactions t ON 
  t.user_id = b.user_id
  AND t.category = b.category
  AND t.date >= b.period_start
  AND t.date <= b.period_end
WHERE b.user_id = 'user-uuid'
GROUP BY b.id, b.name, b.amount;
```

## Tips

1. **Always use RLS**: Row Level Security is enabled by default. Make sure JWT tokens are sent with requests.

2. **Use indexes**: The schema includes optimized indexes. Use them in your queries for better performance.

3. **Batch operations**: For bulk inserts, use array of objects instead of multiple single inserts.

4. **Error handling**: Always check for errors in Supabase responses before using data.

5. **Type safety**: Use TypeScript interfaces from `backend/src/types/database.ts` for type safety.

6. **Connection pooling**: Supabase handles connection pooling automatically. Don't create multiple clients.

7. **Rate limiting**: Be aware of Supabase rate limits on the free tier.

8. **Caching**: Implement caching for frequently accessed data to reduce database load.
