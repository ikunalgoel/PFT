# Environment Variables Configuration Guide

Complete guide to configuring environment variables for the AI Finance Tracker application.

## Overview

The application uses environment variables to configure:
- Database connections
- Authentication settings
- API endpoints
- External service integrations
- Deployment configurations

## Table of Contents

- [Backend Environment Variables](#backend-environment-variables)
- [Frontend Environment Variables](#frontend-environment-variables)
- [GitHub Actions Secrets](#github-actions-secrets)
- [Platform-Specific Variables](#platform-specific-variables)
- [Security Best Practices](#security-best-practices)

---

## Backend Environment Variables

Location: `backend/.env`

### Server Configuration

#### PORT
- **Description**: Port number for the Express server
- **Required**: Yes
- **Default**: `5000`
- **Example**: `PORT=5000`
- **Notes**: 
  - Use `5000` for local development
  - Render uses `PORT` automatically
  - Fly.io uses `8080` internally

#### NODE_ENV
- **Description**: Application environment
- **Required**: Yes
- **Values**: `development`, `production`, `test`
- **Example**: `NODE_ENV=development`
- **Notes**:
  - Affects logging, error handling, and CORS
  - Set to `production` in deployment

### Supabase Configuration

#### SUPABASE_URL
- **Description**: Your Supabase project URL
- **Required**: Yes
- **Format**: `https://[project-id].supabase.co`
- **Example**: `SUPABASE_URL=https://abcdefghijklmnop.supabase.co`
- **How to get**:
  1. Go to [Supabase Dashboard](https://app.supabase.com)
  2. Select your project
  3. Go to Settings → API
  4. Copy "Project URL"
- **Notes**: Do NOT include trailing slash

#### SUPABASE_ANON_KEY
- **Description**: Supabase anonymous/public key
- **Required**: Yes
- **Format**: JWT token (long string starting with `eyJ`)
- **Example**: `SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **How to get**:
  1. Supabase Dashboard → Settings → API
  2. Copy "anon public" key
- **Notes**: 
  - Safe to expose in frontend
  - Used for client-side operations

#### SUPABASE_SERVICE_KEY
- **Description**: Supabase service role key (admin access)
- **Required**: Yes
- **Format**: JWT token (long string starting with `eyJ`)
- **Example**: `SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **How to get**:
  1. Supabase Dashboard → Settings → API
  2. Copy "service_role" key
- **Notes**: 
  - **NEVER expose in frontend**
  - Bypasses Row Level Security
  - Keep strictly confidential

### JWT Configuration

#### JWT_SECRET
- **Description**: Secret key for JWT token signing
- **Required**: Yes
- **Format**: Random string (minimum 32 characters)
- **Example**: `JWT_SECRET=your-super-secret-jwt-key-min-32-chars`
- **How to generate**:
  ```bash
  # Using OpenSSL
  openssl rand -base64 32
  
  # Using Node.js
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- **Notes**:
  - Use different secrets for dev/prod
  - Never commit to Git
  - Rotate periodically

### AI Agent Configuration

#### AI_AGENT_API_KEY
- **Description**: API key for AI insights service
- **Required**: No (optional feature)
- **Format**: API key string
- **Example**: `AI_AGENT_API_KEY=sk-1234567890abcdef`
- **How to get**: Obtain from your AI service provider
- **Notes**:
  - AI insights won't work without this
  - Application functions normally without it
  - Keep confidential

### CORS Configuration

#### FRONTEND_URL
- **Description**: Frontend application URL for CORS
- **Required**: Yes (production)
- **Format**: Full URL without trailing slash
- **Examples**:
  - Development: `FRONTEND_URL=http://localhost:3000`
  - Production: `FRONTEND_URL=https://your-app.netlify.app`
- **Notes**:
  - Must match exactly (including protocol)
  - No trailing slash
  - Update after frontend deployment

### Complete Backend .env Example

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjc1MDQwMCwiZXhwIjoxOTQ4MzI2NDAwfQ.example
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjMyNzUwNDAwLCJleHAiOjE5NDgzMjY0MDB9.example

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long

# AI Agent Configuration (Optional)
AI_AGENT_API_KEY=sk-1234567890abcdef

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

---

## Frontend Environment Variables

Location: `frontend/.env`

**Important**: All frontend environment variables must be prefixed with `VITE_` to be accessible in the application.

### API Configuration

#### VITE_API_URL
- **Description**: Backend API base URL
- **Required**: Yes
- **Format**: Full URL without trailing slash
- **Examples**:
  - Development: `VITE_API_URL=http://localhost:5000`
  - Production: `VITE_API_URL=https://your-backend.onrender.com`
- **Notes**:
  - Must include protocol (http:// or https://)
  - No trailing slash
  - Update after backend deployment

### Supabase Configuration

#### VITE_SUPABASE_URL
- **Description**: Supabase project URL (same as backend)
- **Required**: Yes
- **Format**: `https://[project-id].supabase.co`
- **Example**: `VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co`
- **How to get**: Same as backend `SUPABASE_URL`
- **Notes**: Must match backend configuration

#### VITE_SUPABASE_ANON_KEY
- **Description**: Supabase anonymous key (same as backend)
- **Required**: Yes
- **Format**: JWT token
- **Example**: `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **How to get**: Same as backend `SUPABASE_ANON_KEY`
- **Notes**: 
  - Safe to expose (public key)
  - Must match backend configuration

### Complete Frontend .env Example

```bash
# API Configuration
VITE_API_URL=http://localhost:5000

# Supabase Configuration
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjc1MDQwMCwiZXhwIjoxOTQ4MzI2NDAwfQ.example
```

---

## GitHub Actions Secrets

Location: GitHub Repository → Settings → Secrets and variables → Actions

These secrets are used by CI/CD workflows for automated deployment.

### Required Secrets

#### RENDER_DEPLOY_HOOK_URL
- **Description**: Render deploy webhook URL
- **Required**: Yes (if using Render)
- **Format**: `https://api.render.com/deploy/srv-xxxxx?key=xxxxx`
- **How to get**:
  1. Render Dashboard → Your Service
  2. Settings → Deploy Hook
  3. Copy webhook URL
- **Used in**: `.github/workflows/ci.yml`

#### NETLIFY_DEPLOY_HOOK_URL
- **Description**: Netlify deploy webhook URL
- **Required**: No (optional, for manual triggers)
- **Format**: `https://api.netlify.com/build_hooks/xxxxx`
- **How to get**:
  1. Netlify Dashboard → Site settings
  2. Build & deploy → Build hooks
  3. Add build hook and copy URL
- **Used in**: `.github/workflows/ci.yml`

#### BACKEND_URL
- **Description**: Deployed backend URL for health checks
- **Required**: Yes
- **Format**: `https://your-backend.onrender.com`
- **Example**: `BACKEND_URL=https://ai-finance-tracker.onrender.com`
- **Used in**: CI/CD health check step

#### FRONTEND_URL
- **Description**: Deployed frontend URL for health checks
- **Required**: Yes
- **Format**: `https://your-frontend.netlify.app`
- **Example**: `FRONTEND_URL=https://ai-finance-tracker.netlify.app`
- **Used in**: CI/CD health check step

### Optional Secrets (for enhanced CI/CD)

#### VITE_API_URL
- **Description**: Backend API URL for frontend build
- **Required**: No (can be set in Netlify)
- **Format**: Same as backend URL
- **Example**: `VITE_API_URL=https://your-backend.onrender.com`

#### VITE_SUPABASE_URL
- **Description**: Supabase URL for frontend build
- **Required**: No (can be set in Netlify)
- **Format**: `https://[project-id].supabase.co`

#### VITE_SUPABASE_ANON_KEY
- **Description**: Supabase anon key for frontend build
- **Required**: No (can be set in Netlify)
- **Format**: JWT token

---

## Platform-Specific Variables

### Render Environment Variables

Set in: Render Dashboard → Your Service → Environment

All backend variables listed above, plus:

#### Auto-Generated Variables
- `PORT` - Automatically set by Render
- `RENDER` - Set to `true` by Render
- `RENDER_SERVICE_NAME` - Your service name

### Netlify Environment Variables

Set in: Netlify Dashboard → Site settings → Environment variables

All frontend variables listed above, plus:

#### Build Variables
- `NODE_VERSION` - Set to `18` (in netlify.toml)
- `NPM_VERSION` - Optional, defaults to latest

### Fly.io Secrets

Set using Fly CLI:

```bash
fly secrets set SUPABASE_URL=your_url
fly secrets set SUPABASE_ANON_KEY=your_key
fly secrets set SUPABASE_SERVICE_KEY=your_key
fly secrets set JWT_SECRET=your_secret
fly secrets set AI_AGENT_API_KEY=your_key
fly secrets set FRONTEND_URL=your_frontend_url
```

---

## Security Best Practices

### DO ✅

1. **Use .env files for local development**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Add .env to .gitignore**
   ```gitignore
   .env
   .env.local
   .env.*.local
   ```

3. **Use different values for dev/prod**
   - Different JWT secrets
   - Different database instances
   - Different API keys

4. **Rotate secrets regularly**
   - Change JWT_SECRET periodically
   - Rotate API keys if exposed
   - Update Supabase keys if compromised

5. **Use environment-specific files**
   ```bash
   .env.development
   .env.production
   .env.test
   ```

6. **Validate environment variables on startup**
   ```typescript
   if (!process.env.SUPABASE_URL) {
     throw new Error('SUPABASE_URL is required');
   }
   ```

### DON'T ❌

1. **Never commit .env files to Git**
   - Use .env.example as template
   - Document required variables

2. **Never expose service keys in frontend**
   - Only use SUPABASE_ANON_KEY in frontend
   - Keep SUPABASE_SERVICE_KEY in backend only

3. **Never hardcode secrets in code**
   ```typescript
   // ❌ Bad
   const apiKey = 'sk-1234567890';
   
   // ✅ Good
   const apiKey = process.env.AI_AGENT_API_KEY;
   ```

4. **Never log sensitive values**
   ```typescript
   // ❌ Bad
   console.log('JWT Secret:', process.env.JWT_SECRET);
   
   // ✅ Good
   console.log('JWT Secret configured:', !!process.env.JWT_SECRET);
   ```

5. **Never share .env files**
   - Use secure methods to share secrets
   - Use password managers or secret management tools

---

## Troubleshooting

### Variables Not Loading

**Problem**: Environment variables are undefined

**Solutions**:

1. **Check file location**:
   ```bash
   # Backend
   ls backend/.env
   
   # Frontend
   ls frontend/.env
   ```

2. **Verify variable names**:
   - Frontend variables must start with `VITE_`
   - Check for typos

3. **Restart development server**:
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   npm run dev
   ```

4. **Check .env is not in .gitignore**:
   - .env should be ignored
   - .env.example should be committed

### CORS Errors

**Problem**: Frontend can't connect to backend

**Solutions**:

1. **Verify FRONTEND_URL in backend**:
   ```bash
   echo $FRONTEND_URL
   ```

2. **Check for trailing slashes**:
   ```bash
   # ❌ Wrong
   FRONTEND_URL=http://localhost:3000/
   
   # ✅ Correct
   FRONTEND_URL=http://localhost:3000
   ```

3. **Ensure protocol matches**:
   - Use http:// for local development
   - Use https:// for production

### Database Connection Fails

**Problem**: Can't connect to Supabase

**Solutions**:

1. **Verify Supabase credentials**:
   ```bash
   echo $SUPABASE_URL
   echo $SUPABASE_ANON_KEY
   ```

2. **Check Supabase project status**:
   - Ensure project is not paused
   - Verify credentials are correct

3. **Test connection**:
   ```bash
   curl $SUPABASE_URL/rest/v1/
   ```

---

## Environment Variable Checklist

### Local Development

- [ ] Backend .env created from .env.example
- [ ] Frontend .env created from .env.example
- [ ] Supabase credentials configured
- [ ] JWT_SECRET generated
- [ ] FRONTEND_URL points to localhost:3000
- [ ] VITE_API_URL points to localhost:5000

### Production Deployment

- [ ] Backend variables set in Render/Fly.io
- [ ] Frontend variables set in Netlify
- [ ] Production URLs configured (no localhost)
- [ ] Different JWT_SECRET than development
- [ ] AI_AGENT_API_KEY configured (if using)
- [ ] CORS configured correctly
- [ ] GitHub secrets configured for CI/CD

### Security Review

- [ ] No .env files committed to Git
- [ ] Service keys not exposed in frontend
- [ ] Secrets not logged or displayed
- [ ] Different secrets for dev/prod
- [ ] .env.example updated with new variables

---

## Additional Resources

- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

---

**Last Updated**: January 2024

**Need help?** Check the [Troubleshooting Guide](TROUBLESHOOTING.md) or open an issue on [GitHub](https://github.com/ikunalgoel/PFT/issues)
