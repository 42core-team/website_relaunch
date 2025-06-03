# GitHub Environments Setup

This guide explains how to set up and use GitHub Environments to track deployments and see active environments in the GitHub UI.

## What are GitHub Environments?

GitHub Environments allow you to:
- 📍 **Track active deployments** in the repository sidebar
- 🔗 **See environment URLs** and access deployed applications
- 🛡️ **Set protection rules** (require reviews, restrict branches)
- 📊 **View deployment history** and status
- 🔐 **Manage environment-specific secrets**

## Quick Setup

### 1. Run the Setup Workflow

1. Go to **Actions** → **Setup GitHub Environments**
2. Click **"Run workflow"**
3. Wait for completion

This will automatically create the three environments: `prod`, `beta`, and `dev`.

### 2. Manual Setup (Alternative)

If you prefer manual setup:

1. Go to **Settings** → **Environments**
2. Click **"New environment"**
3. Create these environments:

#### Production Environment (`prod`)
- **Name**: `prod`
- **Deployment branches**: Only protected branches (main)
- **Environment secrets**: Add production secrets
- **Reviewers**: Add team members who can approve production deployments

#### Beta Environment (`beta`)
- **Name**: `beta`
- **Deployment branches**: Selected branches → `dev`
- **Environment secrets**: Add staging secrets
- **Reviewers**: Optional (1 reviewer recommended)

#### Development Environment (`dev`)
- **Name**: `dev`
- **Deployment branches**: All branches
- **Environment secrets**: Add development secrets
- **Reviewers**: None (automatic deployment)

## Environment Configuration

### Environment URLs

Update these URLs in your values files to match your actual domains:

```yaml
# values-prod.yaml
ingress:
  hosts:
    - host: your-actual-prod-domain.com

# values-beta.yaml  
ingress:
  hosts:
    - host: beta.your-actual-domain.com

# values-dev.yaml
ingress:
  hosts:
    - host: dev.your-actual-domain.com
```

### Environment Secrets

Add these secrets to each environment:

#### All Environments
```
GITHUB_ID=your-github-app-id
GITHUB_SECRET=your-github-app-secret
GITHUB_TOKEN=your-github-token
NEXTAUTH_SECRET=your-nextauth-secret
DATABASE_URL=your-database-connection-string
```

#### Kubernetes Secrets (per environment)
```
# Production
PROD_K8S_SERVER=https://your-prod-cluster
PROD_K8S_TOKEN=your-prod-service-account-token

# Staging  
STAGING_K8S_SERVER=https://your-staging-cluster
STAGING_K8S_TOKEN=your-staging-service-account-token

# Development
DEV_K8S_SERVER=https://your-dev-cluster
DEV_K8S_TOKEN=your-dev-service-account-token
```

## How It Works

### Automatic Deployments

When you push to tracked branches:

1. **Docker image** is built and tagged
2. **GitHub deployment** is created
3. **Deployment status** is set to "in progress"
4. **Helm chart** is deployed to Kubernetes
5. **Deployment status** is updated to "success" or "failure"
6. **Environment URL** is linked to the deployment

### Environment Visibility

After deployment, you'll see in the GitHub UI:

#### Repository Sidebar
```
🟢 prod - Active
   └── https://your-prod-domain.com
   
🟡 beta - Active  
   └── https://beta.your-domain.com
   
🔵 dev - Active
   └── https://dev.your-domain.com
```

#### Deployments Tab
- Deployment history for each environment
- Status (success/failure/in progress)
- Direct links to deployed applications
- Commit SHA and branch information

### Branch → Environment Mapping

```
main branch     → prod environment    → production namespace
dev branch      → beta environment    → staging namespace  
feature branches → dev environment     → development namespace
```

## Protection Rules

### Production (`prod`)
- ✅ **Requires protected branch** (main only)
- ✅ **Requires reviewers** (recommended: 2)
- ✅ **Prevents self-review**
- ✅ **Dismisses stale reviews**

### Beta (`beta`)
- ✅ **Restricted to dev branch**
- ⚠️ **Optional reviewers** (recommended: 1)
- ✅ **Automatic deployment**

### Development (`dev`)
- ✅ **All branches allowed**
- ✅ **No reviewers required**
- ✅ **Immediate deployment**

## Deployment Workflow

### Automatic Flow
```
1. Push to branch
2. Build Docker image
3. Create GitHub deployment
4. Deploy to Kubernetes
5. Update deployment status
6. Environment shows as "Active" with URL
```

### Manual Flow
```
1. Go to Actions → Deploy to Kubernetes
2. Select environment (prod/beta/dev)
3. Enter image tag
4. Run workflow
5. Environment updates automatically
```

## Monitoring Deployments

### View Active Environments
- Check repository sidebar for active deployments
- Click environment URLs to access applications
- View deployment status and history

### Deployment History
1. Go to **repository** → **Deployments** tab
2. Filter by environment
3. View deployment details, logs, and status

### Troubleshooting Failed Deployments
1. Check **Actions** tab for workflow logs
2. Review **Deployments** tab for error details
3. Use manual deployment workflow to retry
4. Check Kubernetes cluster status

## Advanced Configuration

### Custom Environment URLs

To use dynamic URLs (e.g., feature branch URLs):

```yaml
# In deployment workflow
ENVIRONMENT_URL="https://${SANITIZED_BRANCH}.your-domain.com"
```

### Multiple Clusters

Configure different clusters per environment:

```yaml
# Production cluster
PROD_K8S_SERVER: https://prod-cluster.example.com
PROD_K8S_TOKEN: prod-token

# Staging cluster  
STAGING_K8S_SERVER: https://staging-cluster.example.com
STAGING_K8S_TOKEN: staging-token
```

### Environment Variables

Set environment-specific variables:

```yaml
# Production
NODE_ENV: production
LOG_LEVEL: warn

# Development
NODE_ENV: development  
LOG_LEVEL: debug
```

## Best Practices

### Security
- ✅ Use environment-specific secrets
- ✅ Require reviews for production
- ✅ Limit branch access per environment
- ✅ Rotate tokens regularly

### Deployment Strategy
- ✅ Test in dev environment first
- ✅ Promote through beta before production
- ✅ Use feature flags for risky changes
- ✅ Monitor deployment status

### Monitoring
- ✅ Set up alerts for failed deployments
- ✅ Monitor application health post-deployment
- ✅ Track deployment frequency and success rate
- ✅ Review deployment logs regularly

## Troubleshooting

### Environment Not Showing
- Verify environment exists in Settings → Environments
- Check deployment workflow completed successfully
- Ensure deployment status was set correctly

### Wrong Environment URL
- Update values files with correct domains
- Re-run deployment workflow
- Check environment configuration

### Deployment Stuck "In Progress"
- Check workflow logs for errors
- Verify Kubernetes cluster connectivity
- Manual deployment status update may be needed

### Permission Issues
- Verify `deployments: write` permission in workflow
- Check environment protection rules
- Ensure proper GitHub token permissions 