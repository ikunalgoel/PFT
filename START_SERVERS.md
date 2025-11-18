# 🚀 How to Start the Application

## Quick Start (2 Terminals)

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

**Wait for**: `✓ Server running on port 5000`

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

**Wait for**: `➜  Local:   http://localhost:3000/`

### Browser

Open: http://localhost:3000

---

## ✅ Verify Everything Works

### 1. Check Backend Health

Open in browser: http://localhost:5000/health

Should see:
```json
{
  "status": "ok",
  "database": {
    "connected": true
  }
}
```

### 2. Check Frontend

Open: http://localhost:3000

Should see login page (no errors)

### 3. Login and Test

1. Login with your credentials
2. Dashboard should load
3. No "Failed to load" errors

---

## ❌ If Backend Won't Start

### Check .env file exists

```bash
cd backend
ls -la .env
```

If missing:
```bash
cp .env.example .env
# Then edit with your Supabase credentials
```

### Required in backend/.env

```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
FRONTEND_URL=http://localhost:3000
```

---

## ❌ If Frontend Shows Network Errors

### Check VITE_API_URL

```bash
cd frontend
cat .env
```

Should have:
```env
VITE_API_URL=http://localhost:5000
```

If missing or wrong:
```bash
echo "VITE_API_URL=http://localhost:5000" >> .env
```

Then restart frontend:
```bash
# Press Ctrl+C
npm run dev
```

---

## 🔍 Quick Diagnostics

### Is backend running?

```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

If nothing shows → backend not running

### Can frontend reach backend?

Open browser console (F12) and run:
```javascript
fetch('http://localhost:5000/health').then(r => r.json()).then(console.log)
```

Should see: `{status: "ok", ...}`

---

## 📋 Startup Checklist

Before starting:
- [ ] Backend .env file exists with Supabase credentials
- [ ] Frontend .env file exists with VITE_API_URL
- [ ] Dependencies installed (`npm install` in both folders)

To start:
- [ ] Terminal 1: `cd backend && npm run dev`
- [ ] Terminal 2: `cd frontend && npm run dev`
- [ ] Both show success messages
- [ ] http://localhost:5000/health works
- [ ] http://localhost:3000 loads

After login:
- [ ] Dashboard loads without errors
- [ ] Can view transactions
- [ ] Can create transactions
- [ ] No network errors

---

## 🆘 Still Not Working?

See detailed guide: [NETWORK_ERROR_FIX.md](NETWORK_ERROR_FIX.md)

Common issues:
1. **Backend not running** → Start it in Terminal 1
2. **Wrong VITE_API_URL** → Check frontend/.env
3. **Missing .env files** → Copy from .env.example
4. **Port already in use** → Kill process or change port

---

## 💡 Remember

- **Both servers must be running** (backend AND frontend)
- **Keep terminals open** while using the app
- **Restart after .env changes**
- **Check both terminals** for error messages

---

**Quick test**: Can you access http://localhost:5000/health in your browser?
- ✅ Yes → Backend is running
- ❌ No → Start backend first
