# Authentication Troubleshooting Guide

## Supabase Signup Not Working - Solutions

This guide helps you diagnose and fix authentication issues with Supabase.

---

## 🔍 Common Issues & Solutions

### Issue 1: Email Confirmation Required

**Symptom**: Signup succeeds but you can't login immediately

**Cause**: Supabase requires email confirmation by default

**Solution**:

#### Option A: Disable Email Confirmation (Development Only)

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Email Auth**
4. **Disable** "Enable email confirmations"
5. Click "Save"

Now users can login immediately after signup without email confirmation.

#### Option B: Check Your Email

1. After signing up, check your email inbox
2. Look for email from Supabase
3. Click the confirmation link
4. Return to app and login

#### Option C: Use Supabase Dashboard to Confirm

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Find your user
4. Click on the user
5. Manually confirm the email

---

### Issue 2: Invalid Supabase Credentials

**Symptom**: Error message about invalid credentials or connection

**Cause**: Incorrect Supabase URL or keys in environment variables

**Solution**:

1. **Get Correct Credentials from Supabase**:
   - Go to https://app.supabase.com
   - Select your project
   - Go to **Settings** → **API**
   - Copy:
     - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
     - **anon public** key (starts with `eyJ...`)

2. **Update Frontend .env**:
   ```bash
   cd frontend
   nano .env  # or use your editor
   ```
   
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Restart Frontend Server**:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

---

### Issue 3: CORS Errors

**Symptom**: Browser console shows CORS policy errors

**Cause**: Supabase not configured to allow your frontend URL

**Solution**:

1. Go to Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Scroll to **CORS Settings**
4. Add your frontend URL: `http://localhost:3000`
5. Click "Save"

---

### Issue 4: Password Requirements Not Met

**Symptom**: Error about password being too weak

**Cause**: Supabase has minimum password requirements

**Solution**:

Ensure password meets these requirements:
- ✅ At least 6 characters long
- ✅ Contains letters and numbers (recommended)
- ✅ No spaces

---

### Issue 5: Rate Limiting

**Symptom**: "Too many requests" error

**Cause**: Supabase rate limits signup attempts

**Solution**:

1. Wait 5-10 minutes
2. Try again
3. If persistent, check Supabase Dashboard → **Authentication** → **Rate Limits**

---

### Issue 6: Email Already Registered

**Symptom**: Error saying email is already in use

**Cause**: User already exists with that email

**Solution**:

#### Option A: Login Instead
Use the login page with existing credentials

#### Option B: Reset Password
1. Go to Supabase Dashboard
2. **Authentication** → **Users**
3. Find the user
4. Delete the user (if testing)
5. Try signup again

#### Option C: Use Different Email
Sign up with a different email address

---

## 🚀 Quick Diagnostic Steps

### Step 1: Check Environment Variables

```bash
# Frontend
cd frontend
cat .env

# Should show:
# VITE_SUPABASE_URL=https://...
# VITE_SUPABASE_ANON_KEY=eyJ...
```

**Verify**:
- ✅ Variables start with `VITE_`
- ✅ URL is correct (no trailing slash)
- ✅ Anon key is complete (very long string)

### Step 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try to signup
4. Look for error messages

**Common Errors**:
- `Invalid API key` → Check VITE_SUPABASE_ANON_KEY
- `Failed to fetch` → Check VITE_SUPABASE_URL
- `Email not confirmed` → Disable email confirmation

### Step 3: Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try to signup
4. Look for requests to Supabase

**Check**:
- ✅ Request to `https://your-project.supabase.co/auth/v1/signup`
- ✅ Status code 200 (success) or error code
- ✅ Response body for error details

### Step 4: Test Supabase Connection

Create a test file:

```bash
cd frontend/src
nano test-supabase.ts
```

```typescript
import { supabase } from './config/supabase';

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('❌ Connection failed:', error);
  } else {
    console.log('✅ Connection successful');
    console.log('Session:', data);
  }
}

testConnection();
```

Run in browser console or add to a component temporarily.

---

## 📋 Complete Setup Checklist

### Supabase Configuration

- [ ] Supabase project created
- [ ] Database schema applied (`backend/supabase/schema.sql`)
- [ ] Email confirmation disabled (for development)
- [ ] CORS configured for `http://localhost:3000`
- [ ] Credentials copied (URL and anon key)

