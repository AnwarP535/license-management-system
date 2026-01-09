# License Backend

NestJS backend for the License Management System.

## Features

- RESTful API with OpenAPI/Swagger documentation
- PostgreSQL database with TypeORM
- JWT authentication for frontend
- API Key authentication for SDK
- Role-based access control (Admin/Customer)
- Complete CRUD operations for customers, subscription packs, and subscriptions

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Start PostgreSQL database (using Docker):
```bash
docker run --name license-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=license_management -p 5432:5432 -d postgres:15
```

4. Run migrations (TypeORM will auto-sync in development):
```bash
npm run start:dev
```

## Development

```bash
# Start in development mode
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8080/api-docs

## Docker

Build the Docker image:
```bash
docker build -t license-backend .
```

Run the container:
```bash
docker run -p 8080:8080 --env-file .env license-backend
```
