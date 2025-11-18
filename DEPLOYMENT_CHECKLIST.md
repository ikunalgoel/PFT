# Deployment Checklist

Use this checklist to ensure a smooth deployment of the AI Finance Tracker application.

## Pre-Deployment

### Database Setup
- [ ] Supabase project created
- [ ] Database schema deployed from `backend/supabase/schema.sql`
- [ ] Row Level Security (RLS) policies enabled
- [ ] Database indexes created
- [ ] Test data added (optional)
- [ ] Database connection tested locally

### Environment Variables Collected
- [ ] `SUPABASE_URL` from Supabase project settings
- [ ] `SUPABASE_ANON_KEY` from Supabase project settings
- [ ] `SUPABASE_SERVICE_KEY` from Supabase project settings
- [ ] `JWT_SECRET` generated (use `openssl rand -base64 32`)
- [ ] `AI_AGENT_API_KEY` obtained (if using AI features)

### Code Preparation
- [ ] All tests passing locally
- [ ] No TypeScript errors
- [ ] Code formatted with Prettier
- [ ] ESLint warnings resolved
- [ ] Build succeeds locally (frontend and backend)
- [ ] `.env` files not committed to Git
- [ ] `.gitignore` properly configured

## Backend Deployment (Render)

### Initial Setup
- [ ] Render account created
- [ ] GitHub repository connected to Render
- [ ] Service created from `render.yaml` blueprint

### Configuration
- [ ] Environment variables set in Render dashboard:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_KEY`
  - [ ] `JWT_SECRET`
  - [ ] `AI_AGENT_API_KEY`
  - [ ] `FRONTEND_URL` (set after frontend deployment)
  - [ ] `NODE_ENV=production`
- [ ] Health check path set to `/health`
- [ ] Auto-deploy enabled for `main` branch

### Deployment
- [ ] Initial deployment triggered
- [ ] Build logs reviewed for errors
- [ ] Deployment successful
- [ ] Backend URL noted (e.g., `https://your-app.onrender.com`)

### Verification
- [ ] Health endpoint accessible: `curl https://your-backend/health`
- [ ] Database connection confirmed in health response
- [ ] API root endpoint works: `curl https://your-backend/api`
- [ ] Logs checked for errors

## Frontend Deployment (Netlify)

### Initial Setup
- [ ] Netlify account created
- [ ] GitHub repository connected to Netlify
- [ ] Site created (auto-detects `netlify.toml`)

### Configuration
- [ ] Build settings verified:
  - [ ] Base directory: `frontend`
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `frontend/dist`
- [ ] Environment variables set in Netlify dashboard:
  - [ ] `VITE_API_URL` (backend URL from Render)
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Auto-deploy enabled for `main` branch

### Deployment
- [ ] Initial deployment triggered
- [ ] Build logs reviewed for errors
- [ ] Deployment successful
- [ ] Frontend URL noted (e.g., `https://your-app.netlify.app`)

### Verification
- [ ] Application loads in browser
- [ ] No console errors
- [ ] Authentication flow works (signup/login)
- [ ] API calls succeed (check Network tab)
- [ ] All pages accessible
- [ ] Routing works (refresh on any page)

## Post-Deployment Configuration

### Update Backend CORS
- [ ] `FRONTEND_URL` environment variable updated in Render
- [ ] Backend redeployed to apply CORS changes
- [ ] CORS verified (no errors in browser console)

### GitHub Actions Setup
- [ ] GitHub secrets configured:
  - [ ] `RENDER_DEPLOY_HOOK_URL`
  - [ ] `NETLIFY_DEPLOY_HOOK_URL` (optional)
  - [ ] `BACKEND_URL`
  - [ ] `FRONTEND_URL`
  - [ ] `VITE_API_URL`
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] CI/CD workflow tested with a push to `main`
- [ ] Automated deployment verified

### Documentation Updates
- [ ] README.md updated with deployment URLs
- [ ] API documentation updated (if applicable)
- [ ] Environment variable examples updated
- [ ] Deployment guides reviewed for accuracy

## Testing in Production

### Authentication
- [ ] User signup works
- [ ] User login works
- [ ] Session persistence works
- [ ] Logout works
- [ ] Protected routes enforce authentication

