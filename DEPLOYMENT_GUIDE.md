# Frontend Deployment Guide

This guide explains how to set up and use the frontend deployment workflow with GitHub Actions and Kubernetes.

## Overview

The deployment system consists of:
- **GitHub Actions workflows** for building and deploying
- **Helm charts** for Kubernetes deployment
- **GitHub Environments** for managing secrets and approvals
- **Automated deployments** on push to main/dev branches

## Prerequisites

### 1. Self-Hosted Runners
- GitHub Actions self-hosted runners configured
- x64 architecture support
- Docker and kubectl installed on runners
- Access to GitHub Container Registry

### 2. Kubernetes Cluster
- A Kubernetes cluster with Helm 3.x installed
- nginx-ingress controller
- cert-manager for SSL certificates
- kubectl configured with cluster access

### 2. GitHub Repository Setup
- Repository with frontend code in `frontend/` directory
- GitHub Actions enabled
- Access to GitHub Container Registry
- Self-hosted runners configured with x64 architecture

## Setup Steps

### 1. Configure Self-Hosted Runners

#### Runner Requirements
- **Architecture**: x64 (amd64)
- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **Docker**: Latest version with buildx support
- **kubectl**: Latest version
- **Helm**: 3.x version
- **Git**: Latest version
- **Network**: Access to GitHub Container Registry and your Kubernetes clusters

#### Runner Setup
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://get.helm.sh/helm-v3.13.3-linux-amd64.tar.gz | tar xz
sudo mv linux-amd64/helm /usr/local/bin/helm

# Install Docker Buildx
docker buildx create --use
```

#### Register Runner
1. Go to your repository → Settings → Actions → Runners
2. Click "New self-hosted runner"
3. Follow the setup instructions for Linux x64
4. Ensure the runner has the `self-hosted` label

### 2. Configure GitHub Environments

#### Development Environment
1. Go to your repository → Settings → Environments
2. Create environment named `dev`
3. Add protection rules:
   - Required reviewers: 1
   - Wait timer: 0
4. Add environment variables:
   - `CLIENT_ID_GITHUB`: Your GitHub OAuth app client ID for development
   - `BACKEND_URL`: Your development backend API URL (e.g., https://api-dev.coregame.de)
5. Add secrets:
   - `KUBECONFIG_DATA`: Base64 encoded kubeconfig for dev cluster
   - `NEXTAUTH_SECRET`: Your development NextAuth secret
   - `CLIENT_SECRET_GITHUB`: Your GitHub OAuth app client secret for development
   - `BACKEND_SECRET`: Your development backend API secret

#### Production Environment
1. Create environment named `prod`
2. Add protection rules:
   - Required reviewers: 2
   - Wait timer: 0
3. Add environment variables:
   - `CLIENT_ID_GITHUB`: Your GitHub OAuth app client ID for production
   - `BACKEND_URL`: Your production backend API URL (e.g., https://api.coregame.de)
4. Add secrets:
   - `KUBECONFIG_DATA`: Base64 encoded kubeconfig for prod cluster
   - `NEXTAUTH_SECRET`: Your production NextAuth secret
   - `CLIENT_SECRET_GITHUB`: Your GitHub OAuth app client secret for production
   - `BACKEND_SECRET`: Your production backend API secret

### 3. Prepare Kubernetes Cluster

#### Create Namespaces
```bash
kubectl create namespace development
kubectl create namespace production
```

#### Install Required Components
```bash
# Install nginx-ingress
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx

# Install cert-manager
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true
```

#### Create Cluster Issuers
```yaml
# staging-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
    - http01:
        ingress:
          class: nginx

# production-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

### 4. Configure DNS
- Point `dev.coregame.de` to your dev cluster
- Point `coregame.de` to your prod cluster
- Point `api-dev.coregame.de` to your dev backend cluster
- Point `api.coregame.de` to your prod backend cluster

### 5. Environment Variables Configuration

