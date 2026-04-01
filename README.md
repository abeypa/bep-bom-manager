# BOM Manager

A Bill of Materials (BOM) management system for tracking components, assemblies, and inventory.

## Features

- **Component Management**: Track individual components with metadata
- **Assembly Tracking**: Create and manage product assemblies
- **Inventory Management**: Monitor stock levels and locations
- **Supplier Integration**: Manage vendor relationships and procurement
- **Reporting**: Generate BOM reports and analytics

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL with Supabase
- **Authentication**: JWT-based auth
- **API**: RESTful API design

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