### Transaction Management
- [ ] Manual transaction creation works
- [ ] CSV upload works
- [ ] Transaction list displays correctly
- [ ] Transaction editing works
- [ ] Transaction deletion works
- [ ] Filtering and sorting work

### Budget Management
- [ ] Budget creation works
- [ ] Budget list displays correctly
- [ ] Budget progress calculates correctly
- [ ] Budget editing works
- [ ] Budget deletion works
- [ ] Alerts trigger at correct thresholds

### Analytics & Visualizations
- [ ] Dashboard loads within 2 seconds
- [ ] Summary cards display correct data
- [ ] Category pie chart renders
- [ ] Trend line chart renders
- [ ] Budget progress chart renders
- [ ] Filters apply correctly
- [ ] Date range selection works

### AI Insights
- [ ] Insights generation works
- [ ] Insights display correctly
- [ ] Export functionality works
- [ ] Caching works (subsequent loads faster)

### Performance
- [ ] Lighthouse score > 80 (Performance)
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] No memory leaks
- [ ] Large datasets (1000+ transactions) perform well

### Mobile Responsiveness
- [ ] Layout adapts to mobile screens
- [ ] Touch interactions work
- [ ] Charts render correctly on mobile
- [ ] Navigation works on mobile
- [ ] Forms usable on mobile

## Monitoring & Maintenance

### Setup Monitoring
- [ ] Render monitoring enabled
- [ ] Netlify analytics enabled (optional)
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Uptime monitoring configured (e.g., UptimeRobot)
- [ ] Log aggregation configured

### Alerts
- [ ] Deployment failure alerts configured
- [ ] Error rate alerts configured
- [ ] Performance degradation alerts configured
- [ ] Uptime alerts configured

### Backup & Recovery
- [ ] Database backup strategy confirmed (Supabase auto-backups)
- [ ] Rollback procedure documented
- [ ] Disaster recovery plan documented

## Security Review

### Application Security
- [ ] HTTPS enabled (automatic with Netlify/Render)
- [ ] Security headers configured (in `netlify.toml`)
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified

### Secrets Management
- [ ] No secrets in Git history
- [ ] Environment variables properly secured
- [ ] API keys rotated if exposed
- [ ] Access tokens have minimal permissions

### Compliance
- [ ] Privacy policy added (if collecting user data)
- [ ] Terms of service added (if applicable)
- [ ] GDPR compliance reviewed (if applicable)
- [ ] Data retention policy defined

## Launch

### Soft Launch
- [ ] Share with small group of beta testers
- [ ] Collect feedback
- [ ] Monitor for errors
- [ ] Fix critical issues

### Public Launch
- [ ] Announce on social media
- [ ] Update GitHub repository description
- [ ] Add project to portfolio
- [ ] Submit to relevant directories (if applicable)

### Post-Launch
- [ ] Monitor logs for first 24 hours
- [ ] Respond to user feedback
- [ ] Fix bugs as they arise
- [ ] Plan feature updates

## Ongoing Maintenance

### Weekly
- [ ] Review error logs
- [ ] Check uptime metrics
- [ ] Monitor performance metrics
- [ ] Review user feedback

### Monthly
- [ ] Update dependencies
- [ ] Run security audit
- [ ] Review and optimize database queries
- [ ] Check for outdated packages

### Quarterly
- [ ] Review and update documentation
- [ ] Conduct security review
- [ ] Optimize performance
- [ ] Plan new features

## Rollback Procedure

If deployment fails or critical issues arise:

### Render Rollback
1. Go to Render dashboard → Deploys
2. Find last working deployment
3. Click "Rollback to this version"

### Netlify Rollback
1. Go to Netlify dashboard → Deploys
2. Find last working deployment
3. Click "Publish deploy"

### Database Rollback
1. Contact Supabase support for backup restoration
2. Or manually revert schema changes if recent

## Support Resources

- **Render**: https://render.com/docs
- **Netlify**: https://docs.netlify.com
- **Supabase**: https://supabase.com/docs
- **GitHub Actions**: https://docs.github.com/en/actions
- **Project Issues**: https://github.com/YOUR_USERNAME/YOUR_REPO/issues

## Notes

- Keep this checklist updated as deployment process evolves
- Document any issues encountered and solutions
- Share learnings with team
- Celebrate successful deployment! 🎉
