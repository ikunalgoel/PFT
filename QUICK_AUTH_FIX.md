# Quick Authentication Fix

## 🚨 Signup Not Working? Follow These Steps

### 1️⃣ Disable Email Confirmation (Fastest Fix)

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Authentication** → **Settings**
4. Find "Enable email confirmations"
5. **Turn it OFF** (toggle to disabled)
6. Click **Save**

✅ Now you can signup and login immediately without email confirmation!

---

### 2️⃣ Verify Environment Variables

```bash
cd frontend
cat .env
```

Should show:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Get these values**:
1. Supabase Dashboard → **Settings** → **API**
2. Copy "Project URL" and "anon public" key

---

### 3️⃣ Restart Frontend

```bash
# Stop the server (Ctrl+C)
npm run dev
```

---

### 4️⃣ Test Signup

1. Go to http://localhost:3000/signup
2. Enter:
   - **Email**: test@example.com
   - **Password**: test123456 (min 6 chars)
3. Click "Sign up"
4. Should see success message

---

### 5️⃣ Login

1. Go to http://localhost:3000/login
2. Enter same credentials
3. Click "Sign in"
4. Should redirect to dashboard

---

## 🎯 Alternative: Create User via Dashboard

If signup still doesn't work:

1. Supabase Dashboard → **Authentication** → **Users**
2. Click "Add User"
3. Enter:
   - Email: test@example.com
   - Password: test123456
   - ✅ Check "Auto Confirm User"
4. Click "Create User"
5. Login with these credentials

---

## 🔍 Check for Errors

Open browser console (F12) and look for:
- ❌ "Invalid API key" → Check VITE_SUPABASE_ANON_KEY
- ❌ "Failed to fetch" → Check VITE_SUPABASE_URL
- ❌ "Email not confirmed" → Disable email confirmation

---

## 📋 Quick Checklist

- [ ] Email confirmation disabled in Supabase
- [ ] .env file exists in frontend/
- [ ] VITE_SUPABASE_URL is correct
- [ ] VITE_SUPABASE_ANON_KEY is correct
- [ ] Frontend server restarted
- [ ] No console errors

---

## 🆘 Still Not Working?

See detailed guide: [AUTHENTICATION_TROUBLESHOOTING.md](AUTHENTICATION_TROUBLESHOOTING.md)

Or check:
- Browser console for errors (F12)
- Supabase Dashboard → Logs → Auth Logs
- Network tab for failed requests

---

## ✅ Success!

You'll know it's working when:
- Signup shows "Account created successfully!"
- Login redirects to dashboard
- You can see your email in the navigation bar
- You can create transactions

---

**Need more help?** Check the full troubleshooting guide or open an issue on GitHub.
