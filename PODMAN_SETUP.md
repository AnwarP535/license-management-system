# Podman Setup Guide

This guide helps you set up and run the License Management System using Podman.

## Prerequisites

- Podman installed and configured
- Node.js 20+ installed
- npm installed

## Quick Start

### 1. Start PostgreSQL Database

```bash
# From the project root
./setup-postgres.sh
```

This script will:
- Check if Podman machine is running (start it if needed)
- Create and start PostgreSQL container
- Wait for database to be ready
- Verify connection

### 2. Verify Database is Running

```bash
# Check container status
podman ps | grep license-postgres

# Test database connection
podman exec license-postgres pg_isready -U postgres
```

### 3. Start Backend

```bash
cd license-backend
npm run start:dev
```

The backend will:
- Connect to PostgreSQL automatically
- Create database tables (TypeORM synchronize)
- Start on http://localhost:8080
- Swagger docs available at http://localhost:8080/api-docs

### 4. Start Frontend (in another terminal)

```bash
cd license-client
npm run dev
```

Frontend will be available at http://localhost:5173

## Podman Commands Reference

### Start PostgreSQL
```bash
./setup-postgres.sh
```

### Stop PostgreSQL
```bash
./stop-postgres.sh
```

### View PostgreSQL Logs
```bash
podman logs license-postgres
```

### Access PostgreSQL Shell
```bash
podman exec -it license-postgres psql -U postgres -d license_management
```

### Restart PostgreSQL Container
```bash
podman restart license-postgres
```

### Remove PostgreSQL Container (keeps data volume)
```bash
podman stop license-postgres
podman rm license-postgres
```

### Remove Everything (including data)
```bash
podman stop license-postgres
podman rm license-postgres
podman volume rm postgres_data
```

## Troubleshooting

### Podman Machine Not Running

```bash
# Check machine status
podman machine list

# Start machine if stopped
podman machine start

# If machine doesn't exist, create it
podman machine init
podman machine start
```

### Connection Refused Error

```bash
# Restart Podman machine
podman machine stop
podman machine start

# Wait a few seconds, then try again
./setup-postgres.sh
```

### Port 5432 Already in Use

```bash
# Check what's using the port
lsof -i :5432

# Stop the conflicting service or change port in:
# - setup-postgres.sh (change -p 5432:5432)
# - license-backend/.env (change DB_PORT)
```

### Database Connection Error in Backend

1. Verify PostgreSQL is running:
   ```bash
   podman ps | grep license-postgres
   ```

2. Check database credentials in `license-backend/.env`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=license_management
   ```

3. Test connection manually:
   ```bash
   podman exec license-postgres psql -U postgres -d license_management -c "SELECT 1;"
   ```

## Environment Variables

### Backend (.env)
Located in `license-backend/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=license_management
JWT_SECRET=your-secret-key-change-in-production-min-32-chars
PORT=8080
NODE_ENV=development
```

### Frontend (.env)
Located in `license-client/.env`:
```
VITE_API_BASE_URL=http://localhost:8080
```

## Application URLs

- **Backend API**: http://localhost:8080
- **Swagger Documentation**: http://localhost:8080/api-docs
- **Frontend**: http://localhost:5173

## Next Steps

1. Access Swagger docs to explore API endpoints
2. Create an admin user (you'll need to add this via database or API)
3. Login through the frontend
4. Start managing licenses!
