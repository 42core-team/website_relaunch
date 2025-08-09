# GitHub Environments Setup for API

This guide explains how to set up GitHub environments for the CORE API deployment with proper secret management.

## Creating GitHub Environments

### Step 1: Navigate to Repository Settings

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. In the left sidebar, click on **Environments**

### Step 2: Create API Development Environment

1. Click **New environment**
2. Name: `api-dev`
3. Configure the following settings:

#### Environment Protection Rules
- **Deployment branches**: `dev` branch only
- **Required reviewers**: None (for development)
- **Wait timer**: 0 minutes

#### Environment Secrets
Add the following secrets for development:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `DB_HOST` | Development database host | `dev-postgres.example.com` |
| `DB_USER` | Database username | `api_dev_user` |
| `DB_PASSWORD` | Database password | `secure_dev_password` |
| `DB_NAME` | Development database name | `core_api_dev` |
| `DB_SCHEMA` | Database schema | `public` |
| `DB_URL` | Full database connection URL | `postgresql://user:pass@host:port/db?sslmode=require` |
| `API_SECRET_ENCRYPTION_KEY` | Secret key for API encryption | `your-secret-key-here` |

### Step 3: Create API Production Environment

1. Click **New environment**
2. Name: `api-prod`
3. Configure the following settings:

#### Environment Protection Rules
- **Deployment branches**: `main` branch only
- **Required reviewers**: 1-2 team members (recommended)
- **Wait timer**: 5 minutes (optional safety delay)

#### Environment Secrets
Add the following secrets for production:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `DB_HOST` | Production database host | `prod-postgres.example.com` |
| `DB_USER` | Database username | `api_prod_user` |
| `DB_PASSWORD` | Database password | `very_secure_prod_password` |
| `DB_NAME` | Production database name | `core_api_prod` |
| `DB_SCHEMA` | Database schema | `public` |
| `DB_URL` | Full database connection URL | `postgresql://user:pass@host:port/db?sslmode=require` |
| `API_SECRET_ENCRYPTION_KEY` | Encryption key (32 chars) | `prod_encryption_key_32_characters` |

## Security Best Practices

### Database Credentials
- Use separate database users for each environment
- Grant minimal required permissions
- Use strong, unique passwords
- Consider using managed database services with IAM authentication



### Encryption Key
- Generate cryptographically secure random keys
- Use different keys for each environment
- Store securely and never commit to version control
- Consider using key management services

## Environment Configuration Examples

### Development Environment (`api-dev`)
```bash
# Database Configuration
DB_HOST=dev-postgres.internal.company.com
DB_USER=api_dev
DB_PASSWORD=dev_secure_password_123
DB_NAME=core_api_development
DB_SCHEMA=public
DB_URL=postgresql://api_dev:dev_secure_password_123@dev-postgres.internal.company.com:5432/core_api_development?sslmode=require

# Application Configuration  
API_SECRET_ENCRYPTION_KEY=dev_encryption_key_32_characters
```

### Production Environment (`api-prod`)
```bash
# Production Environment Variables
DB_HOST=prod-postgres.internal.company.com
DB_USER=api_prod
DB_PASSWORD=super_secure_prod_password_456
DB_NAME=core_api_production
DB_SCHEMA=public
DB_URL=postgresql://api_prod:super_secure_prod_password_456@prod-postgres.internal.company.com:5432/core_api_production?sslmode=require
API_SECRET_ENCRYPTION_KEY=prod_encryption_key_32_characters
```

## Verification

After setting up the environments, verify the configuration:

1. **Check Environment List**:
   - Repository → Settings → Environments
   - Confirm `api-dev` and `api-prod` are listed

2. **Verify Secrets**:
   - Click on each environment
   - Confirm all required secrets are present
   - Secrets should show as "Set" (values are hidden)

3. **Test Deployment**:
   - Push to `dev` branch → Should deploy to `api-dev` environment
   - Push to `main` branch → Should deploy to `api-prod` environment

## Troubleshooting

### Common Issues

1. **Deployment fails with missing secrets**:
   - Check that all required secrets are set in the correct environment
   - Verify secret names match exactly (case-sensitive)

2. **Wrong environment selected**:
   - Verify branch protection rules
   - Check workflow environment mapping logic

3. **Access denied errors**:
   - Verify GitHub token permissions
   - Check database user permissions
   - Confirm network access between GitHub runners and database

### Environment Access

To check which environment a deployment is using:

1. Go to repository → Actions
2. Click on a workflow run
3. Look for "Environment: api-dev" or "Environment: api-prod" in the deployment step

## Benefits of Separate Environments

✅ **Secret Isolation**: Development and production secrets are completely separated  
✅ **Access Control**: Different approval requirements for each environment  
✅ **Audit Trail**: Clear visibility of deployments to each environment  
✅ **Branch Protection**: Automatic environment selection based on branch  
✅ **Rollback Safety**: Production deployments can require manual approval  

## Maintenance

### Regular Tasks
- **Monthly**: Rotate GitHub tokens
- **Quarterly**: Review and update database passwords
- **As needed**: Update encryption keys during security reviews
- **Continuously**: Monitor deployment logs and environment access 