The frontend application requires several environment variables to function properly. These are configured in the Helm values files and can be overridden via GitHub Environment variables.

#### Required Environment Variables

| Variable | Description | Example | Type |
|----------|-------------|---------|------|
| `NEXTAUTH_URL` | The public URL for NextAuth.js | `https://dev.coregame.de` | Environment Variable |
| `CLIENT_ID_GITHUB` | GitHub OAuth app client ID | `your-github-client-id` | Environment Variable |
| `BACKEND_URL` | Backend API base URL | `https://api-dev.coregame.de` | Environment Variable |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` | Environment Variable |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js session encryption | `your-secret-key` | **Secret** |
| `CLIENT_SECRET_GITHUB` | GitHub OAuth app client secret | `your-github-client-secret` | **Secret** |
| `BACKEND_SECRET` | Backend API authentication secret | `your-backend-secret` | **Secret** |

#### Setting Up GitHub OAuth App

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create a new OAuth App for each environment:
   - **Development**: `https://dev.coregame.de`
   - **Production**: `https://coregame.de`
3. Copy the Client ID and Client Secret
4. Add them to the respective GitHub Environment variables

#### Setting Up Backend API

Ensure your backend API is accessible at the configured URLs and has the correct authentication secrets configured.

## Workflow Usage

### Automatic Deployment
The system automatically deploys when you push to:
- `main` branch → Production environment
- `dev` branch → Development environment

### Manual Deployment
1. Go to Actions → "Deploy Frontend"
2. Click "Run workflow"
3. Select environment (dev/prod)
4. Enter image tag (e.g., `main`, `dev`, `latest`)
5. Click "Run workflow"

### Building Images
Images are automatically built on:
- Push to any branch
- Pull requests
- Manual trigger

## Monitoring Deployments

### GitHub Actions
- Check the Actions tab for build and deployment status
- View detailed logs for each step
- See deployment summaries in the workflow

### Kubernetes
```bash
# Check deployment status
kubectl get pods -n development
kubectl get pods -n production

# View logs
kubectl logs -n development -l app.kubernetes.io/name=frontend
kubectl logs -n production -l app.kubernetes.io/name=frontend

# Check ingress
kubectl get ingress -n development
kubectl get ingress -n production
```

### Helm
```bash
# List releases
helm list -n development
helm list -n production

# Check release status
helm status <release-name> -n <namespace>
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
- Check Dockerfile syntax
- Verify pnpm dependencies
- Check GitHub Actions logs

#### 2. Deployment Failures
- Verify kubeconfig is correct
- Check namespace exists
- Verify image exists in registry
- Check Helm chart syntax

#### 3. Ingress Issues
- Verify nginx-ingress is installed
- Check cert-manager is working
- Verify DNS is pointing to cluster

#### 4. Application Issues
- Check pod logs
- Verify environment variables
- Check NextAuth configuration

### Debug Commands
```bash
# Check all resources
kubectl get all -n <namespace>

# Describe specific resource
kubectl describe pod <pod-name> -n <namespace>

# Check events
kubectl get events -n <namespace>

# Test connectivity
kubectl port-forward svc/<service-name> 3000:3000 -n <namespace>
```

## Security Considerations

### Secrets Management
- Never commit secrets to repository
- Use GitHub Environments for secrets
- Rotate secrets regularly
- Use different secrets for dev/prod

### Network Security
- Use TLS for all external traffic
- Configure network policies if needed
- Monitor ingress logs

### Application Security
- Keep dependencies updated
- Use security scanning in CI/CD
- Monitor for vulnerabilities

## Scaling and Performance

### Development Environment
- Single replica for cost efficiency
- No autoscaling
- Minimal resources

### Production Environment
- Multiple replicas for high availability
- Horizontal Pod Autoscaler enabled
- Resource limits configured
- Monitoring and alerting

## Next Steps

1. Set up monitoring and alerting
2. Configure backup strategies
3. Implement blue-green deployments
4. Add security scanning
5. Set up performance monitoring 