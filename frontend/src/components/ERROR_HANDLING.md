# Error Handling and Loading States

This document describes the comprehensive error handling and loading state system implemented in the application.

## Components

### Error Boundary

**Location:** `frontend/src/components/ErrorBoundary.tsx`

A React Error Boundary component that catches JavaScript errors anywhere in the component tree and displays a fallback UI.

**Features:**
- Catches and logs component errors
- Displays user-friendly error message
- Provides "Try Again" and "Reload Page" actions
- Shows error details in a collapsible section (for debugging)

**Usage:**
```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Toast Notifications

**Location:** 
- `frontend/src/components/Toast.tsx`
- `frontend/src/components/ToastContainer.tsx`
- `frontend/src/contexts/ToastContext.tsx`

A toast notification system for displaying transient messages to users.

**Toast Types:**
- `success` - Green toast for successful operations
- `error` - Red toast for errors
- `warning` - Yellow toast for warnings
- `info` - Blue toast for informational messages

**Features:**
- Auto-dismiss after configurable duration (default 5 seconds)
- Manual dismiss button
- Slide-in animation
- Stacked display for multiple toasts
- Accessible with ARIA attributes

**Usage:**
```tsx
import { useToast } from '../contexts/ToastContext';

const MyComponent = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleAction = async () => {
    try {
      await someApiCall();
      showSuccess('Operation completed successfully');
    } catch (error) {
      showError('Operation failed. Please try again.');
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
};
```

### Error Message Components

**Location:** `frontend/src/components/ErrorMessage.tsx`

Reusable components for displaying error states:

#### ErrorMessage
Full error display with optional retry button.

```tsx
<ErrorMessage
  message="Failed to load data"
  onRetry={() => refetch()}
/>
```

#### InlineError
Compact inline error display for forms.

```tsx
<InlineError message="Invalid email address" />
```

#### EmptyState
Display when no data is available.

```tsx
<EmptyState
  title="No transactions yet"
  message="Get started by adding your first transaction."
  action={{
    label: 'Add Transaction',
    onClick: handleAdd
  }}
  icon={<YourIcon />}
/>
```

### Loading Components

**Location:** 
- `frontend/src/components/LoadingSpinner.tsx`
- `frontend/src/components/Skeleton.tsx`

#### LoadingSpinner
Animated spinner for loading states.

**Sizes:** `sm`, `md`, `lg`

```tsx
<LoadingSpinner size="md" />
<LoadingOverlay message="Processing..." />
<LoadingState message="Loading data..." />
```

#### Skeleton Components
Placeholder components that mimic the shape of content while loading.

```tsx
<Skeleton className="h-4 w-full" />
<CardSkeleton />
<TableSkeleton rows={5} />
<ChartSkeleton />
<DashboardSkeleton />
```

## API Error Handling

### Enhanced Axios Configuration

**Location:** `frontend/src/lib/axios.ts`

**Features:**
- Automatic retry for failed requests (up to 3 attempts)
- Exponential backoff for retries
- Retry on network errors and specific status codes (408, 429, 500, 502, 503, 504)
- Automatic token refresh on 401 errors
- 30-second request timeout
- Error message extraction helper

**Retry Configuration:**
```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];
```

**Error Message Helper:**
```tsx
import { getErrorMessage } from '../lib/axios';

try {
  await apiCall();
} catch (error) {
  const message = getErrorMessage(error);
  showError(message);
}
```

### API Hooks with Error Handling

All API hooks have been enhanced with toast notifications:

**Location:**
- `frontend/src/hooks/useTransactions.ts`
- `frontend/src/hooks/useBudgets.ts`
- `frontend/src/hooks/useAnalytics.ts`
- `frontend/src/hooks/useInsights.ts`

**Features:**
- Success toasts for mutations
- Error toasts for failed operations
- Automatic error message extraction
- Query error handling with toast notifications

**Example:**
```tsx
const { data, isLoading, error, refetch } = useTransactions();
const createTransaction = useCreateTransaction();

// Success and error toasts are automatically shown
await createTransaction.mutateAsync(transactionData);
```

### Custom Error Hook

**Location:** `frontend/src/hooks/useApiError.ts`

A utility hook for consistent error handling:

```tsx
import { useApiError } from '../hooks/useApiError';

const MyComponent = () => {
  const { handleError } = useApiError();

  const doSomething = async () => {
    try {
      await apiCall();
    } catch (error) {
      handleError(error, 'Custom error message');
    }
  };
};
```

## Page-Level Error Handling

### Pattern for Pages

All pages follow this pattern:

1. **Initial Loading:** Show skeleton components
2. **Error State:** Show error message with retry button
3. **Empty State:** Show empty state component when no data
4. **Success State:** Show actual content

**Example:**
```tsx
const MyPage = () => {
  const { data, isLoading, error, refetch } = useData();

  // Initial loading
  if (isLoading && !data) {
    return <PageSkeleton />;
  }

  // Error state
  if (error && !data) {
    return (
      <ErrorMessage
        message="Failed to load data"
        onRetry={refetch}
      />
    );
  }

  // Empty state
  if (data.length === 0) {
    return <EmptyState />;
  }

  // Success state
  return <YourContent data={data} />;
};
```

## Best Practices

1. **Always provide user feedback** - Use toasts for mutations, show loading states for queries
2. **Make errors actionable** - Provide retry buttons when appropriate
3. **Use appropriate loading indicators** - Skeletons for initial loads, spinners for actions
4. **Handle edge cases** - Empty states, network errors, timeouts
5. **Log errors** - All errors are logged to console for debugging
6. **Graceful degradation** - Show partial data when possible, don't block entire UI
7. **Consistent messaging** - Use clear, user-friendly error messages

## Testing Error Scenarios

To test error handling:

1. **Network Errors:** Disconnect network or use browser DevTools to throttle
2. **API Errors:** Use backend error responses or mock failed requests
3. **Component Errors:** Throw errors in components to test Error Boundary
4. **Timeout Errors:** Set low timeout values in axios config

## Accessibility

All error and loading components include:
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly messages
- Sufficient color contrast
- Focus management

## Performance Considerations

- Skeletons prevent layout shift during loading
- Toasts are automatically dismissed to avoid clutter
- Error boundaries prevent entire app crashes
- Retry logic uses exponential backoff to avoid overwhelming servers
