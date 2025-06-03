# Kubernetes Deployment

This directory contains Helm charts and deployment configurations for the application.

## Structure

```
k8s/
├── helm/
│   ├── Chart.yaml              # Helm chart metadata
│   ├── values.yaml             # Default values
│   ├── values-prod.yaml        # Production environment values
│   ├── values-beta.yaml        # Beta/staging environment values
│   ├── values-dev.yaml         # Development environment values
│   └── templates/
│       ├── deployment.yaml     # Kubernetes deployment
│       ├── service.yaml        # Kubernetes service
│       ├── ingress.yaml        # Ingress configuration
│       └── hpa.yaml            # Horizontal Pod Autoscaler
└── README.md                   # This file
```

## Environment Configuration

### Production (main branch)
- **Namespace**: `production`
- **Values file**: `values-prod.yaml`
- **Replicas**: 3 (with HPA: 3-10)
- **Resources**: 1 CPU, 1Gi memory
- **Domain**: `your-prod-domain.com`

### Beta/Staging (dev branch)
- **Namespace**: `staging`
- **Values file**: `values-beta.yaml`
- **Replicas**: 2 (with HPA: 2-5)
- **Resources**: 500m CPU, 512Mi memory
- **Domain**: `beta.your-domain.com`

### Development (feature branches)
- **Namespace**: `development`
- **Values file**: `values-dev.yaml`
- **Replicas**: 1 (no HPA)
- **Resources**: 250m CPU, 256Mi memory
- **Domain**: `dev.your-domain.com`

## Setup Instructions

### 1. Configure Kubernetes Clusters

You need to set up the following GitHub secrets for each environment:

#### Production
```bash
PROD_K8S_SERVER=https://your-prod-cluster-api-server
PROD_K8S_TOKEN=your-prod-service-account-token
```

#### Staging
```bash
STAGING_K8S_SERVER=https://your-staging-cluster-api-server
STAGING_K8S_TOKEN=your-staging-service-account-token
```

#### Development
```bash
DEV_K8S_SERVER=https://your-dev-cluster-api-server
DEV_K8S_TOKEN=your-dev-service-account-token
```

### 2. Update Values Files

Edit the environment-specific values files to match your setup:

1. **Update domains** in `values-*.yaml` files
2. **Configure environment variables** (database URLs, API keys, etc.)
3. **Adjust resource limits** based on your cluster capacity
4. **Configure ingress** annotations for your ingress controller

### 3. Configure GitHub Environments

Set up GitHub environments for deployment protection:

1. Go to your repository → Settings → Environments
2. Create environments: `prod`, `beta`, `dev`
3. Configure protection rules (e.g., require reviews for production)
4. Add environment-specific secrets

### 4. Test Deployment

You can test deployments manually using the deployment workflow:

1. Go to Actions → Deploy to Kubernetes
2. Click "Run workflow"
3. Select environment and image tag
4. Run the workflow

## Deployment Process

### Automatic Deployment

The deployment happens automatically when you push to tracked branches:

1. **Push to `main`** → Deploys to production
2. **Push to `dev`** → Deploys to beta/staging
3. **Push to feature branch** → Deploys to development

### Manual Deployment

Use the manual deployment workflow for:
- Hotfixes
- Rollbacks
- Testing specific image tags

### Image Tags

The deployment uses the following image tag format:
- `<branch-name>-<short-sha>` (e.g., `main-a1b2c3d`)

## Monitoring and Troubleshooting

### Check Deployment Status

```bash
# Check pods
kubectl get pods -n <namespace>

# Check services
kubectl get services -n <namespace>

# Check ingress
kubectl get ingress -n <namespace>

# Check Helm releases
helm list -n <namespace>
```

### View Logs

```bash
# Application logs
kubectl logs -f deployment/<release-name> -n <namespace>

# Helm deployment logs
helm status <release-name> -n <namespace>
```

### Rollback

```bash
# Rollback to previous version
helm rollback <release-name> -n <namespace>

# Rollback to specific revision
helm rollback <release-name> <revision> -n <namespace>
```

## Security Considerations

1. **Secrets Management**: Use Kubernetes secrets or external secret managers
2. **RBAC**: Configure proper role-based access control
3. **Network Policies**: Implement network segmentation
4. **Image Security**: Scan images for vulnerabilities
5. **TLS**: Use proper TLS certificates (Let's Encrypt configured)

## Customization

### Adding New Environments

1. Create new values file: `values-<env>.yaml`
2. Update deployment workflow to recognize the new environment
3. Configure GitHub environment and secrets
4. Test deployment

### Modifying Resources

Edit the appropriate values file and push changes. The deployment will automatically use the new configuration.

### Adding New Kubernetes Resources

1. Create new template in `templates/` directory
2. Add corresponding values in `values.yaml`
3. Test with `helm template` command
4. Deploy and verify

## Troubleshooting Common Issues

### Image Pull Errors
- Verify image exists in registry
- Check image tag format
- Ensure proper registry authentication

### Resource Constraints
- Check cluster resource availability
- Adjust resource requests/limits
- Scale down other applications if needed

### Ingress Issues
- Verify ingress controller is running
- Check DNS configuration
- Validate TLS certificates

### Database Connection Issues
- Verify database URL format
- Check network connectivity
- Validate credentials and permissions 