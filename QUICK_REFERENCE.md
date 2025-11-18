# Quick Reference Guide

Fast reference for common tasks and commands in the AI Finance Tracker project.

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/ikunalgoel/PFT.git
cd PFT
npm run install:all

# Configure environment
cd backend && cp .env.example .env  # Edit with your values
cd ../frontend && cp .env.example .env  # Edit with your values

# Start development
npm run dev:backend   # Terminal 1
npm run dev:frontend  # Terminal 2
```

## 📝 Common Commands

### Development

```bash
# Start backend (from backend/)
npm run dev              # Development mode with hot reload
npm start                # Production mode
npm run build            # Build TypeScript

# Start frontend (from frontend/)
npm run dev              # Development mode with hot reload
npm run build            # Build for production
npm run preview          # Preview production build

# From root
npm run dev:backend      # Start backend
npm run dev:frontend     # Start frontend
npm run install:all      # Install all dependencies
```

### Testing

```bash
# Backend tests (from backend/)
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Frontend tests (from frontend/)
npm test                 # Run tests (if implemented)
```

### Linting & Formatting

```bash
# Backend (from backend/)
npm run lint             # Check for issues
npm run lint:fix         # Auto-fix issues

# Frontend (from frontend/)
npm run lint             # Check for issues
npm run lint:fix         # Auto-fix issues
```

### Database

```bash
# Apply schema (in Supabase SQL Editor)
# Copy contents of backend/supabase/schema.sql and run

# Check connection
curl http://localhost:5000/health
```

## 🔑 Environment Variables

### Backend (.env)
```bash
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret  # Generate: openssl rand -base64 32
AI_AGENT_API_KEY=your_ai_key  # Optional
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 🌐 API Endpoints

### Base URL
- Development: `http://localhost:5000`
- Production: `https://your-backend.onrender.com`

### Quick Reference

```bash
# Health Check
GET /health

# Transactions
POST   /api/transactions          # Create transaction
POST   /api/transactions/bulk     # Bulk upload (CSV)
GET    /api/transactions          # Get all (with filters)
GET    /api/transactions/:id      # Get one
PUT    /api/transactions/:id      # Update
DELETE /api/transactions/:id      # Delete

# Budgets
POST   /api/budgets               # Create budget
GET    /api/budgets               # Get all
GET    /api/budgets/:id           # Get one
GET    /api/budgets/:id/progress  # Get progress
PUT    /api/budgets/:id           # Update
DELETE /api/budgets/:id           # Delete

# Analytics
GET /api/analytics/summary        # Spending summary
GET /api/analytics/trends         # Spending trends
GET /api/analytics/categories     # Category breakdown

# AI Insights
POST /api/insights/generate       # Generate insights
GET  /api/insights/latest         # Get latest
POST /api/insights/export         # Export as text/PDF
```

### Authentication

All endpoints (except `/health`) require Bearer token:

```bash
Authorization: Bearer <your-jwt-token>
```

## 📊 CSV Upload Format

### Minimal Format
```csv
date,amount,category
2024-01-15,45.50,Groceries
2024-01-16,12.00,Transportation
```

### Complete Format
```csv
date,amount,category,merchant,notes
2024-01-15,45.50,Groceries,Whole Foods,Weekly shopping
2024-01-16,12.00,Transportation,Uber,Ride to work
```

### Rules
- **Date**: YYYY-MM-DD format
- **Amount**: Positive number, no currency symbols
- **Category**: Text string
- **Merchant**: Optional text
- **Notes**: Optional text

## 🚢 Deployment

### Quick Deploy

```bash
# 1. Deploy Backend to Render
# - Connect GitHub repo
# - Render auto-detects render.yaml
# - Set environment variables
# - Deploy

# 2. Deploy Frontend to Netlify
# - Connect GitHub repo
# - Netlify auto-detects netlify.toml
# - Set environment variables (use backend URL)
# - Deploy

# 3. Configure CI/CD
# - Add GitHub secrets
# - Push to main branch
```

### Deployment URLs

After deployment, update these in README.md:
- Frontend: Your Netlify URL
- Backend: Your Render URL

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process
lsof -i :5000          # Mac/Linux
netstat -ano | findstr :5000  # Windows
```

### Database Connection Failed
```bash
# Check credentials
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY

# Test connection
curl http://localhost:5000/health
```

### CORS Errors
```bash
# Verify backend FRONTEND_URL
echo $FRONTEND_URL  # Should be http://localhost:3000

# Verify frontend API URL
echo $VITE_API_URL  # Should be http://localhost:5000
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Build Fails
```bash
# Clean and rebuild
rm -rf dist
npm run build
```

## 📚 Documentation Links

### Essential Guides
- [Complete Setup Guide](docs/SETUP_GUIDE.md)
- [API Reference](docs/API.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Environment Variables](docs/ENVIRONMENT_VARIABLES.md)

### Deployment
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
- [Backend Deployment](backend/DEPLOYMENT.md)
- [Frontend Deployment](frontend/DEPLOYMENT.md)

### Development
- [CSV Upload Format](docs/CSV_UPLOAD.md)
- [Authentication Guide](frontend/AUTHENTICATION.md)
- [Database Setup](backend/supabase/SETUP.md)

## 🔧 Useful Tools

### Generate JWT Secret
```bash
openssl rand -base64 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Test API with cURL
```bash
# Health check
curl http://localhost:5000/health

# Get transactions (with auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/transactions

# Create transaction
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"date":"2024-01-15","amount":45.50,"category":"Groceries"}' \
     http://localhost:5000/api/transactions
```

### Check Logs
```bash
# Local development - watch terminal output

# Production
# Render: Dashboard → Logs tab
# Netlify: Dashboard → Functions tab
# GitHub Actions: Actions tab
```

## 📞 Getting Help

### Documentation
- [Main README](README.md)
- [Documentation Index](docs/README.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)

### Support
- [GitHub Issues](https://github.com/ikunalgoel/PFT/issues)
- [GitHub Discussions](https://github.com/ikunalgoel/PFT/discussions)

## ⚡ Pro Tips

1. **Use environment-specific .env files**
   ```bash
   .env.development
   .env.production
   .env.test
   ```

2. **Enable hot reload for faster development**
   - Backend: `npm run dev` (nodemon)
   - Frontend: `npm run dev` (Vite HMR)

3. **Use React Query DevTools**
   - Already configured in frontend
   - Open browser DevTools to see queries

4. **Monitor API calls**
   - Browser DevTools → Network tab
   - Filter by XHR/Fetch

5. **Check database in Supabase**
   - Table Editor for data
   - SQL Editor for queries
   - Logs for debugging

6. **Use sample CSV files**
   - `examples/transactions-minimal.csv`
   - `examples/transactions-complete.csv`

7. **Test with Postman/Insomnia**
   - Import API endpoints
   - Save authentication tokens
   - Create test collections

8. **Keep dependencies updated**
   ```bash
   npm update
   npm audit fix
   ```

---

**Quick Reference Version**: 1.0  
**Last Updated**: January 2024

For detailed information, see the [complete documentation](docs/README.md).

