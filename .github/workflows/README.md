# GitHub Actions CI/CD Workflows

This directory contains automated workflows for continuous integration and deployment.

## Workflows Overview

### 1. CI/CD Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Backend Tests
- Checkout code
- Install dependencies
- Run ESLint
- Run unit tests
- Build TypeScript
- Upload build artifacts

#### Frontend Tests
- Checkout code
- Install dependencies
- Run ESLint
- Build application
- Upload build artifacts

#### Deploy Backend (main branch only)
- Trigger Render deployment via webhook
- Wait for deployment
- Run health check

#### Deploy Frontend (main branch only)
- Trigger Netlify deployment (or rely on auto-deploy)

#### Notify
- Send deployment status notification

### 2. Pull Request Checks (`pr-checks.yml`)

**Triggers:**
- Pull request opened, synchronized, or reopened

**Jobs:**

#### Code Quality
- Check code formatting with Prettier
- Comment on PR if formatting issues found

#### Backend Checks
- Lint check
- TypeScript type check
- Run tests
- Test build

#### Frontend Checks
- Lint check
- TypeScript type check
- Test build

#### Security Audit
- Run `npm audit` on backend
- Run `npm audit` on frontend

#### PR Summary
- Generate summary comment with all check results

### 3. Dependency Updates (`dependency-update.yml`)

**Triggers:**
- Weekly schedule (Monday 9 AM UTC)
- Manual trigger via workflow_dispatch

**Jobs:**
- Check outdated dependencies
- Run security audit
- Generate summary report

## Setup Instructions

### 1. Required GitHub Secrets

Configure these in **Settings** → **Secrets and variables** → **Actions**:

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `RENDER_DEPLOY_HOOK_URL` | Render deploy webhook URL | Backend deployment |
| `NETLIFY_DEPLOY_HOOK_URL` | Netlify deploy webhook URL | Frontend deployment (optional) |
| `BACKEND_URL` | Deployed backend URL | Health checks |
| `FRONTEND_URL` | Deployed frontend URL | Notifications |
| `VITE_API_URL` | Backend API URL | Frontend build |
| `VITE_SUPABASE_URL` | Supabase project URL | Frontend build |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Frontend build |

### 2. Get Render Deploy Hook

1. Go to your Render service dashboard
2. Navigate to **Settings** → **Deploy Hook**
3. Copy the webhook URL
4. Add as `RENDER_DEPLOY_HOOK_URL` secret in GitHub

### 3. Get Netlify Deploy Hook (Optional)

1. Go to Netlify site settings
2. Navigate to **Build & deploy** → **Build hooks**
3. Create a new build hook
4. Copy the webhook URL
5. Add as `NETLIFY_DEPLOY_HOOK_URL` secret in GitHub

**Note:** Netlify auto-deploys via GitHub integration, so this is optional.

### 4. Configure Branch Protection

Recommended settings for `main` branch:

1. Go to **Settings** → **Branches** → **Branch protection rules**
2. Add rule for `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Select: `Backend Tests`, `Frontend Tests`, `Backend Checks`, `Frontend Checks`
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging

## Workflow Behavior

### On Pull Request

1. **PR Checks workflow** runs automatically
2. Code quality, linting, type checking, and tests run
3. Security audit checks for vulnerabilities
4. Summary comment posted on PR with results
5. All checks must pass before merge

### On Push to Main

1. **CI/CD Pipeline workflow** runs
2. Backend and frontend tests run
3. If tests pass, deployments trigger:
   - Backend deploys to Render
   - Frontend deploys to Netlify
4. Health checks verify deployment
5. Notification sent with deployment status

### Weekly Dependency Check

1. **Dependency Updates workflow** runs every Monday
2. Checks for outdated packages
3. Runs security audit
4. Results available in workflow summary

## Monitoring Workflows

### View Workflow Runs

1. Go to **Actions** tab in GitHub repository
2. Select workflow from left sidebar
3. View run history and logs

### Workflow Status Badge

Add to README.md:

```markdown
![CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI%2FCD%20Pipeline/badge.svg)
```

### Email Notifications

Configure in **Settings** → **Notifications**:
- Workflow run failures
- Deployment status

## Troubleshooting

### Workflow Fails on Tests

**Check:**
- Test logs in workflow run
- Ensure tests pass locally: `npm run test`
- Verify all dependencies are in `package.json`

### Deployment Fails

**Check:**
- Deploy hook URLs are correct
- Secrets are set properly
- Backend health check endpoint is accessible
- Render/Netlify service is running

### Build Fails

**Check:**
- TypeScript compilation errors
- Missing environment variables
- Node version compatibility (should be 18)

### Health Check Timeout

**Possible causes:**
- Backend taking too long to start (Render free tier cold start)
- Health endpoint not responding
- Incorrect `BACKEND_URL` secret

**Solutions:**
- Increase wait time in workflow
- Check Render logs
- Verify health endpoint works: `curl https://your-backend/health`

## Manual Deployment

### Trigger Deployment Manually

1. Go to **Actions** tab
2. Select **CI/CD Pipeline** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

### Skip CI

Add `[skip ci]` to commit message to skip workflow:

```bash
git commit -m "Update README [skip ci]"
```

## Best Practices

1. **Always run tests locally** before pushing
2. **Keep secrets secure** - never commit them
3. **Monitor workflow runs** for failures
4. **Update dependencies regularly** to avoid security issues
5. **Use pull requests** for all changes to main
6. **Review workflow logs** when deployments fail
7. **Test deployment process** in a staging environment first

## Customization

### Add New Workflow

1. Create new `.yml` file in `.github/workflows/`
2. Define triggers, jobs, and steps
3. Commit and push to repository

### Modify Existing Workflow

1. Edit workflow file
2. Test changes on a feature branch first
3. Merge to main after verification

### Add Deployment Notifications

Integrate with:
- Slack: Use `slack-notify` action
- Discord: Use `discord-webhook` action
- Email: Use `send-email` action

Example Slack notification:

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Cost Considerations

GitHub Actions free tier includes:
- 2,000 minutes/month for private repos
- Unlimited for public repos

Each workflow run consumes minutes based on:
- Runner type (Linux, Windows, macOS)
- Job duration

Monitor usage in **Settings** → **Billing**.

## Security

- **Secrets are encrypted** and not exposed in logs
- **Use least privilege** for access tokens
- **Rotate secrets regularly**
- **Review workflow permissions** in workflow file
- **Enable branch protection** to prevent unauthorized changes

## Support

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Community Forum](https://github.community/c/actions)
