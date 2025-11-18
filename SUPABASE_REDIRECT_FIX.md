# Fix Supabase Email Confirmation Redirect Issue

## Problem

After clicking the email confirmation link from Supabase, you're redirected to `localhost:3000` but can't login.

## Root Cause

Supabase's default redirect URL is not configured to match your frontend application URL.

## Solution

### Option 1: Configure Supabase to Match Your Frontend (Recommended)

#### Step 1: Check Your Frontend Port

Your `vite.config.ts` is configured to run on **port 3000**.

To verify, start your frontend:
```bash
cd frontend
npm run dev
```

Check the console output - it should say something like:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

#### Step 2: Configure Supabase Redirect URLs

1. **Go to Supabase Dashboard**:
   - URL: https://app.supabase.com/project/eitszcnrctlbeyqnlppr/auth/url-configuration

2. **Update URL Configuration**:
   
   **Site URL**: 
   ```
   http://localhost:3000
   ```
   
   **Redirect URLs** (add these):
   ```
   http://localhost:3000/**
   http://localhost:5173/**
   ```
   
   The `**` wildcard allows any path after the base URL.

3. **Save Changes**

#### Step 3: Test Email Confirmation

1. Sign up with a new email address
2. Check your email for the confirmation link
3. Click the confirmation link
4. You should now be redirected to `http://localhost:3000` and be able to login

### Option 2: Disable Email Confirmation (For Development Only)

If you want to skip email confirmation during development:

1. **Go to Supabase Dashboard**:
   - URL: https://app.supabase.com/project/eitszcnrctlbeyqnlppr/auth/providers

2. **Disable Email Confirmation**:
   - Scroll to "Email" provider settings
   - Toggle OFF "Enable email confirmations"
   - Save changes

3. **Test Signup**:
   - Sign up with a new email
   - You should be able to login immediately without email confirmation

**⚠️ Warning**: Only use this for development. Re-enable email confirmation before deploying to production.

### Option 3: Change Frontend Port to Match Supabase Default

If Supabase is already configured for port 5173:

1. **Update `frontend/vite.config.ts`**:
   ```typescript
   server: {
     port: 5173,  // Change from 3000 to 5173
     proxy: {
       '/api': {
         target: 'http://localhost:5000',
         changeOrigin: true,
       },
     },
   },
   ```

2. **Update `backend/.env`**:
   ```env
   FRONTEND_URL=http://localhost:5173
   ```

3. **Restart both servers**

## Current Configuration

Based on your files:

- **Backend**: Running on port 5000 ✓
- **Frontend**: Configured for port 3000 (in vite.config.ts)
- **Supabase**: Needs redirect URL configuration

## Recommended Setup

For development:
```
Frontend:  http://localhost:3000
Backend:   http://localhost:5000
Supabase:  Site URL = http://localhost:3000
           Redirect URLs = http://localhost:3000/**
```

## Testing the Fix

After configuring Supabase:

1. **Start your servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Test signup flow**:
   - Go to http://localhost:3000/signup
   - Create a new account
   - Check email for confirmation link
   - Click the link
   - Should redirect to http://localhost:3000
   - Login with your credentials

3. **Verify login works**:
   - You should be redirected to the dashboard
   - Check that transactions, budgets, etc. are accessible

## Troubleshooting

### Still redirecting to wrong port?

- Clear browser cache and cookies
- Try in incognito/private browsing mode
- Wait a few minutes for Supabase config changes to propagate

### Can't access Supabase dashboard?

- Make sure you're logged into the correct Supabase account
- Check that the project ID in the URL matches your SUPABASE_URL

### Email not arriving?

- Check spam folder
- Verify email provider settings in Supabase
- Try with a different email address

## Production Configuration

When deploying to production, update Supabase with your production URLs:

**Site URL**: `https://your-domain.com`

**Redirect URLs**:
```
https://your-domain.com/**
https://www.your-domain.com/**
```

See `DEPLOYMENT_SUMMARY.md` for full production deployment guide.
