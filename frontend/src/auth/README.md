# Authentication Implementation

This document describes the authentication system implemented for the AI Finance Tracker.

## Overview

The application uses Supabase Auth for user authentication and session management. The implementation includes:

- User signup and login
- Protected routes
- Automatic token refresh
- Session persistence
- Logout functionality

## Components

### 1. Supabase Configuration (`config/supabase.ts`)

Initializes the Supabase client with:
- Auto token refresh
- Session persistence in localStorage
- Session detection from URL (for email confirmation links)

### 2. Authentication Context (`contexts/AuthContext.tsx`)

Provides authentication state and methods throughout the app:

```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}
```

Features:
- Listens to auth state changes via `onAuthStateChange`
- Automatically updates user state on login/logout
- Provides loading state during initialization

### 3. Protected Routes (`components/ProtectedRoute.tsx`)

Wrapper component that:
- Shows loading spinner while checking auth state
- Redirects to login if user is not authenticated
- Preserves the intended destination for post-login redirect
- Renders protected content for authenticated users

### 4. Login Page (`pages/Login.tsx`)

Features:
- Email and password input
- Form validation
- Error display
- Loading state during authentication
- Link to signup page
- Redirects to intended page after successful login

### 5. Signup Page (`pages/Signup.tsx`)

Features:
- Email and password input with confirmation
- Password validation (minimum 6 characters)
- Password match validation
- Success message with email confirmation notice
- Auto-redirect to login after successful signup
- Link to login page

### 6. Axios Interceptors (`lib/axios.ts`)

Handles API authentication:

**Request Interceptor:**
- Automatically adds JWT token to all API requests
- Retrieves fresh token from Supabase session

**Response Interceptor:**
- Detects 401 (Unauthorized) errors
- Attempts to refresh the session
- Retries failed request with new token
- Signs out user if refresh fails
- Redirects to login page on auth failure

### 7. Layout Component (`components/Layout.tsx`)

Includes:
- User email display
- Sign out button
- Navigation menu
- Responsive design for mobile and desktop

## Authentication Flow

### Signup Flow

1. User enters email and password on signup page
2. Password validation checks (length, match)
3. `signUp()` called from AuthContext
4. Supabase creates user account
5. Confirmation email sent to user
6. Success message displayed
7. Auto-redirect to login page

### Login Flow

1. User enters credentials on login page
2. `signIn()` called from AuthContext
3. Supabase validates credentials
4. Session created and stored in localStorage
5. User state updated in AuthContext
6. Redirect to intended page (or dashboard)

### Protected Route Access

1. User navigates to protected route
2. ProtectedRoute checks auth state
3. If loading, show spinner
4. If not authenticated, redirect to login with return URL
5. If authenticated, render protected content

### Token Refresh Flow

1. API request made with expired token
2. Backend returns 401 error
3. Axios interceptor catches error
4. Calls `supabase.auth.refreshSession()`
5. If successful, retry request with new token
6. If failed, sign out and redirect to login

### Logout Flow

1. User clicks "Sign Out" button
2. `signOut()` called from AuthContext
3. Supabase clears session
4. User state set to null
5. Redirect to login page

## Session Management

### Persistence
- Sessions are stored in localStorage by default
- Survives page refreshes and browser restarts
- Automatically restored on app initialization

### Auto Refresh
- Supabase automatically refreshes tokens before expiry
- Configured in Supabase client initialization
- No manual intervention required

### Security
- JWT tokens sent in Authorization header
- HTTPS required in production
- Tokens validated on backend via Supabase Auth
- Row Level Security (RLS) enforced in database

## Environment Variables

Required in `frontend/.env`:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

## Backend Integration

The backend uses the `authenticate` middleware to verify tokens:

```typescript
// Protected route example
router.get('/api/transactions', authenticate, getTransactions);
```

The middleware:
- Extracts token from Authorization header
- Verifies with Supabase
- Attaches user info to request object
- Returns 401 if invalid

## Error Handling

### Frontend
- Display user-friendly error messages
- Handle network errors gracefully
- Show loading states during async operations
- Provide clear feedback on auth failures

### Backend
- Return structured error responses
- Log authentication errors
- Handle token expiration
- Validate all auth requests

## Testing Authentication

### Manual Testing

1. **Signup:**
   - Navigate to `/signup`
   - Enter email and password
   - Verify success message
   - Check email for confirmation

2. **Login:**
   - Navigate to `/login`
   - Enter credentials
   - Verify redirect to dashboard
   - Check user email in header

3. **Protected Routes:**
   - Try accessing `/` without login
   - Verify redirect to login
   - Login and verify access granted

4. **Logout:**
   - Click "Sign Out" button
   - Verify redirect to login
   - Try accessing protected route
   - Verify redirect to login

5. **Token Refresh:**
   - Login and wait for token to expire
   - Make API request
   - Verify automatic refresh
   - Verify request succeeds

### Automated Testing

Consider adding tests for:
- AuthContext state management
- ProtectedRoute redirect logic
- Login/Signup form validation
- Axios interceptor behavior
- Token refresh mechanism

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` file exists in frontend directory
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart dev server after adding env vars

### "Invalid or expired token"
- Check Supabase project is active
- Verify anon key is correct
- Clear localStorage and login again
- Check backend can reach Supabase

### "Redirect loop on login"
- Check ProtectedRoute logic
- Verify user state updates correctly
- Check for conflicting redirects
- Clear browser cache and cookies

### "Session not persisting"
- Verify localStorage is enabled
- Check Supabase client config
- Ensure `persistSession: true` is set
- Check for browser privacy settings

## Future Enhancements

Potential improvements:
- Social authentication (Google, GitHub)
- Two-factor authentication
- Password reset functionality
- Email verification enforcement
- Remember me functionality
- Session timeout warnings
- Account deletion
- Profile management
