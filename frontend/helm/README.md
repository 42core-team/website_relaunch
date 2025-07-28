# Frontend Helm Chart

This Helm chart deploys the CORE frontend application to Kubernetes.

## Prerequisites

- Self-hosted GitHub Actions runners with x64 architecture
- Kubernetes cluster with Helm 3.x
- kubectl configured to access the cluster
- Docker registry access (GitHub Container Registry)
- Ingress controller (nginx-ingress)
- cert-manager (for SSL certificates)

## Configuration

### Environment Variables

The following environment variables can be configured in the values files:

#### NextAuth Configuration

- `NEXTAUTH_URL`: The public URL for NextAuth.js
- `NEXTAUTH_SECRET`: Secret for NextAuth.js session encryption

#### GitHub OAuth Configuration

- `CLIENT_ID_GITHUB`: GitHub OAuth app client ID
- `CLIENT_SECRET_GITHUB`: GitHub OAuth app client secret (stored as Kubernetes secret)

#### Backend API Configuration

- `BACKEND_URL`: Backend API base URL
- `BACKEND_SECRET`: Backend API authentication secret (stored as Kubernetes secret)

#### Next.js Configuration

- `NODE_ENV`: Set to "production" for all environments
- `NEXT_TELEMETRY_DISABLED`: Disable Next.js telemetry (set to "1")

#### NextAuth Configuration

- `NEXTAUTH_URL`: The public URL for NextAuth.js
- `NEXTAUTH_SECRET`: Secret for NextAuth.js session encryption (stored as Kubernetes secret)

### Secrets Required

Set up the following secrets in GitHub Environments:

#### Development Environment (`dev`)

- `KUBECONFIG_DATA`: Base64 encoded kubeconfig for dev cluster
- `NEXTAUTH_SECRET`: Development NextAuth secret (GitHub Secret)
- `CLIENT_ID_GITHUB`: Development GitHub OAuth client ID (Environment Variable)
- `CLIENT_SECRET_GITHUB`: Development GitHub OAuth client secret (GitHub Secret)
- `BACKEND_URL`: Development backend API URL (Environment Variable)
- `BACKEND_SECRET`: Development backend API secret (GitHub Secret)

#### Production Environment (`prod`)

- `KUBECONFIG_DATA`: Base64 encoded kubeconfig for prod cluster
- `NEXTAUTH_SECRET`: Production NextAuth secret (GitHub Secret)
- `CLIENT_ID_GITHUB`: Production GitHub OAuth client ID (Environment Variable)
- `CLIENT_SECRET_GITHUB`: Production GitHub OAuth client secret (GitHub Secret)
- `BACKEND_URL`: Production backend API URL (Environment Variable)
- `BACKEND_SECRET`: Production backend API secret (GitHub Secret)

## Deployment

### Manual Deployment

```bash
# Deploy to development
helm upgrade --install frontend-dev . \
  --namespace development \
  --values values-dev.yaml \
  --set image.tag=dev

# Deploy to production
helm upgrade --install frontend-prod . \
  --namespace production \
  --values values-prod.yaml \
  --set image.tag=main
```

### GitHub Actions Deployment

The deployment is automated via GitHub Actions:

1. **Build Workflow** (`frontend-build.yml`): Builds Docker image on push/PR
2. **Deploy Workflow** (`frontend-deploy.yml`): Manual deployment with environment selection
3. **Auto Deploy Workflow** (`frontend-auto-deploy.yml`): Automatic deployment on push to main/dev

## Architecture

- **Development**: Single replica, no autoscaling
- **Production**: 2+ replicas with HPA enabled
- **Ingress**: TLS-enabled with cert-manager
- **Health Checks**: Liveness and readiness probes configured

## Monitoring

- Pod health via Kubernetes probes
- Application metrics via Next.js telemetry (disabled)
- Ingress metrics via nginx-ingress

## Troubleshooting

### Common Issues

1. **Image Pull Errors**: Ensure `ghcr-secret` exists in namespace
2. **Ingress Issues**: Verify cert-manager and nginx-ingress are installed
3. **Health Check Failures**: Check application logs and probe configuration

### Useful Commands

```bash
# Check deployment status
kubectl get pods -n <namespace> -l app.kubernetes.io/name=frontend

# View logs
kubectl logs -n <namespace> -l app.kubernetes.io/name=frontend

# Check ingress
kubectl get ingress -n <namespace>

# Helm status
helm status <release-name> -n <namespace>
```
