# Quick Start Guide

## 🚀 Run Everything with One Command

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start all services
docker-compose up -d

# 3. View logs (optional)
docker-compose logs -f
```

## ✅ Verify Services Are Running

```bash
# Check all containers
docker-compose ps

# Test backend
curl http://localhost:8080

# Test frontend
curl http://localhost
```

## 🌐 Access the Application

- **Frontend**: http://localhost (or http://localhost:80)
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/api-docs

## 📝 Environment Variables

The `.env.example` file contains all configuration options. Copy it to `.env` and modify as needed:

```bash
cp .env.example .env
```

Key variables:
- `DB_PASSWORD` - PostgreSQL password (default: postgres)
- `JWT_SECRET` - Secret key for JWT tokens (change in production!)
- `BACKEND_PORT` - Backend API port (default: 8080)
- `FRONTEND_PORT` - Frontend port (default: 80)
- `VITE_API_BASE_URL` - Backend URL for frontend (default: http://localhost:8080)

## 🛑 Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove all data (including database)
docker-compose down -v
```

## 🔧 Useful Commands

```bash
# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Restart a specific service
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build

# Access database
docker-compose exec postgres psql -U postgres -d license_management
```

## 🐛 Troubleshooting

### Port Already in Use

If ports 80, 8080, or 5432 are already in use, update `.env`:

```bash
BACKEND_PORT=8081
FRONTEND_PORT=3000
DB_PORT=5433
```

Then update `VITE_API_BASE_URL` to match:
```bash
VITE_API_BASE_URL=http://localhost:8081
```

### Database Connection Issues

1. Check if PostgreSQL container is running:
```bash
docker-compose ps postgres
```

2. Check database logs:
```bash
docker-compose logs postgres
```

3. Verify environment variables:
```bash
docker-compose exec backend env | grep DB_
```

### Frontend Can't Connect to Backend

1. Verify backend is running:
```bash
curl http://localhost:8080
```

2. Check `VITE_API_BASE_URL` in `.env` matches backend port

3. Rebuild frontend with new environment:
```bash
docker-compose up -d --build frontend
```

## 📚 Next Steps

1. Visit http://localhost:8080/api-docs to explore the API
2. Access the frontend at http://localhost
3. Create your first admin user (you'll need to add this via database or API)
4. Start managing licenses!
