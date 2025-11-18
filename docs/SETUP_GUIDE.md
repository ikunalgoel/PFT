# Complete Setup Guide

Step-by-step guide to set up the AI Finance Tracker application from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clone Repository](#clone-repository)
3. [Install Dependencies](#install-dependencies)
4. [Set Up Supabase](#set-up-supabase)
5. [Configure Environment Variables](#configure-environment-variables)
6. [Run Database Migrations](#run-database-migrations)
7. [Start Development Servers](#start-development-servers)
8. [Verify Installation](#verify-installation)
9. [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** (version 18 or higher)
  - Download: https://nodejs.org
  - Verify: `node --version`
  
- **npm** (comes with Node.js)
  - Verify: `npm --version`
  
- **Git**
  - Download: https://git-scm.com
  - Verify: `git --version`

### Required Accounts

- **GitHub Account**
  - Sign up: https://github.com/join
  
- **Supabase Account** (free tier available)
  - Sign up: https://supabase.com
  
- **AI Agent API Key** (optional, for AI insights)
  - Contact your AI service provider

### Recommended Tools

- **VS Code** or your preferred code editor
- **Postman** or **Insomnia** for API testing
- **Git GUI** (optional): GitHub Desktop, GitKraken, etc.

---

## Clone Repository

### 1. Fork the Repository (Optional)

If you want to contribute or maintain your own version:

1. Go to https://github.com/ikunalgoel/PFT
2. Click "Fork" button in top right
3. Select your account

### 2. Clone to Local Machine

```bash
# Clone the repository
git clone https://github.com/ikunalgoel/PFT.git

# Or if you forked it
git clone https://github.com/YOUR_USERNAME/PFT.git

# Navigate to project directory
cd PFT
```

### 3. Verify Repository Structure

```bash
# List files
ls -la

# You should see:
# - backend/
# - frontend/
# - docs/
# - .github/
# - README.md
# - package.json
```

---

## Install Dependencies

### 1. Install Root Dependencies

```bash
# From project root
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Verify Installation

```bash
# Check backend
cd backend
npm list --depth=0

# Check frontend
cd frontend
npm list --depth=0
```

### Troubleshooting Installation

If you encounter errors:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18.x or higher
```

---

## Set Up Supabase

### 1. Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in project details:
   - **Name**: `ai-finance-tracker` (or your choice)
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is sufficient
4. Click "Create new project"
5. Wait 2-3 minutes for project to initialize

### 2. Get Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy the following values (you'll need them later):
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

### 3. Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open `backend/supabase/schema.sql` in your code editor
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click "Run" or press Ctrl+Enter
7. Verify success message appears

### 4. Verify Tables Created

1. Go to **Table Editor** in Supabase Dashboard
2. You should see these tables:
   - `transactions`
   - `budgets`
   - `budget_alerts`
   - `ai_insights`

### 5. Enable Row Level Security

The schema already includes RLS policies, but verify:

1. Go to **Authentication** → **Policies**
2. Check that policies exist for each table
3. Policies should allow users to access only their own data

### Detailed Supabase Setup

For more detailed instructions, see [backend/supabase/SETUP.md](../backend/supabase/SETUP.md)

---

## Configure Environment Variables

### 1. Create Backend .env File

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# AI Agent Configuration (Optional)
AI_AGENT_API_KEY=your_ai_agent_api_key

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

**Generate JWT_SECRET**:

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Create Frontend .env File

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```bash
# API Configuration
VITE_API_URL=http://localhost:5000

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: 
- Use the same Supabase URL and anon key as backend
- Frontend variables must start with `VITE_`

### 3. Verify Environment Variables

```bash
# Backend
cd backend
cat .env

# Frontend
cd frontend
cat .env
```

### Detailed Environment Variables Guide

For complete documentation, see [docs/ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)

---

## Run Database Migrations

The schema is already applied in Supabase, but verify:

### 1. Check Database Connection

```bash
cd backend
npm run dev
```

Open http://localhost:5000/health in your browser.

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": {
    "connected": true,
    "latency": 45,
    "message": "Database connection successful"
  }
}
```

### 2. Verify Tables

In Supabase Dashboard → Table Editor, check that all tables exist:
- ✅ transactions
- ✅ budgets
- ✅ budget_alerts
- ✅ ai_insights

---

## Start Development Servers

### Option 1: Run Both Servers Separately

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on port 5000
✅ Database connected successfully
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### Option 2: Use Root Scripts

From project root:

**Terminal 1**:
```bash
npm run dev:backend
```

**Terminal 2**:
```bash
npm run dev:frontend
```

### Keep Servers Running

Leave both terminals open while developing. The servers will auto-reload on file changes.

---

## Verify Installation

### 1. Check Backend Health

Open http://localhost:5000/health

Expected: JSON response with `"status": "ok"`

### 2. Check Frontend

Open http://localhost:3000

Expected: Login/Signup page loads

### 3. Test Authentication

1. Click "Sign Up"
2. Enter email and password
3. Submit form
4. Check email for confirmation (if enabled)
5. Log in with credentials

### 4. Test Transaction Creation

1. After logging in, go to Transactions page
2. Click "Add Transaction"
3. Fill in form:
   - Date: Today's date
   - Amount: 50.00
   - Category: Groceries
   - Merchant: Test Store
4. Submit
5. Verify transaction appears in list

### 5. Test CSV Upload

1. Go to Transactions page
2. Click "Upload CSV"
3. Use sample file: `examples/transactions-minimal.csv`
4. Upload and verify transactions appear

### 6. Test Budget Creation

1. Go to Budgets page
2. Click "Create Budget"
3. Fill in form:
   - Name: Monthly Groceries
   - Amount: 500
   - Period: Monthly
   - Category: Groceries
4. Submit
5. Verify budget appears with progress bar

### 7. Test Dashboard

1. Go to Dashboard
2. Verify:
   - Summary cards show data
   - Charts render correctly
   - Filters work
   - No console errors

### 8. Test AI Insights (if configured)

1. Go to Dashboard
2. Click "Generate Insights"
3. Select date range
4. Wait for generation
5. Verify insights appear

---

## Next Steps

### Development

1. **Read the Documentation**
   - [API Reference](API.md)
   - [CSV Upload Guide](CSV_UPLOAD.md)
   - [Troubleshooting](TROUBLESHOOTING.md)

2. **Explore the Code**
   - Backend: `backend/src/`
   - Frontend: `frontend/src/`
   - Database: `backend/supabase/`

3. **Make Changes**
   - Create feature branch: `git checkout -b feature/my-feature`
   - Make changes
   - Test locally
   - Commit: `git commit -m "Add my feature"`

4. **Run Tests**
   ```bash
   # Backend tests
   cd backend
   npm test
   ```

### Deployment

When ready to deploy:

1. **Review Deployment Guides**
   - [Frontend Deployment](../frontend/DEPLOYMENT.md)
   - [Backend Deployment](../backend/DEPLOYMENT.md)
   - [Deployment Checklist](../DEPLOYMENT_CHECKLIST.md)

2. **Set Up Hosting**
   - Create Netlify account
   - Create Render account
   - Configure environment variables

3. **Deploy**
   - Follow deployment guides
   - Test in production
   - Update README with URLs

### Contributing

If you want to contribute:

1. Fork the repository
2. Create feature branch
3. Make changes
4. Write tests
5. Submit pull request

See [Contributing Guidelines](../README.md#contributing)

---

## Common Issues

### Port Already in Use

**Error**: `Port 5000 is already in use`

**Solution**:
```bash
# Find process using port
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process or change PORT in .env
```

### Database Connection Failed

**Error**: `Database connection failed`

**Solutions**:
1. Verify Supabase credentials in `.env`
2. Check Supabase project is not paused
3. Ensure no typos in SUPABASE_URL
4. Verify internet connection

### Module Not Found

**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solutions**:
1. Verify `FRONTEND_URL` in backend `.env`
2. Ensure backend server is running
3. Check `VITE_API_URL` in frontend `.env`

### TypeScript Errors

**Error**: TypeScript compilation errors

**Solution**:
```bash
# Clean build
rm -rf dist
npm run build

# Update TypeScript
npm install typescript@latest --save-dev
```

For more troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## Getting Help

### Documentation
- [README](../README.md)
- [API Documentation](API.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Environment Variables](ENVIRONMENT_VARIABLES.md)

### Support Channels
- [GitHub Issues](https://github.com/ikunalgoel/PFT/issues)
- [GitHub Discussions](https://github.com/ikunalgoel/PFT/discussions)

### Before Asking for Help

1. Check documentation
2. Search existing issues
3. Review troubleshooting guide
4. Verify environment variables
5. Check logs for errors

### When Creating an Issue

Include:
- Clear description of problem
- Steps to reproduce
- Error messages
- Environment details (OS, Node version)
- Screenshots if applicable

---

## Checklist

Use this checklist to track your setup progress:

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Git installed
- [ ] Supabase account created
- [ ] Code editor installed

### Repository Setup
- [ ] Repository cloned
- [ ] Root dependencies installed
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed

### Supabase Setup
- [ ] Supabase project created
- [ ] Database schema applied
- [ ] Tables verified
- [ ] RLS policies enabled
- [ ] Credentials copied

### Environment Configuration
- [ ] Backend .env created
- [ ] Frontend .env created
- [ ] Supabase credentials configured
- [ ] JWT_SECRET generated
- [ ] URLs configured

### Verification
- [ ] Backend server starts
- [ ] Frontend server starts
- [ ] Health check passes
- [ ] Can sign up
- [ ] Can log in
- [ ] Can create transaction
- [ ] Can upload CSV
- [ ] Can create budget
- [ ] Dashboard loads
- [ ] Charts render

### Next Steps
- [ ] Read documentation
- [ ] Explore codebase
- [ ] Make test changes
- [ ] Run tests
- [ ] Plan deployment

---

**Congratulations!** 🎉

You've successfully set up the AI Finance Tracker application. Happy coding!

---

**Last Updated**: January 2024

**Questions?** Open an issue on [GitHub](https://github.com/ikunalgoel/PFT/issues)
