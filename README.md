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
