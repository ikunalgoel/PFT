import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoadingSpinner } from './components/LoadingSpinner';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Transactions = lazy(() => import('./pages/Transactions').then(m => ({ default: m.Transactions })));
const Budgets = lazy(() => import('./pages/Budgets').then(m => ({ default: m.Budgets })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

// Configure React Query with performance optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Enable query deduplication
      structuralSharing: true,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <AppProvider>
              <ToastProvider>
                <CurrencyProvider>
                  <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Protected routes */}
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <Dashboard />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/transactions"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <Transactions />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/budgets"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <Budgets />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <Settings />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch all - redirect to dashboard */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  </Suspense>
                </CurrencyProvider>
              </ToastProvider>
            </AppProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
