# API Helm Chart

This Helm chart deploys the CORE backend API (NestJS application) to Kubernetes.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- Access to a container registry (GHCR)

## Installation

### Quick Start

```bash
# Install to development environment
# Note: Database config is set via environment variables, secrets are injected from GitHub environment "api-dev"
helm upgrade --install api-dev . \
  --namespace development \
  --values values-dev.yaml \
  --set image.tag=latest \
  --set env.DB_HOST="your-dev-db-host" \
  --set env.DB_USER="your-dev-db-user" \
  --set env.DB_NAME="your-dev-db-name" \
  --set env.DB_SCHEMA="your-dev-schema"
```

### Production Deployment

```bash
# Install to production environment  
# Note: Database config is set via environment variables, secrets are injected from GitHub environment "api-prod"
helm upgrade --install api-prod . \
  --namespace production \
  --values values-prod.yaml \
  --set image.tag=v1.0.0 \
  --set env.DB_HOST="your-prod-db-host" \
  --set env.DB_USER="your-prod-db-user" \
  --set env.DB_NAME="your-prod-db-name" \
  --set env.DB_SCHEMA="your-prod-schema"
```

## Configuration

### Environment Variables

The API requires the following environment variables to be configured in GitHub environments:

#### GitHub Environments
- **Development**: Configure secrets in `api-dev` environment
- **Production**: Configure secrets in `api-prod` environment

#### Required Configuration

**Environment Variables (set in values files or via --set):**
- `DB_HOST`: PostgreSQL database host
- `DB_USER`: Database username  
- `DB_NAME`: Database name
- `DB_SCHEMA`: Database schema

**Required Secrets (configured in GitHub environments):**
- `DB_PASSWORD`: Database password
- `DB_URL`: Full database connection URL (alternative to individual DB_* variables)
- `API_SECRET_ENCRYPTION_KEY`: Secret key for encrypting sensitive data

### Values Files

- `values.yaml`: Default configuration
- `values-dev.yaml`: Development environment settings
- `values-prod.yaml`: Production environment settings

### Ingress Configuration

The chart supports ingress configuration for external access:

```yaml
ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/enable-cors: "true"
  hosts:
    - host: api.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - hosts:
        - api.example.com
      secretName: api-example-com-tls
```

### Health Checks

The API includes health check endpoints:

- Liveness probe: `/health`
- Readiness probe: `/health`

### Autoscaling

Horizontal Pod Autoscaling is available:

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80
```

## Monitoring

The deployment includes resource limits and requests for proper resource management:

```yaml
resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 500m
    memory: 512Mi
```

## Uninstallation

```bash
helm uninstall api-dev --namespace development
helm uninstall api-prod --namespace production
``` 