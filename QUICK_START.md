# Quick Start Guide - AI Finance Tracker

## 🚀 Start the Application

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
Server will run on: `http://localhost:5000`

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:3000`

### 3. Access the Application
Open your browser: `http://localhost:3000`

**Test Credentials:**
- Email: `test@example.com`
- Password: (your test password)

## 📊 Sample Data (Already Loaded)

✅ **150 Transactions** - Last 90 days across 10 categories
✅ **10 Budgets** - Monthly budgets for each category  
✅ **AI Insights** - Generated insights, recommendations, and projections

## 🔧 Common Commands

### Backend
```bash
cd backend

# Start development server
npm run dev

# Seed sample data
npm run seed

# Generate AI insights
npm run generate-insights

# Run tests
npm test
```

### Frontend
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Application Features

### Dashboard
- Total spending overview
- Category breakdown charts
- Spending trends
- Budget progress
- AI-generated insights

### Transactions
- View all transactions
- Add/Edit/Delete transactions
- Filter by category, date, merchant
- CSV bulk upload

### Budgets
- Create monthly budgets
- Track spending vs budget
- Alert notifications
- Category-based budgets

### Analytics
- Spending trends over time
- Category comparisons
- Top merchants
- Budget performance

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check if port 5000 is available
netstat -ano | findstr :5000

# Verify environment variables
cat backend/.env
```

### Frontend Not Loading
```bash
# Check if port 3000 is available
netstat -ano | findstr :3000

# Clear node modules and reinstall
rm -rf node_modules
npm install
```

### CORS Errors
Ensure `backend/.env` has:
```
FRONTEND_URL=http://localhost:3000
```

### No Data Showing
```bash
cd backend
npm run seed
npm run generate-insights
```

## 📚 Documentation

- [Setup Guide](docs/SETUP_GUIDE.md)
- [API Documentation](docs/API.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Data Seeding Guide](DATA_SEEDING_GUIDE.md)

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 🎯 Quick Health Check

1. **Backend Health**: `http://localhost:5000/health`
2. **API Test**: `http://localhost:5000/api`
3. **Frontend**: `http://localhost:3000`

All systems should return successful responses!

## 💡 Tips

- Use Chrome DevTools Network tab to debug API calls
- Check browser console for frontend errors
- Check terminal output for backend errors
- Refresh the page after seeding new data
- Clear browser cache if seeing stale data

## 🆘 Need Help?

Check these files for detailed information:
- `TRANSACTION_ERROR_FIX.md` - Transaction loading issues
- `DATA_SEEDING_GUIDE.md` - Sample data generation
- `docs/TROUBLESHOOTING.md` - Common issues and solutions
