# Troubleshooting Guide

Common issues and solutions for the AI Finance Tracker application.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Authentication Problems](#authentication-problems)
- [Database Connection Issues](#database-connection-issues)
- [API Errors](#api-errors)
- [Frontend Issues](#frontend-issues)
- [CSV Upload Problems](#csv-upload-problems)
- [Deployment Issues](#deployment-issues)
- [Performance Problems](#performance-problems)
- [AI Insights Issues](#ai-insights-issues)

---

## Installation Issues

### npm install fails

**Symptoms**: Error messages during `npm install`

**Solutions**:

1. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Node version**:
   ```bash
   node --version  # Should be 18.x or higher
   ```
   
   If wrong version, install Node 18+:
   - Using nvm: `nvm install 18 && nvm use 18`
   - Download from: https://nodejs.org

4. **Check for permission errors**:
   - On Mac/Linux: Use `sudo npm install` (not recommended) or fix permissions
   - On Windows: Run terminal as Administrator

### TypeScript compilation errors

**Symptoms**: `tsc` command fails with type errors

**Solutions**:

1. **Ensure TypeScript is installed**:
   ```bash
   npm install -g typescript
   ```

2. **Check tsconfig.json exists**:
   ```bash
   ls tsconfig.json
   ```

3. **Clean build directory**:
   ```bash
   rm -rf dist
   npm run build
   ```

4. **Update TypeScript**:
   ```bash
   npm install typescript@latest --save-dev
   ```

---

## Authentication Problems

### Cannot sign up

**Symptoms**: Signup form submits but no account created

**Solutions**:

1. **Check Supabase email settings**:
   - Go to Supabase Dashboard → Authentication → Email Templates
   - Ensure "Confirm signup" is enabled
   - Check spam folder for confirmation email

2. **Verify Supabase URL and keys**:
   ```bash
   # Frontend .env
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   ```

3. **Check browser console**:
   - Open DevTools (F12)
   - Look for error messages
   - Verify API calls are reaching backend

4. **Disable email confirmation** (development only):
   - Supabase Dashboard → Authentication → Settings
   - Disable "Enable email confirmations"

### Cannot log in

**Symptoms**: Login form shows error or doesn't respond

**Solutions**:

1. **Verify credentials**:
   - Check email and password are correct
   - Try password reset if forgotten

2. **Check Supabase authentication**:
   - Go to Supabase Dashboard → Authentication → Users
   - Verify user exists
   - Check if email is confirmed

3. **Clear browser storage**:
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

4. **Check for CORS errors**:
   - Open browser DevTools → Network tab
   - Look for failed requests with CORS errors
   - Verify `FRONTEND_URL` is set correctly in backend

### Session expires immediately

**Symptoms**: Logged out right after logging in

**Solutions**:

1. **Check JWT configuration**:
   ```bash
   # Backend .env
   echo $JWT_SECRET
   ```

2. **Verify Supabase JWT settings**:
   - Supabase Dashboard → Settings → API
   - Check JWT expiry time

3. **Clear cookies and storage**:
   - Browser settings → Clear browsing data
   - Select cookies and cached files

4. **Check system time**:
   - Ensure computer clock is accurate
   - JWT validation depends on correct time

---

## Database Connection Issues

### "Database connection failed"

**Symptoms**: Health check shows database not connected

**Solutions**:

1. **Verify Supabase credentials**:
   ```bash
   # Backend .env
   echo $SUPABASE_URL
   echo $SUPABASE_SERVICE_KEY
   ```

2. **Check Supabase project status**:
   - Go to Supabase Dashboard
   - Ensure project is not paused
   - Check for any service disruptions

3. **Test connection locally**:
   ```bash
   cd backend
   npm run dev
   curl http://localhost:5000/health
   ```

4. **Verify database schema**:
   ```bash
   # Check if tables exist in Supabase Dashboard → Table Editor
   ```

5. **Check network connectivity**:
   ```bash
   ping your-project.supabase.co
   ```

### "Row Level Security policy violation"

**Symptoms**: Database queries fail with RLS error

**Solutions**:

1. **Verify RLS policies are set up**:
   - Supabase Dashboard → Authentication → Policies
   - Ensure policies exist for all tables

2. **Check user authentication**:
   - Verify JWT token is being sent
   - Check token is valid and not expired

3. **Review policy SQL**:
   ```sql
   -- Example policy for transactions table
   CREATE POLICY "Users can view own transactions"
   ON transactions FOR SELECT
   USING (auth.uid() = user_id);
   ```

4. **Temporarily disable RLS** (development only):
   ```sql
   ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
   ```

---

## API Errors

### 401 Unauthorized

**Symptoms**: API requests return 401 status

**Solutions**:

1. **Check authentication token**:
   ```javascript
   // In browser console
   console.log(localStorage.getItem('supabase.auth.token'));
   ```

2. **Verify Authorization header**:
   - Open DevTools → Network tab
   - Check request headers include: `Authorization: Bearer <token>`

3. **Re-authenticate**:
   - Log out and log back in
   - Token may have expired

4. **Check backend auth middleware**:
   ```bash
   # Backend logs should show authentication attempts
   ```

### 404 Not Found

**Symptoms**: API endpoints return 404

**Solutions**:

1. **Verify API URL**:
   ```bash
   # Frontend .env
   echo $VITE_API_URL
   ```

2. **Check endpoint path**:
   - Ensure path matches backend routes
   - Example: `/api/transactions` not `/transactions`

3. **Verify backend is running**:
   ```bash
   curl http://localhost:5000/health
   ```

4. **Check for typos in URL**:
   - Review axios configuration
   - Check route definitions in backend

### 500 Internal Server Error

**Symptoms**: API requests fail with 500 status

**Solutions**:

1. **Check backend logs**:
   ```bash
   # Local development
   cd backend
   npm run dev
   
   # Production (Render)
   # Check logs in Render dashboard
   ```

2. **Verify environment variables**:
   ```bash
   # Backend .env
   cat .env
   ```

3. **Check database connection**:
   ```bash
   curl http://localhost:5000/health
   ```

4. **Review error details**:
   - Check response body for error message
   - Look for stack traces in logs

### Rate limit exceeded

**Symptoms**: "Too many requests" error

**Solutions**:

1. **Wait before retrying**:
   - Standard endpoints: Wait 15 minutes
   - CSV upload: Wait 15 minutes
   - AI insights: Wait 15 minutes

2. **Reduce request frequency**:
   - Implement client-side caching
   - Batch operations when possible

3. **Check for infinite loops**:
   - Review code for repeated API calls
   - Check useEffect dependencies

---

## Frontend Issues

### Blank page after deployment

**Symptoms**: Application loads but shows blank page

**Solutions**:

1. **Check browser console**:
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Check for failed resource loads

2. **Verify environment variables**:
   ```bash
   # Netlify dashboard → Site settings → Environment variables
   VITE_API_URL=https://your-backend.onrender.com
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_key
   ```

3. **Check build output**:
   ```bash
   cd frontend
   npm run build
   # Check dist/ directory exists and contains files
   ```

4. **Verify routing configuration**:
   - Check `netlify.toml` has redirect rules
   - Ensure `_redirects` file exists if using

### Charts not rendering

**Symptoms**: Dashboard loads but charts are empty or missing

**Solutions**:

1. **Check data is loading**:
   - Open DevTools → Network tab
   - Verify analytics API calls succeed
   - Check response contains data

2. **Verify Recharts installation**:
   ```bash
   cd frontend
   npm list recharts
   ```

3. **Check for console errors**:
   - Look for Recharts-related errors
   - Verify data format matches chart expectations

4. **Test with sample data**:
   - Add console.log to see data structure
   - Verify data is not empty array

### Styles not loading

**Symptoms**: Application loads but looks unstyled

**Solutions**:

1. **Verify Tailwind CSS is configured**:
   ```bash
   # Check files exist
   ls tailwind.config.js
   ls postcss.config.js
   ```

2. **Check CSS import**:
   ```javascript
   // In main.tsx or App.tsx
   import './index.css';
   ```

3. **Rebuild application**:
   ```bash
   cd frontend
   rm -rf dist node_modules
   npm install
   npm run build
   ```

4. **Check for CSS conflicts**:
   - Review browser DevTools → Elements
   - Check computed styles

---

## CSV Upload Problems

### "Invalid CSV format"

**Symptoms**: CSV upload fails with format error

**Solutions**:

1. **Verify CSV structure**:
   ```csv
   date,amount,category
   2024-01-15,45.50,Groceries
   ```

2. **Check required columns**:
   - Must have: `date`, `amount`, `category`
   - Optional: `merchant`, `notes`

3. **Validate date format**:
   - Must be YYYY-MM-DD
   - Wrong: `01/15/2024`
   - Right: `2024-01-15`

4. **Check amount format**:
   - Must be positive number
   - No currency symbols: `45.50` not `$45.50`
   - Use period for decimal: `45.50` not `45,50`

5. **Review CSV Upload Guide**:
   - See [CSV_UPLOAD.md](CSV_UPLOAD.md) for detailed format

### Some transactions not imported

**Symptoms**: CSV uploads but fewer transactions than expected

**Solutions**:

1. **Check for validation errors**:
   - Review upload response for error messages
   - Look for rows with invalid data

2. **Verify all rows have required fields**:
   - No empty date, amount, or category fields
   - Check for extra blank rows

3. **Check for duplicates**:
   - Application may skip duplicate transactions
   - Review existing transactions

4. **Review backend logs**:
   - Check for validation failures
   - Look for database errors

### Upload times out

**Symptoms**: Large CSV upload never completes

**Solutions**:

1. **Reduce file size**:
   - Split into smaller files (< 1000 transactions each)
   - Upload in batches

2. **Check file size limit**:
   - Maximum 5MB per file
   - Maximum 10,000 transactions per upload

3. **Verify network connection**:
   - Ensure stable internet connection
   - Try again with better connection

4. **Check rate limits**:
   - Maximum 10 uploads per 15 minutes
   - Wait before retrying

---

## Deployment Issues

### Build fails on Netlify

**Symptoms**: Netlify build fails with errors

**Solutions**:

1. **Check build logs**:
   - Netlify dashboard → Deploys → Failed deploy → View logs

2. **Verify build command**:
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "frontend/dist"
   ```

3. **Check Node version**:
   ```toml
   # netlify.toml
   [build.environment]
     NODE_VERSION = "18"
   ```

4. **Test build locally**:
   ```bash
   cd frontend
   npm run build
   ```

5. **Verify environment variables**:
   - Check all required variables are set in Netlify

### Backend deployment fails on Render

**Symptoms**: Render deployment fails or service won't start

**Solutions**:

1. **Check Render logs**:
   - Render dashboard → Logs tab

2. **Verify render.yaml configuration**:
   ```yaml
   services:
     - type: web
       name: ai-finance-tracker-backend
       env: node
       buildCommand: cd backend && npm install && npm run build
       startCommand: cd backend && npm start
   ```

3. **Check environment variables**:
   - Verify all required variables are set
   - No trailing slashes in URLs

4. **Test build locally**:
   ```bash
   cd backend
   npm run build
   npm start
   ```

5. **Verify health check**:
   - Ensure `/health` endpoint responds
   - Check health check path in Render settings

### CORS errors in production

**Symptoms**: Frontend can't connect to backend API

**Solutions**:

1. **Verify FRONTEND_URL**:
   ```bash
   # Backend environment variable
   FRONTEND_URL=https://your-app.netlify.app
   ```

2. **Check for trailing slashes**:
   - Remove trailing slashes from URLs
   - `https://app.com` not `https://app.com/`

3. **Verify CORS configuration**:
   ```typescript
   // backend/src/index.ts
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }));
   ```

4. **Check browser console**:
   - Look for specific CORS error messages
   - Verify request headers

---

## Performance Problems

### Dashboard loads slowly

**Symptoms**: Dashboard takes > 5 seconds to load

**Solutions**:

1. **Check network requests**:
   - Open DevTools → Network tab
   - Identify slow API calls
   - Look for failed requests

2. **Verify data volume**:
   - Large transaction counts may slow queries
   - Consider pagination or date range filters

3. **Check database indexes**:
   ```sql
   -- Verify indexes exist
   SELECT * FROM pg_indexes WHERE tablename = 'transactions';
   ```

4. **Enable caching**:
   - Analytics data is cached for 5 minutes
   - Use React Query caching effectively

5. **Optimize queries**:
   - Add date range filters
   - Limit result sets

### Charts render slowly

**Symptoms**: Charts take long time to appear

**Solutions**:

1. **Reduce data points**:
   - Aggregate data before charting
   - Use weekly/monthly instead of daily

2. **Implement lazy loading**:
   ```javascript
   const Chart = lazy(() => import('./Chart'));
   ```

3. **Check data processing**:
   - Move heavy calculations to backend
   - Use memoization for expensive operations

4. **Optimize Recharts**:
   - Reduce animation duration
   - Simplify chart configurations

---

## AI Insights Issues

### "AI service unavailable"

**Symptoms**: AI insights generation fails

**Solutions**:

1. **Check AI_AGENT_API_KEY**:
   ```bash
   # Backend .env
   echo $AI_AGENT_API_KEY
   ```

2. **Verify API key is valid**:
   - Check key hasn't expired
   - Verify key has correct permissions

3. **Check rate limits**:
   - AI insights limited to 5 requests per 15 minutes
   - Wait before retrying

4. **Review backend logs**:
   - Look for AI service error messages
   - Check for network timeouts

### Insights are generic or unhelpful

**Symptoms**: AI generates vague insights

**Solutions**:

1. **Add more transaction data**:
   - AI needs sufficient data for analysis
   - Minimum 20-30 transactions recommended

2. **Ensure data quality**:
   - Use consistent categories
   - Add merchant information
   - Include descriptive notes

3. **Try different date ranges**:
   - Monthly periods work best
   - Avoid very short periods (< 1 week)

4. **Check prompt engineering**:
   - Review AIInsightsService prompt construction
   - Ensure analytics data is complete

### Insights generation times out

**Symptoms**: Insights request never completes

**Solutions**:

1. **Reduce date range**:
   - Try shorter periods (1 month instead of 1 year)
   - AI processing time increases with data volume

2. **Check backend timeout settings**:
   ```typescript
   // Increase timeout if needed
   axios.timeout = 60000; // 60 seconds
   ```

3. **Verify AI service status**:
   - Check if AI service is operational
   - Review service status page

4. **Try again later**:
   - Service may be temporarily overloaded
   - Wait and retry

---

## Getting More Help

### Check Documentation

- [README.md](../README.md) - Project overview and setup
- [API.md](API.md) - Complete API reference
- [CSV_UPLOAD.md](CSV_UPLOAD.md) - CSV format guide
- [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) - Deployment steps

### Review Logs

**Frontend (Browser)**:
```javascript
// Open browser console (F12)
// Check for errors and warnings
```

**Backend (Local)**:
```bash
cd backend
npm run dev
# Watch console output
```

**Backend (Production)**:
- Render: Dashboard → Logs tab
- Fly.io: `fly logs`

### Check GitHub Issues

Search existing issues: https://github.com/ikunalgoel/PFT/issues

### Create New Issue

If problem persists:

1. Go to https://github.com/ikunalgoel/PFT/issues/new
2. Provide:
   - Clear description of problem
   - Steps to reproduce
   - Error messages
   - Environment (OS, browser, Node version)
   - Screenshots if applicable

### Community Support

- Check project discussions
- Review closed issues for solutions
- Ask questions in project forums

---

## Preventive Measures

### Regular Maintenance

1. **Update dependencies monthly**:
   ```bash
   npm update
   npm audit fix
   ```

2. **Monitor logs regularly**:
   - Check for recurring errors
   - Watch for performance issues

3. **Backup database**:
   - Supabase provides automatic backups
   - Export data periodically

4. **Test after updates**:
   - Run tests after dependency updates
   - Verify core functionality works

### Best Practices

1. **Use environment variables**:
   - Never commit secrets to Git
   - Use `.env.example` as template

2. **Follow CSV format**:
   - Validate CSV before upload
   - Use provided templates

3. **Monitor rate limits**:
   - Implement client-side throttling
   - Cache data when possible

4. **Keep documentation updated**:
   - Document custom configurations
   - Note any workarounds used

---

**Last Updated**: January 2024

**Need more help?** Open an issue on [GitHub](https://github.com/ikunalgoel/PFT/issues)
