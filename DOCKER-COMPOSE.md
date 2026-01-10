# Docker Compose Setup Guide

This guide explains how to run all services using Docker Compose in development mode.

## Prerequisites

- Docker and Docker Compose (or Podman with docker-compose)
- At least 2GB of free disk space
- Git (if cloning the repository)

## Quick Start

### 1. Clone the Repository (if not already done)

```bash
git clone <repository-url>
cd license-management-system
```

### 2. Environment Variables (Optional)

The application works with default values, but you can customize them by creating a `.env` file:

```bash
# Copy example env file (if available)
cp .env.example .env

# Or create .env manually with these variables:
```

**Environment Variables:**

```bash
# Database Configuration
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=license_management
DB_PORT=5432

# Backend Configuration
BACKEND_PORT=8080
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000,http://localhost:80,http://localhost

# Frontend Configuration
FRONTEND_PORT=80
VITE_API_BASE_URL=http://localhost:8080

# Build Target (development or production)
BUILD_TARGET=development
```

**Note**: If you don't create a `.env` file, the application will use the default values shown above.

### 3. Build and Start All Services

Run this single command to build and start all services:

```bash
docker-compose up -d --build
```

Or if using Podman:

```bash
export DOCKER_CONFIG=/dev/null
podman compose up -d --build
```

**What this does:**
- Builds Docker images for backend and frontend
- Starts PostgreSQL database
- Starts NestJS backend (with auto-rebuild on file changes)
- Starts React frontend (with hot module replacement)
- All services run in detached mode (`-d`)

### 4. Verify Services are Running

Check the status of all services:

```bash
docker-compose ps
```

You should see all three services running:
- `license-postgres` - PostgreSQL database
- `license-backend` - NestJS backend API
- `license-frontend` - React frontend

### 5. Access the Application

Once all services are running, access them at:

- **Frontend**: http://localhost:3000 (or http://localhost:80)
- **Backend API**: http://localhost:8080
- **Swagger API Docs**: http://localhost:8080/api-docs
- **PostgreSQL**: localhost:5432

## Development Mode Features

### Automatic Rebuilds

The services are configured for development with automatic rebuilds:

- **Backend**: Uses `nest start --watch` - automatically recompiles TypeScript on file changes
- **Frontend**: Uses Vite dev server with HMR - automatically updates browser on file changes

### File Watching

Source code is mounted as volumes, so any changes you make to files will be immediately reflected:
- Backend changes in `./license-backend/src/` are automatically detected
- Frontend changes in `./license-client/src/` trigger hot reload

## Common Commands

### View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop Services

```bash
# Stop all services (keeps containers)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (deletes database data)
docker-compose down -v
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Rebuild After Code Changes

```bash
# Rebuild and restart all services
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

### Execute Commands in Containers

```bash
# Backend container
docker-compose exec backend sh
docker-compose exec backend npm run build

# Frontend container
docker-compose exec frontend sh
docker-compose exec frontend npm run build
```

## Troubleshooting

### Backend Login Not Working

If login fails after rebuild, bcrypt needs to be rebuilt. The entrypoint script handles this automatically, but if issues persist:

```bash
docker-compose exec backend sh -c "cd /app && rm -rf node_modules/bcrypt && npm install bcrypt --build-from-source"
docker-compose restart backend
```

### Port Already in Use

If ports are already in use, change them in `.env`:

```bash
BACKEND_PORT=8081
FRONTEND_PORT=3001
DB_PORT=5433
```

### Database Connection Issues

Ensure PostgreSQL is healthy before backend starts:

```bash
# Check database health
docker-compose ps postgres

# View database logs
docker-compose logs postgres
```

### Disk Space Issues

If you encounter "no space left on device" errors:

```bash
# Clean unused Docker resources
docker system prune -a

# Or with Podman
podman system prune -a
```

### Services Not Starting

1. Check logs for errors:
   ```bash
   docker-compose logs
   ```

2. Verify environment variables:
   ```bash
   docker-compose config
   ```

3. Rebuild from scratch:
   ```bash
   docker-compose down -v
   docker-compose up -d --build
   ```

## Service Details

### PostgreSQL Database

- **Image**: postgres:15
- **Port**: 5432 (configurable via `DB_PORT`)
- **Data Persistence**: Stored in `postgres_data` volume
- **Health Check**: Automatically checks if database is ready

### Backend (NestJS)

- **Framework**: NestJS with TypeScript
- **Port**: 8080 (configurable via `BACKEND_PORT`)
- **Watch Mode**: Enabled (`nest start --watch`)
- **Auto-rebuild**: Yes, on file changes
- **Entrypoint**: Automatically rebuilds bcrypt on startup

### Frontend (React + Vite)

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Port**: 80 (configurable via `FRONTEND_PORT`)
- **Hot Module Replacement**: Enabled
- **Auto-reload**: Yes, on file changes

## Production Mode

For production deployment, use the production docker-compose file:

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

**Note**: Production mode uses optimized builds without development tools and volumes.

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_USER` | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | `postgres` | PostgreSQL password |
| `DB_NAME` | `license_management` | Database name |
| `DB_PORT` | `5432` | PostgreSQL port |
| `BACKEND_PORT` | `8080` | Backend API port |
| `FRONTEND_PORT` | `80` | Frontend web server port |
| `NODE_ENV` | `development` | Node.js environment |
| `JWT_SECRET` | `your-secret-key-change-in-production` | JWT signing secret (change in production!) |
| `FRONTEND_URL` | `http://localhost:3000,http://localhost:80,http://localhost` | Allowed CORS origins |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend API URL for frontend |
| `BUILD_TARGET` | `development` | Docker build target stage |

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Review the main README.md for more details
