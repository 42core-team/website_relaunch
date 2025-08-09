# API Environment Configuration

This document describes the different environments available for the CORE API deployment.

## Environments Overview

| Environment | Branch | Namespace | URL | Auto-Deploy |
|-------------|--------|-----------|-----|-------------|
| Development | `dev` | `development` | `https://dev.api.coregame.de` | ✅ On push |
| Production | `main` | `production` | `https://api.coregame.de` | ✅ On push |

## Environment Details

### 🛠️ Development Environment
- **Purpose**: Active development and testing
- **Branch**: `dev`
- **Namespace**: `development`
- **URL**: `https://dev.api.coregame.de`
- **Resources**: 
  - CPU: 250m requests, 500m limits
  - Memory: 256Mi requests, 512Mi limits
- **Replicas**: 1 (no autoscaling)
- **Database**: Development database
- **Deployment**: Automatic on push to `dev` branch

### 🚀 Production Environment
- **Purpose**: Live production API
- **Branch**: `main`
- **Namespace**: `production`
- **URL**: `https://api.coregame.de`
- **Resources**: 
  - CPU: 500m requests, 1000m limits
  - Memory: 512Mi requests, 1Gi limits
- **Replicas**: 2-5 (with autoscaling)
- **Database**: Production database
- **Deployment**: Automatic on push to `main` branch

## Environment Configuration

Each environment requires both environment variables and secrets to be configured:

### GitHub Environments
- **Development**: `api-dev` environment
- **Production**: `api-prod` environment

### Database Configuration

**Environment Variables (set in values files or via --set):**
- `DB_HOST` - Database host (environment-specific)
- `DB_USER` - Database username
- `DB_NAME` - Database name (environment-specific)
- `DB_SCHEMA` - Database schema

**Required Secrets (configured in GitHub environments):**
- `DB_PASSWORD` - Database password
- `DB_URL` - Full database connection URL (alternative to individual DB_* variables)
- `API_SECRET_ENCRYPTION_KEY` - Secret key for API encryption

## CORS Configuration

Each environment is configured to allow CORS from its corresponding frontend:

- **Development**: `https://dev.coregame.de`
- **Production**: `https://coregame.de`

## SSL/TLS Configuration

All environments use Let's Encrypt certificates with automatic renewal:

- **Development**: `dev-api-coregame-de-tls`
- **Production**: `api-coregame-de-tls`

## Deployment Workflow

### Automatic Deployments

1. **Development**: Push to `dev` branch → Auto-deploy to development
2. **Production**: Push to `main` branch → Auto-deploy to production

### Manual Deployments

Use GitHub Actions workflow dispatch with environment selection:

1. Go to Actions → "Build API"
2. Click "Run workflow"
3. Select target environment: `dev` or `prod`
4. Specify image tag (defaults to `latest`)

## Environment Promotion

Recommended flow for changes:

```
dev → main
 ↓      ↓
dev   production
```

1. **Development**: Test features and fixes
2. **Production**: Deploy stable, tested code

## Health Checks

All environments include health check endpoints:

- **Liveness Probe**: `GET /health` (30s delay, 10s interval)
- **Readiness Probe**: `GET /health` (5s delay, 5s interval)

## Monitoring

Resource usage and scaling metrics are available for all environments:

- CPU utilization
- Memory usage
- Request rate
- Response times
- Error rates

## Database Separation

Each environment should use separate databases:

- **Development**: `core_api_dev`
- **Production**: `core_api_prod`

This ensures data isolation and prevents accidental data corruption during testing.

## GitHub Environment Configuration

The API uses dedicated GitHub environments for secret management:

- **Development**: `api-dev` environment (secrets for development database and services)
- **Production**: `api-prod` environment (secrets for production database and services)

### Environment Benefits

✅ **Secret Isolation**: Development and production secrets are completely separated  
✅ **Access Control**: Different approval requirements for production deployments  
✅ **Audit Trail**: Clear visibility of which environment secrets are used  
✅ **Branch Protection**: Automatic environment selection based on source branch  
✅ **Deployment Safety**: Production can require manual approval and wait timers  

For detailed setup instructions, see [GitHub Environments Setup](github-environments-setup.md). 