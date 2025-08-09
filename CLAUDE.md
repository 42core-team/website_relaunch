# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a full-stack web application for the CORE game tournament platform with three main components:

### Frontend (Next.js + React)
- **Location**: `frontend/` directory  
- **Framework**: Next.js 15 with React 18, TypeScript, and TailwindCSS
- **UI Library**: HeroUI components
- **Authentication**: NextAuth.js with GitHub OAuth
- **Package Manager**: pnpm (migrated from npm)
- **Key Features**: Tournament management, team creation, event dashboard, wiki system

### Backend API (NestJS)
- **Location**: `api/` directory
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Passport.js with GitHub OAuth
- **Documentation**: Swagger API docs (development only)
- **Key Features**: User/team/event management, GitHub API integration

### Kubernetes Service (Go)
- **Location**: `k8s-service/` directory
- **Language**: Go 1.24.2
- **Purpose**: Kubernetes orchestration service for game instances
- **Key Dependencies**: Kubernetes client-go, RabbitMQ, Echo web framework

## Development Commands

### Frontend Commands
```bash
cd frontend/
pnpm install              # Install dependencies
pnpm dev                  # Run development server (Next.js with Turbo)
pnpm build               # Build for production
pnpm start               # Start production server
pnpm clone:wiki          # Clone wiki branches for content
```

### API Commands  
```bash
cd api/
npm install              # Install dependencies
npm run start:dev        # Run development server with watch mode
npm run build            # Build production bundle
npm run start:prod       # Start production server
npm run lint             # Run ESLint
npm run test             # Run Jest unit tests
npm run test:e2e         # Run end-to-end tests
npm run format           # Format code with Prettier
```

### Kubernetes Service Commands
```bash
cd k8s-service/
go mod tidy              # Install/update Go dependencies
go run cmd/server/main.go # Run development server
go build -o bin/server cmd/server/main.go # Build production binary
```

## Architecture Patterns

### Frontend Architecture
- **App Router**: Uses Next.js 13+ app directory structure
- **Context Management**: React Context for navbar state management
- **Authentication Flow**: NextAuth.js handles GitHub OAuth with backend API integration
- **Wiki System**: Dynamic markdown content rendering from multiple git branches
- **Tournament System**: Complex tournament bracket and team management UI

### Backend Architecture
- **Modular Structure**: NestJS modules for users, teams, events, authentication, and GitHub API
- **Entity Relationships**: TypeORM entities with proper relationships between users, teams, and events
- **Guard System**: Custom frontend guard for route protection
- **GitHub Integration**: Custom GitHub API client with comprehensive endpoint coverage

### Database Schema
Key entities include User, Team, Event, and Match with TypeORM relationships. The backend uses PostgreSQL with TypeORM migrations.

### Deployment Architecture
- **Containerization**: Docker multi-stage builds for both frontend and API
- **Kubernetes**: Helm charts for deployment to dev/staging/production environments
- **CI/CD**: GitHub Actions with self-hosted runners for automated deployment
- **Multi-Architecture**: Supports both AMD64 and ARM64 platforms

## Key Configuration Files

- `frontend/next.config.js`: Next.js configuration with standalone output for Docker
- `api/src/main.ts`: NestJS bootstrap configuration with Swagger setup
- `frontend/scripts/clone-wiki-branches.js`: Pre-build script for wiki content
- `k8s-service/internal/config/config.go`: Go service configuration management

## Development Workflow

1. **Environment Setup**: Different configurations for development, staging, and production environments
2. **Content Management**: Wiki content is dynamically pulled from multiple git branches during build
3. **Authentication Flow**: GitHub OAuth integration between frontend and backend
4. **Database Operations**: TypeORM handles database schema and migrations
5. **Deployment**: Automated multi-environment deployment via GitHub Actions and Helm

## Important Notes

- Frontend uses pnpm package manager, not npm
- API documentation is only available in development mode at `/api` endpoint
- Wiki content requires running the clone script before building frontend
- The k8s-service handles game instance orchestration in Kubernetes clusters
- All components support containerized deployment with multi-architecture Docker images