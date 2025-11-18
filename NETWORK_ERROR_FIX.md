# Network Error Fix Guide

## 🚨 "Failed to load" / Network Errors After Login

You can login but everything shows "Failed to load" or network errors? This means the **backend server isn't running** or the frontend can't connect to it.

---

## ⚡ Quick Fix (5 minutes)

### Step 1: Check if Backend is Running

Open a new terminal and run:

```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 Starting AI Finance Tracker Backend...
📊 Environment: development
🔌 Testing database connection...
✓ Database connected successfully
✓ Server running on port 5000
✓ Health check: http://localhost:5000/health
✓ API endpoint: http://localhost:5000/api
```

**If you see errors**, go to [Backend Troubleshooting](#backend-troubleshooting) below.

### Step 2: Verify Backend is Accessible

Open your browser and go to:
```
http://localhost:5000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T...",
  "database": {
    "connected": true,
    "latency": 45,
    "message": "Database connection successful"
  }
}
```

**If you get an error**, the backend isn't running properly.

### Step 3: Check Frontend Environment Variable

```bash
cd frontend
cat .env
```

**Should show:**
```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**If VITE_API_URL is missing or wrong**, add/fix it:
```bash
echo "VITE_API_URL=http://localhost:5000" >> .env
```

### Step 4: Restart Frontend

```bash
# Stop frontend (Ctrl+C)
npm run dev
```

### Step 5: Test Again

1. Refresh your browser (Ctrl+R or Cmd+R)
2. Try loading the dashboard
3. Should now work!

---

## 🔍 Detailed Diagnostics

### Check 1: Is Backend Running?

```bash
# Check if port 5000 is in use
# Windows:
netstat -ano | findstr :5000

# Mac/Linux:
lsof -i :5000
```

**If nothing shows up**, backend isn't running.

### Check 2: Backend Environment Variables

```bash
cd backend
cat .env
```

**Must have:**
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
FRONTEND_URL=http://localhost:3000
```

**If missing**, create from example:
```bash
cp .env.example .env
# Then edit with your Supabase credentials
```

### Check 3: Browser Console Errors

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors like:
   - `Failed to fetch` → Backend not running
   - `Network Error` → Backend not accessible
   - `ERR_CONNECTION_REFUSED` → Backend not running
   - `CORS error` → Backend CORS misconfigured

### Check 4: Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Refresh page
4. Look for failed requests (red)
5. Click on failed request
6. Check error details

---

## 🛠️ Backend Troubleshooting

### Issue 1: Backend Won't Start

**Error**: `Port 5000 is already in use`

**Solution**:
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

### Issue 2: Database Connection Failed

**Error**: `Database connection failed`

**Solution**:
1. Check backend/.env has correct Supabase credentials
2. Verify Supabase project is active (not paused)
3. Test connection:
   ```bash
   cd backend
   npm run dev
   # Look for "Database connected successfully"
   ```

### Issue 3: Missing Dependencies

**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: TypeScript Errors

**Error**: TypeScript compilation errors

**Solution**:
```bash
cd backend
npm run build
# Fix any errors shown
```

### Issue 5: CORS Errors

**Error**: `CORS policy: No 'Access-Control-Allow-Origin'`

**Solution**:

1. Check backend/.env:
   ```env
   FRONTEND_URL=http://localhost:3000
   ```

2. Verify frontend is running on port 3000:
   ```bash
   cd frontend
   npm run dev
   # Check which port it says (should be 3000)
   ```

3. If frontend is on different port (e.g., 5173), update backend/.env:
   ```env
   FRONTEND_URL=http://localhost:5173
   ```

4. Restart backend

---

## 📋 Complete Setup Checklist

### Backend Setup
- [ ] Backend dependencies installed (`npm install`)
- [ ] Backend .env file created
- [ ] SUPABASE_URL set in backend/.env
- [ ] SUPABASE_ANON_KEY set in backend/.env
- [ ] SUPABASE_SERVICE_KEY set in backend/.env
- [ ] FRONTEND_URL set correctly in backend/.env
- [ ] Backend server running (`npm run dev`)
- [ ] Health check accessible (http://localhost:5000/health)
- [ ] No errors in backend console

### Frontend Setup
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend .env file created
- [ ] VITE_API_URL set to http://localhost:5000
- [ ] VITE_SUPABASE_URL set
- [ ] VITE_SUPABASE_ANON_KEY set
- [ ] Frontend server running (`npm run dev`)
- [ ] No errors in browser console
- [ ] Can login successfully

### Connection Test
- [ ] Backend health check returns 200 OK
- [ ] Frontend can reach backend
- [ ] No CORS errors
- [ ] Can load dashboard after login
- [ ] Can fetch transactions
- [ ] Can create transactions

---

## 🎯 Step-by-Step Setup

### Terminal 1: Start Backend

```bash
# Navigate to backend
cd backend

# Install dependencies (if not done)
npm install

# Create .env if missing
cp .env.example .env

# Edit .env with your Supabase credentials
# (Use nano, vim, or your editor)

# Start backend
npm run dev

# Should see:
# ✓ Server running on port 5000
# ✓ Database connected successfully
```

**Keep this terminal open!**

### Terminal 2: Start Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not done)
npm install

# Create .env if missing
cp .env.example .env

# Edit .env
# Make sure VITE_API_URL=http://localhost:5000

# Start frontend
npm run dev

# Should see:
# ➜  Local:   http://localhost:3000/
```

**Keep this terminal open!**

### Browser: Test Application

1. Open http://localhost:3000
2. Login with your credentials
3. Should see dashboard load successfully
4. Try creating a transaction
5. Should work without errors

---

## 🔧 Quick Tests

### Test 1: Backend Health

```bash
curl http://localhost:5000/health
```

**Expected**: JSON response with `"status": "ok"`

### Test 2: Backend API

```bash
curl http://localhost:5000/api
```

**Expected**: `{"message":"AI Finance Tracker API"}`

### Test 3: Frontend to Backend

Open browser console and run:
```javascript
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend reachable:', d))
  .catch(e => console.error('❌ Backend not reachable:', e))
```

---

## 🐛 Debug Mode

### Enable Backend Logging

The backend already logs requests. Check the backend terminal for:
```
GET /api/transactions 200 145ms
GET /api/budgets 200 89ms
```

### Enable Frontend Logging

Add to browser console:
```javascript
// See all API requests
localStorage.setItem('debug', 'axios')
```

Then refresh page and check console for detailed request logs.

---

## 📊 Common Error Messages

### "Failed to load transactions"
- ❌ Backend not running
- ❌ Wrong VITE_API_URL
- ❌ Database connection failed

### "Network Error"
- ❌ Backend not running
- ❌ Wrong port in VITE_API_URL
- ❌ Firewall blocking connection

### "Request failed with status code 401"
- ❌ Authentication token expired
- ❌ Supabase session invalid
- ✅ Try logging out and back in

### "Request failed with status code 500"
- ❌ Backend error
- ❌ Database query failed
- ✅ Check backend terminal for error details

### "CORS policy error"
- ❌ FRONTEND_URL wrong in backend/.env
- ❌ Backend not allowing frontend origin
- ✅ Update FRONTEND_URL and restart backend

---

## ✅ Success Indicators

You'll know everything is working when:

- ✅ Backend terminal shows "Server running on port 5000"
- ✅ Frontend terminal shows "Local: http://localhost:3000"
- ✅ http://localhost:5000/health returns JSON
- ✅ Dashboard loads without errors
- ✅ Can see transactions (even if empty)
- ✅ Can create new transactions
- ✅ Can create budgets
- ✅ No red errors in browser console
- ✅ No errors in backend terminal

---

## 🆘 Still Having Issues?

### Collect Debug Information

1. **Backend terminal output**:
   ```bash
   cd backend
   npm run dev > backend-log.txt 2>&1
   ```

2. **Frontend terminal output**:
   ```bash
   cd frontend
   npm run dev > frontend-log.txt 2>&1
   ```

3. **Browser console errors**:
   - Open DevTools (F12)
   - Console tab
   - Copy all red errors

4. **Network tab**:
   - Open DevTools (F12)
   - Network tab
   - Screenshot failed requests

5. **Environment variables** (hide sensitive parts):
   ```bash
   # Backend
   cd backend
   cat .env | sed 's/=.*/=***/'
   
   # Frontend
   cd frontend
   cat .env | sed 's/=.*/=***/'
   ```

### Create GitHub Issue

Include:
- Operating system
- Node version (`node --version`)
- Error messages
- Terminal outputs
- Browser console errors
- Steps you've tried

---

## 📚 Related Guides

- [Setup Guide](docs/SETUP_GUIDE.md) - Complete setup instructions
- [Environment Variables](docs/ENVIRONMENT_VARIABLES.md) - All environment variables explained
- [Troubleshooting](docs/TROUBLESHOOTING.md) - General troubleshooting
- [Authentication Fix](AUTHENTICATION_TROUBLESHOOTING.md) - Auth-specific issues

---

## 💡 Pro Tips

1. **Always run both servers**: Frontend AND backend must be running
2. **Check ports**: Backend on 5000, Frontend on 3000
3. **Restart after .env changes**: Always restart servers after changing .env
4. **Check both terminals**: Errors might show in either terminal
5. **Clear browser cache**: Sometimes helps with stale data
6. **Use incognito mode**: Test in incognito to rule out cache issues

---

**Need more help?** Check the detailed troubleshooting guide or open an issue with the debug information above.
