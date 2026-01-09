# Database Setup Guide

## Option 1: Using Docker (Recommended - Easiest)

If you have Docker installed:

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify it's running
docker ps | grep postgres

# The database will be available at localhost:5432
```

To stop:
```bash
docker-compose down
```

## Option 2: Install PostgreSQL Locally (macOS)

### Using Homebrew:

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb license_management

# Or connect and create manually
psql postgres
CREATE DATABASE license_management;
\q
```

### Verify Installation:

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Test connection
psql -U postgres -d license_management
```

## Option 3: Install PostgreSQL Locally (Linux)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb license_management
```

## Option 4: Install PostgreSQL Locally (Windows)

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. During installation, set password to `postgres` (or update `.env` file)
4. Create database using pgAdmin or command line:
   ```sql
   CREATE DATABASE license_management;
   ```

## Verify Connection

After setting up PostgreSQL, verify the connection matches your `.env` file:

```bash
# Check .env file in license-backend directory
cat license-backend/.env

# Should have:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=postgres
# DB_NAME=license_management
```

## Troubleshooting

### Connection Refused
- Make sure PostgreSQL is running
- Check if port 5432 is available: `lsof -i :5432`
- Verify credentials in `.env` match your PostgreSQL setup

### Authentication Failed
- Verify username and password in `.env` match your PostgreSQL credentials
- For local PostgreSQL, you may need to update `pg_hba.conf` to allow local connections

### Database Does Not Exist
- Create the database: `createdb license_management` or use SQL: `CREATE DATABASE license_management;`