### Frontend Configuration

- [ ] `.env` file created in `frontend/`
- [ ] `VITE_SUPABASE_URL` set correctly
- [ ] `VITE_SUPABASE_ANON_KEY` set correctly
- [ ] Frontend server restarted after .env changes
- [ ] No console errors when loading app

### Testing

- [ ] Can access signup page
- [ ] Can fill in signup form
- [ ] Can submit form without errors
- [ ] Can see success message or error details
- [ ] Can login after signup (if email confirmation disabled)

---

## 🔧 Manual Testing Steps

### Test 1: Create Account via Supabase Dashboard

1. Go to Supabase Dashboard
2. **Authentication** → **Users**
3. Click "Add User"
4. Enter email and password
5. Click "Create User"
6. Try logging in with these credentials in your app

**If this works**: Your app's signup code has an issue
**If this doesn't work**: Supabase configuration issue

### Test 2: Check Supabase Logs

1. Go to Supabase Dashboard
2. **Logs** → **Auth Logs**
3. Try to signup in your app
4. Refresh logs
5. Look for signup attempt and any errors

### Test 3: Use Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Check project status
supabase projects list

# View auth config
supabase auth config
```

---

## 🎯 How to Login

### Method 1: Standard Login

1. Go to http://localhost:3000/login
2. Enter your email
3. Enter your password
4. Click "Sign in"

### Method 2: Create Test User via Dashboard

1. Go to Supabase Dashboard
2. **Authentication** → **Users**
3. Click "Add User"
4. Fill in:
   - **Email**: test@example.com
   - **Password**: test123456
   - **Auto Confirm User**: ✅ (check this!)
5. Click "Create User"
6. Use these credentials to login

### Method 3: Disable Email Confirmation

1. Supabase Dashboard → **Authentication** → **Settings**
2. Disable "Enable email confirmations"
3. Sign up normally
4. Login immediately (no email confirmation needed)

---

## 🐛 Debug Mode

Add debug logging to see what's happening:

### Update AuthContext.tsx

```typescript
const signUp = async (email: string, password: string) => {
  console.log('🔐 Attempting signup...', { email });
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  console.log('📊 Signup response:', { data, error });
  
  if (error) {
    console.error('❌ Signup error:', error);
  } else {
    console.log('✅ Signup successful:', data);
  }
  
  return { error };
};
```

### Check Console Output

After adding debug logging:
1. Open browser console (F12)
2. Try to signup
3. Review console messages
4. Share error details if asking for help

---

## 📞 Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Verify environment variables
3. ✅ Check browser console for errors
4. ✅ Check Supabase auth logs
5. ✅ Try creating user via dashboard

### Information to Provide

When asking for help, include:

```
**Issue**: Cannot signup/login

**Environment**:
- OS: Windows/Mac/Linux
- Browser: Chrome/Firefox/Safari
- Node version: 18.x
- Frontend running: Yes/No
- Backend running: Yes/No

**Error Message**:
[Paste exact error from console]

**Steps Taken**:
1. Created Supabase project
2. Applied schema
3. Set environment variables
4. Tried to signup

**Environment Variables** (hide sensitive parts):
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (first 20 chars)

**Console Errors**:
[Paste relevant console errors]
```

---

## ✅ Quick Fix Summary

**Most Common Solution**:

1. **Disable Email Confirmation**:
   - Supabase Dashboard → Authentication → Settings
   - Disable "Enable email confirmations"
   - Save

2. **Verify Environment Variables**:
   ```bash
   cd frontend
   cat .env
   # Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   ```

3. **Restart Frontend**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Try Signup Again**:
   - Go to http://localhost:3000/signup
   - Enter email and password
   - Submit
   - Should work immediately

5. **Login**:
   - Go to http://localhost:3000/login
   - Use same credentials
   - Should login successfully

---

## 🎉 Success Indicators

You'll know authentication is working when:

- ✅ Signup shows success message
- ✅ No errors in browser console
- ✅ Can login with created credentials
- ✅ Redirected to dashboard after login
- ✅ Can see user email in navigation
- ✅ Can create transactions (proves auth works)

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [Setup Guide](docs/SETUP_GUIDE.md)
- [Environment Variables Guide](docs/ENVIRONMENT_VARIABLES.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)

---

**Still having issues?** Open an issue on GitHub with the information template above.
