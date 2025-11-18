# Frontend Deployment Guide (Netlify)

This guide walks you through deploying the AI Finance Tracker frontend to Netlify.

## Prerequisites

- GitHub account with this repository
- Netlify account (free tier works)
- Supabase project set up
- Backend API deployed and accessible

## Deployment Steps

### 1. Connect Repository to Netlify

1. Log in to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize Netlify to access your repositories
4. Select your `ai-finance-tracker` repository

### 2. Configure Build Settings

Netlify should auto-detect the settings from `netlify.toml`, but verify:

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`
- **Node version**: 18

### 3. Set Environment Variables

In Netlify dashboard, go to **Site settings** → **Environment variables** and add:

| Variable Name | Description | Example Value |
|--------------|-------------|---------------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.onrender.com` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

**Important**: 
- Do NOT include trailing slashes in URLs
- Use the production backend URL, not localhost
- Get Supabase credentials from your Supabase project settings

### 4. Deploy

1. Click "Deploy site"
2. Netlify will build and deploy your application
3. Monitor the deploy logs for any errors
4. Once complete, you'll get a URL like `https://random-name-123.netlify.app`

### 5. Configure Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Follow instructions to configure DNS

### 6. Enable Automatic Deployments

By default, Netlify automatically deploys when you push to the `main` branch.

To configure:
1. Go to **Site settings** → **Build & deploy** → **Continuous deployment**
2. Verify "Branch deploys" is set to `main`
3. Enable "Auto publishing"

## Verify Deployment

After deployment, test the following:

1. **Application loads**: Visit your Netlify URL
2. **Authentication works**: Try signing up/logging in
3. **API connectivity**: Check browser console for API errors
4. **Environment variables**: Verify API calls go to production backend
5. **Routing works**: Navigate between pages and refresh

## Troubleshooting

### Build Fails

- Check build logs in Netlify dashboard
- Verify all dependencies are in `package.json`
- Ensure TypeScript compiles without errors locally

### Blank Page After Deploy

- Check browser console for errors
- Verify environment variables are set correctly
- Ensure `netlify.toml` redirect rule is present

### API Calls Fail

- Verify `VITE_API_URL` points to deployed backend
- Check CORS settings in backend allow Netlify domain
- Ensure backend is running and accessible

### Authentication Issues

- Verify Supabase credentials are correct
- Check Supabase dashboard for authentication settings
- Ensure Supabase URL doesn't have trailing slash

## Rollback

If a deployment breaks production:

1. Go to **Deploys** in Netlify dashboard
2. Find a working previous deploy
3. Click "Publish deploy" to rollback

## Monitoring

- **Deploy notifications**: Configure in **Site settings** → **Build & deploy** → **Deploy notifications**
- **Analytics**: Enable Netlify Analytics for traffic insights
- **Logs**: View real-time function logs in dashboard

## Security Best Practices

- Never commit `.env` files to Git
- Rotate Supabase keys if exposed
- Use Netlify's environment variable encryption
- Enable HTTPS (automatic with Netlify)
- Review security headers in `netlify.toml`

## Cost Considerations

Netlify free tier includes:
- 100 GB bandwidth/month
- 300 build minutes/month
- Automatic HTTPS
- Continuous deployment

Upgrade if you exceed these limits.

## Support

- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Community](https://answers.netlify.com)
- Check project README for application-specific issues
