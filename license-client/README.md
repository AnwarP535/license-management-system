# License Client

React frontend for the License Management System.

## Features

- React with TypeScript
- Material UI (MUI) for modern UI components
- React Hook Form for form handling
- Zod for schema validation
- React Router for navigation
- Axios for API calls

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API base URL
```

3. Start development server:
```bash
npm run dev
```

## Development

```bash
# Start in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker

Build the Docker image:
```bash
docker build -t license-client .
```

Run the container:
```bash
docker run -p 80:80 license-client
```
