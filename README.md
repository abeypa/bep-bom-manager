# BOM Manager

A Bill of Materials (BOM) management system for tracking components, assemblies, and inventory.

## Quick Start

```bash
npm install
npm run dev
```

## Features

- Manual historical price entry with custom dates
- Admin access hardening
- Part detail view with audit trails

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Base URL for Supabase API | https://your-supabase-url |

## Documentation

- [API Reference](./docs/api.md)
- [Architecture](./docs/architecture.md)
- [Changelog](./docs/changelog.md)
- [ADR-001](./docs/adr-001.md)
- [AI‑Friendly Docs](./docs/llms.txt)

## License

MITech Stack

- **Backend**: Node.js with Express
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL with Supabase

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/bom-manager.git
   cd bom-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Set up database:
   ```bash
   # Run database migrations
   npm run db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
bom-manager/
├── src/
│   ├── api/          # API routes and controllers
│   ├── models/       # Database models
│   ├── services/     # Business logic
│   ├── middleware/   # Express middleware
│   └── utils/        # Utility functions
├── client/           # Frontend React application
├── docs/             # Documentation
└── tests/            # Test files
```

## Development

- Run tests: `npm test`
- Build for production: `npm run build`
- Run in production: `npm start`

## License

MIT
