# Deployment Guide - AI Finance Tracker

This guide covers deploying the AI Finance Tracker application with the new AI integration and multi-currency features.

## 🚀 Quick Deployment Checklist

### Prerequisites
- [ ] Supabase project created and configured
- [ ] OpenAI or Anthropic API key obtained
- [ ] GitHub repository pushed with latest changes
- [ ] Deployment platform account (Render/Fly.io/Railway)

### Backend Deployment

#### 1. Environment Variables

Set these environment variables in your deployment platform:

```env
# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.netlify.app

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_here

# AI/LLM Configuration (REQUIRED for AI features)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview

# Alternative: Use Anthropic
# AI_PROVIDER=anthropic
# ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
# ANTHROPIC_MODEL=claude-3-sonnet-20240229

# AI Model Settings (Optional)
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
AI_TIMEOUT=30000
```

#### 2. Database Setup

Run the database migrations in Supabase SQL Editor:

```sql
-- Run the schema from backend/supabase/schema.sql
-- This includes the new settings table and updated types
```

#### 3. Deploy Backend

**Option A: Render.com**
1. Connect your GitHub repository
2. Select "Web Service"
3. Build Command: `cd backend && npm install && npm run build`
4. Start Command: `cd backend && npm start`
5. Add all environment variables
6. Deploy

**Option B: Fly.io**
```bash
cd backend
fly launch
fly secrets set OPENAI_API_KEY=sk-...
fly secrets set SUPABASE_URL=https://...
# ... set all other secrets
fly deploy
```

**Option C: Railway**
1. Connect GitHub repository
2. Select backend directory
3. Add environment variables
4. Deploy automatically

### Frontend Deployment

#### 1. Environment Variables

Create `.env.production` in frontend directory:

```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 2. Build and Deploy

**Option A: Netlify**
```bash
cd frontend
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

Or connect GitHub repository in Netlify dashboard:
- Build command: `cd frontend && npm install && npm run build`
- Publish directory: `frontend/dist`
- Add environment variables

**Option B: Vercel**
```bash
cd frontend
vercel --prod
```

**Option C: Cloudflare Pages**
1. Connect GitHub repository
2. Build command: `cd frontend && npm install && npm run build`
3. Build output directory: `frontend/dist`
4. Add environment variables

## 🔧 Post-Deployment Configuration

### 1. Update Supabase Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:

Add your production URLs:
```
https://your-app.netlify.app
https://your-app.netlify.app/**
```

### 2. Update CORS Settings

Ensure your backend allows requests from your frontend domain.

### 3. Test AI Integration

```bash
# Test the generate-insights endpoint
curl -X POST https://your-backend-url/api/insights/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }'
```

### 4. Verify Settings API

```bash
# Get user settings
curl https://your-backend-url/api/settings \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update currency
curl -X PUT https://your-backend-url/api/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currency": "INR"}'
```

## 📊 Monitoring & Maintenance

### Health Checks

Monitor these endpoints:
- Backend: `https://your-backend-url/health`
- Frontend: Check if app loads and authenticates

### AI Usage Monitoring

1. **OpenAI Dashboard**: https://platform.openai.com/usage
   - Monitor API usage and costs
   - Set up usage alerts

2. **Anthropic Dashboard**: https://console.anthropic.com/
   - Track API requests
   - Monitor rate limits

### Cost Optimization

The application includes several cost optimization features:
- 24-hour caching for AI insights
- Retry logic to prevent duplicate requests
- Rate limiting on AI endpoints

**Recommended Limits:**
- Set OpenAI monthly budget limit
- Implement per-user rate limiting (already included)
- Monitor cache hit rates

### Logs and Debugging

**Backend Logs:**
```bash
# Render
render logs -t backend-service

# Fly.io
fly logs

# Railway
railway logs
```

**Frontend Logs:**
- Check browser console
- Monitor Netlify/Vercel function logs

## 🔒 Security Checklist

- [ ] All API keys stored as environment variables (never in code)
- [ ] JWT_SECRET is strong and unique
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] HTTPS enforced on all endpoints
- [ ] Supabase RLS policies enabled
- [ ] API keys have appropriate permissions only

## 🧪 Testing Production

### 1. Authentication Flow
- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Sign out
- [ ] Password reset (if implemented)

### 2. Core Features
- [ ] Create transaction
- [ ] Upload CSV
- [ ] Create budget
- [ ] View analytics
- [ ] Change currency in settings
- [ ] Generate AI insights

### 3. AI Features
- [ ] Generate insights for a period
- [ ] View latest insights
- [ ] Verify currency appears in insights
- [ ] Check insights are cached (second request faster)

### 4. Mobile Responsiveness
- [ ] Test on mobile device
- [ ] Check all pages render correctly
- [ ] Verify touch interactions work

## 🚨 Troubleshooting

### AI Insights Not Generating

**Error: "Missing API key"**
- Verify `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set
- Check `AI_PROVIDER` matches your key type

**Error: "Rate limit exceeded"**
- Check your OpenAI/Anthropic dashboard
- Verify you haven't exceeded quota
- Wait and retry

**Error: "Timeout"**
- Increase `AI_TIMEOUT` value
- Check network connectivity
- Verify API service status

### Settings Not Saving

**Error: "Settings table does not exist"**
- Run database migrations
- Verify `user_settings` table exists in Supabase

**Currency not updating**
- Check browser console for errors
- Verify API endpoint is accessible
- Check authentication token is valid

### CORS Errors

- Verify `FRONTEND_URL` environment variable is correct
- Check CORS middleware configuration
- Ensure frontend URL matches exactly (no trailing slash)

## 📈 Scaling Considerations

### Database
- Monitor Supabase usage
- Consider upgrading plan if needed
- Set up database backups

### Backend
- Scale horizontally if needed
- Monitor response times
- Consider caching layer (Redis) for high traffic

### AI Costs
- Monitor daily/monthly AI API costs
- Adjust caching TTL if needed
- Consider implementing user quotas

## 🔄 Continuous Deployment

### GitHub Actions (Already Configured)

The repository includes CI/CD workflows:
- `.github/workflows/ci.yml` - Run tests on PR
- `.github/workflows/pr-checks.yml` - Code quality checks

### Automatic Deployments

**Netlify:**
- Automatically deploys on push to main
- Preview deployments for PRs

**Render:**
- Auto-deploy on push to main
- Manual deploy option available

**Fly.io:**
```bash
# Set up auto-deploy
fly deploy --auto-confirm
```

## 📚 Additional Resources

- [Backend API Documentation](./docs/API.md)
- [AI Integration Guide](./backend/AI_INTEGRATION.md)
- [Environment Variables Guide](./docs/ENVIRONMENT_VARIABLES.md)
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)

## 🎉 Deployment Complete!

Once deployed, your application will have:
- ✅ Real AI-powered financial insights
- ✅ Multi-currency support (GBP, INR)
- ✅ User settings management
- ✅ Comprehensive error handling
- ✅ Production-ready performance
- ✅ Secure authentication
- ✅ Mobile-responsive UI

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review application logs
3. Verify all environment variables are set
4. Check API service status pages
5. Review the documentation in `/docs`

---

**Last Updated:** $(date)
**Version:** 2.0.0 (AI Integration Release)
