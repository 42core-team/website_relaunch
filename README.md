# Getting Started

## Running the Website

For instructions on how to run the website, please head over to the [`frontend/README.md`](frontend/README.md).

# Docker Images

This project automatically builds multi-architecture Docker images for both AMD64 and ARM64 platforms.

## Image Tags

The following tagging strategy is used:

### Branch-based Tags
- **`main`** - Latest stable version from main branch
- **`dev`** - Latest development version from dev branch
- **`<branch-name>`** - Latest version from any other branch (e.g., `60-helm-chart`)
- **`latest`** - Alias for `main` branch

### SHA-based Tags
- **`<branch-name>-<short-sha>`** - Specific commit from a branch (e.g., `main-a1b2c3d`)

### Pull Request Tags
- Pull requests build images but don't push them (for testing only)

## Usage

Pull the latest stable image:
```bash
docker pull ghcr.io/your-org/your-repo:latest
```

Pull a specific branch:
```bash
docker pull ghcr.io/your-org/your-repo:dev
```

Pull a specific commit:
```bash
docker pull ghcr.io/your-org/your-repo:main-a1b2c3d
```

## Multi-Architecture Support

All images support both:
- `linux/amd64` (Intel/AMD 64-bit)
- `linux/arm64` (ARM 64-bit, including Apple Silicon)

Docker will automatically pull the correct architecture for your platform.

## Deployment Pipeline

This project includes an automated deployment pipeline that deploys to Kubernetes using Helm charts.

### Environments

- **🟢 Production** (`main` branch) → `production` namespace
- **🟡 Beta/Staging** (`dev` branch) → `staging` namespace
- **🔵 Development** (feature branches) → `development` namespace

### Automatic Deployment

When you push to any tracked branch:

1. **Docker image** is built for multiple architectures (AMD64/ARM64)
2. **Image is tagged** with branch name and commit SHA
3. **Helm chart** is deployed with environment-specific configuration
4. **Application** is automatically available at the configured domain

### Manual Deployment

You can also deploy manually:

1. Go to **Actions** → **Deploy to Kubernetes**
2. Select environment (`prod`, `beta`, `dev`)
3. Specify image tag to deploy
4. Run the workflow

### Configuration

See [`k8s/README.md`](k8s/README.md) for detailed setup instructions including:
- Kubernetes cluster configuration
- GitHub secrets setup
- Environment-specific values
- Troubleshooting guide

### Deployment Status

Each deployment provides detailed status information including:
- Deployed image tag
- Kubernetes resources created
- Health check results
- Access URLs

## GitHub Environments

This project uses GitHub Environments to track active deployments and provide easy access to deployed applications.

### Environment Overview

You can see active environments in the repository sidebar:

- **🟢 Production** - Live production environment
- **🟡 Beta/Staging** - Staging environment for testing
- **🔵 Development** - Development environment for feature testing

### Quick Setup

1. Go to **Actions** → **Setup GitHub Environments**
2. Click **"Run workflow"** to automatically create environments
3. Update domain URLs in values files
4. Configure environment secrets

### Features

- 📍 **Active deployment tracking** in GitHub UI
- 🔗 **Direct links** to deployed applications
- 🛡️ **Protection rules** for production deployments
- 📊 **Deployment history** and status monitoring
- 🔐 **Environment-specific secrets** management

For detailed setup instructions, see [`.github/ENVIRONMENTS.md`](.github/ENVIRONMENTS.md).
